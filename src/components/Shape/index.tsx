import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Shape } from '../../types';
import { useShapesStore } from '../../hooks/useShape';
import './Shape.scss';
import { unit } from '../../constants/units';

interface Props {
  shape: Shape;
  onUpdate: (id: string, data: Partial<Shape>) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

const ShapeComponent: React.FC<Props> = ({ shape, onUpdate, canvasRef }) => {
  const elRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const { setFocused, focused, onDelete } = useShapesStore();
  const currentFocused = focused && focused === elRef.current;

  const onMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();

    const scrollLeft = canvas.scrollLeft;
    const scrollTop = canvas.scrollTop;

    const offsetX = e.clientX - canvasRect.left + scrollLeft - shape.x;
    const offsetY = e.clientY - canvasRect.top + scrollTop - shape.y;

    setStart({ x: offsetX, y: offsetY });
    setDragging(true);
  };

  const onResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setResizing(true);
    setStart({ x: e.clientX, y: e.clientY });
    setStartSize({ width: shape.width, height: shape.height });
  };

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const canvasRect = canvas.getBoundingClientRect();
      const scrollLeft = canvas.scrollLeft;
      const scrollTop = canvas.scrollTop;

      if (dragging) {
        const x = e.clientX - canvasRect.left + scrollLeft - start.x;
        const y = e.clientY - canvasRect.top + scrollTop - start.y;

        const newX = Math.round(x / unit) * unit;
        const newY = Math.round(y / unit) * unit;

        onUpdate(shape.id, { x: newX, y: newY });
      } else if (resizing) {
        const deltaX = e.clientX - start.x;
        const deltaY = e.clientY - start.y;

        const newWidth = Math.max(10, Math.round((startSize.width + deltaX) / (unit / 2)) * (unit / 2));
        const newHeight = Math.max(10, Math.round((startSize.height + deltaY) / (unit / 2)) * (unit / 2));

        onUpdate(shape.id, { width: newWidth, height: newHeight });
      }
    },
    [dragging, resizing, start, startSize, shape.id, onUpdate, canvasRef]
  );

  const onMouseUp = () => {
    setDragging(false);
    setResizing(false);
  };

  useEffect(() => {
    if (dragging || resizing) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, resizing, onMouseMove]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (elRef.current) {
      setFocused(elRef.current);
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
    }
  }, [currentFocused, onDelete, shape.id]);

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

  return (
    <div
      onContextMenu={handleContextMenu}
      ref={elRef}
      className={`shape ${currentFocused ? 'focused' : ''}`}
      onMouseDown={onMouseDown}
      onClick={handleClick}
      style={{
        position: 'absolute',
        top: shape.y,
        left: shape.x,
        width: shape.width,
        height: shape.height,
        ...shape.style,
      }}
    >
      <div
        className="resize-handle"
        onMouseDown={onResizeMouseDown}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '12px',
          height: '12px',
          backgroundColor: '#333',
          cursor: 'nwse-resize',
        }}
      />
      {shape.text}
      {menuVisible && 
        <div className='custom-menu'>
          opcao
        </div>
      }
    </div>
  );
};

export default ShapeComponent;
