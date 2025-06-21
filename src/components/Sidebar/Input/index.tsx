import { useEffect, useRef } from "react";

export interface ChangeValues {
  value: string | number;
  name: string;
  isPx?: boolean;
}

interface Props {
  name: string;
  value?: string | number;
  label: string;
  min?: number;
  max?: number;
  unit?: string;
  size?: 'half' | 'full'
  type?: 'text' | 'number';
  isColor?: boolean;
  onChange: (values: ChangeValues) => void;
}

export default function Input({
name,
value,
label,
type = 'text',
min,
max,
unit,
size = 'full',
isColor,
onChange
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const classNameGroup = `input-material__area input-material__area--${size}`;

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      value: e.target.value,
      name,
      isPx: unit === 'px'
    })
  }

  useEffect(() => {
    if(type === 'number' && (!!value || value === 0)) {
      const input = inputRef.current;
      const handleWheel = (e: WheelEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onChange({
          value: Number(value) + (e.deltaY > 0 ? -1 : 1),
          name,
        });
      };

      if (input) {
        input.addEventListener('wheel', handleWheel, { passive: false });
      }

      return () => {
        if (input) {
          input.removeEventListener('wheel', handleWheel);
        }
      };
  }
  }, [name, onChange, type, value]);

  return (
  <div className={classNameGroup}>
      <div className='input-material__label'><label htmlFor={name}>{label}</label></div>
      <div className='flex input-material__group'>
        {isColor && <div style={{backgroundColor: value as string}} className="input-material__color-sample"></div>}
        <input 
          ref={inputRef}
          className='input-material__field'
          onScroll={(e)=> e.preventDefault()}
          type={type}
          id={name}
          maxLength={max}
          min={min || -1000}
          max={max || 1000}
          value={value}
          onChange={onChangeInput}
        />
        {unit && <span className='input-material__unit'>{unit}</span>}
      </div>
    </div>
  )
}