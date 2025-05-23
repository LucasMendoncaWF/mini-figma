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
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(0.6);
  const [zoomTarget, setZoomTarget] = useState(zoom);
  const zoomRef = useRef(zoom);

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
  }, [focusedShape]);

  const findAlignmentLines = (draggingShapeId: string) => {
    const current = shapeRefs.current[draggingShapeId];
    const canvas = canvasRef.current;
    if (!current || !canvas) return [];

    const lines: GuideLines[] = [];

    const canvasRect = canvas.getBoundingClientRect();
    const zoom = zoomRef.current;

    const rect1 = current.getBoundingClientRect();
    const shape1 = {
      top: (rect1.top - canvasRect.top) / zoom,
      bottom: (rect1.bottom - canvasRect.top) / zoom,
      left: (rect1.left - canvasRect.left) / zoom,
      right: (rect1.right - canvasRect.left) / zoom,
      centerX: (rect1.left - canvasRect.left + rect1.width / 2) / zoom,
      centerY: (rect1.top - canvasRect.top + rect1.height / 2) / zoom,
    };

    const threshold = 5;

    for (const [id, el] of Object.entries(shapeRefs.current)) {
      if (id === draggingShapeId || !el) continue;
        const rect2 = el.getBoundingClientRect();
        const shape2 = {
          top: (rect2.top - canvasRect.top) / zoom,
          bottom: (rect2.bottom - canvasRect.top) / zoom,
          left: (rect2.left - canvasRect.left) / zoom,
          right: (rect2.right - canvasRect.left) / zoom,
          centerX: (rect2.left - canvasRect.left + rect2.width / 2) / zoom,
          centerY: (rect2.top - canvasRect.top + rect2.height / 2) / zoom,
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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isPanning) return;
    const x = e.clientX - panStart.x;
    const y = e.clientY - panStart.y;
    setPanOffset({ x, y });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });

  useEffect(() => {
    const wrapper = canvasRef.current?.parentElement;
    if (!wrapper) return;

    const wrapperRect = wrapper.getBoundingClientRect();

    const centerScreenX = wrapperRect.width / 2;
    const centerScreenY = wrapperRect.height / 2;

    const prevZoom = zoomRef.current;
    const scale = zoom / prevZoom;

    const newPanX = centerScreenX - (centerScreenX - panOffset.x) * scale;
    const newPanY = centerScreenY - (centerScreenY - panOffset.y) * scale;

    setPanOffset({ x: newPanX, y: newPanY });
    zoomRef.current = zoom;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);


  useEffect(() => {
    const wrapper = canvasRef.current?.parentElement;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const wrapperRect = wrapper.getBoundingClientRect();
    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;

    const initialX = (wrapperRect.width - canvasWidth * zoom) / 2;
    const initialY = (wrapperRect.height - canvasHeight * zoom) / 2;

    setPanOffset({ x: initialX, y: initialY });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    const timeout = setTimeout(() => {
      setZoom(zoomTarget);
    }, 40);

    return () => clearTimeout(timeout);
  }, [zoomTarget]);

  return (
    <>
      <div className='screen-height canvas' onClick={() => setFocusedShape(null)} onMouseDown={handleMouseDown}>
        <div
          ref={canvasRef}
          className='canvas__content'
          style={{
            backgroundSize: `${unit}px ${unit}px`,
            transform: `translate(${panOffset.x }px, ${panOffset.y}px) scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          {shapes.map((shape) => (
            <ShapeComponent
              key={shape.id}
              ref={(el) => { shapeRefs.current[shape.id] = el; }}
              shape={shape}
              zoom={zoom}
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
      <div className="canvas__zoom-slider flex">
        <label htmlFor="zoom-range">{Math.round(zoom * 100)}%</label>
        <input
          id="zoom-range"
          className='canvas__zoom-slider__input'
          type="range"
          min="0.2"
          max="2"
          step="0.05"
          value={zoomTarget}
          onChange={(e) => setZoomTarget(parseFloat(e.target.value))}
        />
        <button onClick={() => setZoom(1)} className='canvas__zoom-slider__button'>Reset</button>
      </div>
    </>
  );
};

export default Canvas;
