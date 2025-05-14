import React, {
  useCallback, useEffect, useRef, useState, forwardRef,
} from 'react';
import { Shape } from '../../../types';
import { useShapesStore } from '../../../stores/useShape';
import './Shape.scss';

interface Props {
  shape: Shape;
  zoom: number;
  onUpdate: (id: string, data: Partial<Shape>) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onDragging: (id: string) => void;
  onDragEnd?: () => void;
}

const ShapeComponent = forwardRef<HTMLDivElement, Props>(({
  shape, zoom, onUpdate, canvasRef, onDragging,
}, ref) => {
  const elRef = useRef<HTMLDivElement>(null);
  const updateRef = useRef<number | null>(null);
  const lastMoveRef = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>();
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });

  const {
    setFocusedShape, focusedShape, unit, onDelete,
  } = useShapesStore();

  const isFocused = focusedShape?.id === shape.id;
  const moveUnit = unit / 2;
  const THROTTLE_MS = 16;

  const assignRef = (el: HTMLDivElement) => {
    elRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  const px = (value: number | string) => `${value}px`;

  const convertUnits = useCallback((input: React.CSSProperties) => {
    const pixelFields: (keyof React.CSSProperties)[] = [
      'width', 'height', 'borderWidth', 'borderRadius', 'fontSize',
      'lineHeight', 'paddingBottom', 'paddingRight', 'paddingTop', 'paddingLeft',
    ];

    const newStyle: Record<string, any> = { ...input };
    pixelFields.forEach((field) => {
      const val = input[field];
      if (val !== undefined && typeof val !== 'string') {
        newStyle[field] = px(val);
      }
    });

    return newStyle;
  }, []);

  useEffect(() => {
    setStyle(convertUnits(shape.style));
  }, [shape.style, convertUnits]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    e.stopPropagation();

    const rect = canvasRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;

    const offsetX = (e.clientX - rect.left + scrollLeft - shape.x * zoom) / zoom;
    const offsetY = (e.clientY - rect.top + scrollTop - shape.y * zoom) / zoom;

    setStartPos({ x: offsetX, y: offsetY });
    setDragging(true);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });

    const width = parseInt(shape.style.width as string, 10) || 0;
    const height = parseInt(shape.style.height as string, 10) || 0;

    setStartSize({ width, height });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;

    const now = Date.now();
    if (now - lastMoveRef.current < THROTTLE_MS) return;
    lastMoveRef.current = now;

    const rect = canvasRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;

    if (dragging) {
      const x = (e.clientX - rect.left + scrollLeft) / zoom - startPos.x;
      const y = (e.clientY - rect.top + scrollTop) / zoom - startPos.y;

      onUpdate(shape.id, {
        x: Math.round(x / moveUnit) * moveUnit,
        y: Math.round(y / moveUnit) * moveUnit,
      });

      onDragging(shape.id);
    }

    if (resizing) {
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;

      if (updateRef.current) {
        cancelAnimationFrame(updateRef.current);
      }

      updateRef.current = requestAnimationFrame(() => {
        onUpdate(shape.id, {
          ...shape,
          style: {
            ...shape.style,
            width: Math.max(10, Math.round((startSize.width + deltaX) / moveUnit) * moveUnit),
            height: Math.max(10, Math.round((startSize.height + deltaY) / moveUnit) * moveUnit),
          },
        });
      });
    }
  }, [canvasRef, dragging, resizing, startPos, moveUnit, onUpdate, shape, startSize, onDragging, zoom]);

  const handleMouseUp = useCallback(() => {
    if (dragging || resizing) {
      onDragging('');
    }
    setDragging(false);
    setResizing(false);
  }, [dragging, resizing, onDragging]);

  useEffect(() => {
    if (dragging || resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, resizing, handleMouseMove, handleMouseUp]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFocusedShape(shape);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Delete' && isFocused) {
      onDelete(shape.id);
      setFocusedShape(null);
    }
  }, [isFocused, onDelete, shape.id, setFocusedShape]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      ref={assignRef}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={`shape ${isFocused ? 'shape--focused' : ''}`}
      style={{
        position: 'absolute',
        top: shape.y,
        left: shape.x,
        minWidth: px(Number(shape.style.paddingLeft) + Number(shape.style.paddingRight)),
        minHeight: px(Number(shape.style.paddingTop) + Number(shape.style.paddingBottom)),
        ...style,
        opacity: (Number(style?.opacity) || 0) / 100,
      }}
    >
      <div className="shape__resize-handle" onMouseDown={handleResizeMouseDown} />
      <div className="shape__text">{shape.text}</div>
    </div>
  );
});

export default ShapeComponent;
