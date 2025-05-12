import React, { useRef } from 'react';
import { Shape } from '../../types';
import ShapeComponent from '../Shape';
import './Canvas.scss';
import { unit } from '../../constants/units';
import { useShapesStore } from '../../hooks/useShape';

interface Props {
  shapes: Shape[];
  onUpdateShape: (id: string, data: Partial<Shape>) => void;
}

const Canvas: React.FC<Props> = ({ shapes, onUpdateShape }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {setFocused} = useShapesStore();
  return (
    <div
      className='screen-height canvas'
      onClick={() => setFocused(null)}
    >
      <div 
        ref={canvasRef} 
        className='content' 
        style={{backgroundSize: `${unit}px ${unit}px`}}
      >
        {shapes.map(shape => (
          <ShapeComponent
            key={shape.id}
            shape={shape}
            onUpdate={onUpdateShape}
            canvasRef={canvasRef}
          />
        ))}
      </div>
    </div>
  );
};

export default Canvas;
