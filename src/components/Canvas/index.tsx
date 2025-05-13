import React, { useEffect, useRef, useState } from 'react';
import { Shape } from '../../types';
import ShapeComponent from './Shape';
import './Canvas.scss';
import { useShapesStore } from '../../stores/useShape';

interface Props {
  shapes: Shape[];
  onUpdateShape: (id: string, data: Partial<Shape>) => void;
}

interface GuideLines {
  x?: number; 
  y?: number; 
  distance: number;
  type: 'left' | 'right' | 'centerX' | 'top' | 'bottom' | 'centerY';
}

const Canvas: React.FC<Props> = ({ shapes, onUpdateShape }) => {
  const shapeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const canvasRef = useRef<HTMLDivElement>(null);
  const { setFocusedShape, focusedShape, unit } = useShapesStore();
  const [alignmentLines, setAlignmentLines] = useState<GuideLines[]>([]);

  const handleDrag = (draggingId: string) => {
    const lines = findAlignmentLines(draggingId);
    setAlignmentLines(lines);
  };

  useEffect(() => {
    if(focusedShape?.id) {
      const lines = findAlignmentLines(focusedShape?.id);
      setAlignmentLines(lines);
    } else {
      setAlignmentLines([]);
    }
  }, [focusedShape])

  const findAlignmentLines = (draggingShapeId: string) => {
    const current = shapeRefs.current[draggingShapeId];
    const canvas = canvasRef.current;
    if (!current || !canvas) return [];

    const lines: GuideLines[] = [];

    const canvasRect = canvas.getBoundingClientRect();
    const rect1 = current.getBoundingClientRect();

    const shape1 = {
      top: rect1.top - canvasRect.top,
      bottom: rect1.bottom - canvasRect.top,
      left: rect1.left - canvasRect.left,
      right: rect1.right - canvasRect.left,
      centerX: rect1.left - canvasRect.left + rect1.width / 2,
      centerY: rect1.top - canvasRect.top + rect1.height / 2,
    };

    const threshold = 5;

    for (const [id, el] of Object.entries(shapeRefs.current)) {
      if (id === draggingShapeId || !el) continue;
        const rect2 = el.getBoundingClientRect();
        const shape2 = {
          top: rect2.top - canvasRect.top,
          bottom: rect2.bottom - canvasRect.top,
          left: rect2.left - canvasRect.left,
          right: rect2.right - canvasRect.left,
          centerX: rect2.left - canvasRect.left + rect2.width / 2,
          centerY: rect2.top - canvasRect.top + rect2.height / 2,
        };

      if (Math.abs(shape1.left - shape2.left) <= threshold) {
          lines.push({ x: shape2.left, distance: Math.abs(shape1.left - shape2.left), type: 'left' });
      }
      if (Math.abs(shape1.centerX - shape2.centerX) <= threshold) {
        lines.push({ x: shape2.centerX, distance: Math.abs(shape1.centerX - shape2.centerX), type: 'centerX' });
      }
      if (Math.abs(shape1.right - shape2.right) <= threshold) {
        lines.push({ x: shape2.right, distance: Math.abs(shape1.right - shape2.right), type: 'right' });
      }

      if (Math.abs(shape1.top - shape2.top) <= threshold) {
        lines.push({ y: shape2.top, distance: Math.abs(shape1.top - shape2.top), type: 'top' });
      }
      if (Math.abs(shape1.centerY - shape2.centerY) <= threshold) {
        lines.push({ y: shape2.centerY, distance: Math.abs(shape1.centerY - shape2.centerY), type: 'centerY' });
      }
      if (Math.abs(shape1.bottom - shape2.bottom) <= threshold) {
        lines.push({ y: shape2.bottom, distance: Math.abs(shape1.bottom - shape2.bottom), type: 'bottom' });
      }
    }

    return lines;
  };


  return (
    <div className='screen-height canvas' onClick={() => setFocusedShape(null)}>
      <div
        ref={canvasRef}
        className='canvas__content'
        style={{ backgroundSize: `${unit}px ${unit}px` }}
      >
        {shapes.map((shape) => (
          <ShapeComponent
            key={shape.id}
            ref={(el) => { shapeRefs.current[shape.id] = el; }}
            shape={shape}
            onUpdate={onUpdateShape}
            canvasRef={canvasRef}
            onDragging={handleDrag}
          />
        ))}

        {alignmentLines.map((line, index) =>
          line.x != null ? (
            <div
              key={index}
              className="canvas__guide-line"
              style={{ left: line.x, top: 0, bottom: 0, width: 2 }}
            />
          ) : (
            <div
              key={index}
              className="canvas__guide-line"
              style={{ top: line.y, left: 0, right: 0, height: 2 }}
            />
          )
        )}
      </div>
    </div>
  );
};

export default Canvas;
