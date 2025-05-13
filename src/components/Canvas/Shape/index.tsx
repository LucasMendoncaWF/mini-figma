import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Shape } from '../../../types';
import { useShapesStore } from '../../../stores/useShape';
import './Shape.scss';

interface Props {
  shape: Shape;
  onUpdate: (id: string, data: Partial<Shape>) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onDragging: (id: string) => void;
  onDragEnd?: () => void;
}

const ShapeComponent = React.forwardRef<HTMLDivElement, Props>(({
  shape,
  onUpdate,
  canvasRef,
  onDragging,
}, ref) => {
  const elRef = useRef<HTMLDivElement>(null);
  const updateRef = useRef<number>(null);
  const lastMoveRef = useRef(0);
  const THROTTLE_INTERVAL = 16;
  const combinedRef = (el: HTMLDivElement) => {
    elRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>();
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const { setFocusedShape, focusedShape, unit, onDelete } = useShapesStore();
  const currentFocused = focusedShape && focusedShape.id === shape.id;

  const onMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    e.stopPropagation();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;

    const offsetX = e.clientX - canvasRect.left + scrollLeft - shape.x;
    const offsetY = e.clientY - canvasRect.top + scrollTop - shape.y;

    setStart({ x: offsetX, y: offsetY });
    setDragging(true);
  };

  const onResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setResizing(true);
    setStart({ x: e.clientX, y: e.clientY });
    const width = shape.style.width && parseInt(shape.style.width.toString());
    const height = shape.style.height && parseInt(shape.style.height.toString());
    if(width && height) {
      setStartSize({ width, height });
    }
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
  if (!canvasRef.current) return;
  e.stopPropagation();

  const now = Date.now();
  if (now - lastMoveRef.current < THROTTLE_INTERVAL) return;
  lastMoveRef.current = now;

  const moveUnit = unit / 2;
  const canvasRect = canvasRef.current.getBoundingClientRect();
  const scrollLeft = canvasRef.current.scrollLeft;
  const scrollTop = canvasRef.current.scrollTop;

  if (dragging) {
    const x = e.clientX - canvasRect.left + scrollLeft - start.x;
    const y = e.clientY - canvasRect.top + scrollTop - start.y;
    onUpdate(shape.id, {
      x: Math.round(x / moveUnit) * moveUnit,
      y: Math.round(y / moveUnit) * moveUnit,
    });
    if (shape.id) onDragging(shape.id);
  } else if (resizing) {
    const deltaX = e.clientX - start.x;
    const deltaY = e.clientY - start.y;

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
}, [canvasRef, unit, dragging, resizing, start.x, start.y, onUpdate, shape, onDragging, startSize.width, startSize.height]);

  const onMouseUp = useCallback(() => {
    if (dragging || resizing) {
      onDragging('');
    }
    setDragging(false);
    setResizing(false);
  }, [dragging, onDragging, resizing]);

  useEffect(() => {
    if (dragging || resizing) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, resizing, onMouseMove, onMouseUp]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (shape) {
      setFocusedShape(shape);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuVisible(true);
    elRef.current?.focus();
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Delete' && currentFocused) {
      onDelete(shape.id);
      setFocusedShape(null);
    }
  }, [currentFocused, onDelete, setFocusedShape, shape.id]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuVisible && e.target instanceof HTMLElement && !e.target.classList.contains('custom-menu')) {
        setMenuVisible(false);
      }
    };

    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [menuVisible]);

  const addPxToUnit = (string: string) => `${string}px`;

  const convertUnits = useCallback((style: React.CSSProperties) =>  {
    const newStyle: Record<string, any> = {...style};
    const unitFields: (keyof React.CSSProperties)[] = 
    ['width', 'height', 'borderWidth', 'borderRadius', 'fontSize', 'lineHeight', 'paddingBottom', 'paddingRight', 'paddingTop', 'paddingLeft'];
    unitFields.forEach(item => {
      if(style[item]) {
        newStyle[item] = addPxToUnit(style[item] as any) as any;
      }
    })
    return {
      ...newStyle,
    }
  }, [])

  useEffect(() => {
    setStyle(convertUnits(shape.style));
  }, [convertUnits, shape.style]);

  return (
    <div
      onContextMenu={handleContextMenu}
      ref={combinedRef}
      className={`shape ${currentFocused ? 'shape--focused' : ''}`}
      onMouseDown={onMouseDown}
      onClick={handleClick}
      style={{
        position: 'absolute',
        top: shape.y,
        left: shape.x,
        minWidth: Number(shape.style.paddingLeft) + Number(shape.style.paddingRight) + 'px',
        minHeight: Number(shape.style.paddingTop) + Number(shape.style.paddingBottom) + 'px',
        ...style,
        opacity: (Number(style?.opacity) || 0) / 100
      }}
    >
      <div
        className="shape__resize-handle"
        onMouseDown={onResizeMouseDown}
      />
      <div className='shape__text'>{shape.text}</div>
      {menuVisible && <div className='custom-menu'>opcao</div>}
    </div>
  );
});

export default ShapeComponent;
