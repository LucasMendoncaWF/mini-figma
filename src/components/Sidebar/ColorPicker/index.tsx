import { HexColorPicker } from "react-colorful";
import Input from "../Input";
import './ColorPicker.scss';
import { useEffect, useRef, useState } from "react";

interface ColorChange {
  value: string; 
  name: string;
}

interface Props {
  value?: string;
  name: string;
  label: string;
  onChange: (values: ColorChange) => void;
}

export default function ColorPicker({onChange, value, name, label}: Props) {
  const [openPopup, setOpenPopup] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const onChangeColor = (newColor: string) => {
    onChange({
      value: newColor,
      name,
    })
  }

   useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setOpenPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="color-picker" ref={pickerRef} onClick={() => setOpenPopup(true)}>
      <Input isColor label={label} onChange={({value}) => onChangeColor(value.toString())} value={value} name={name} />
      {openPopup && 
        <div className="color-picker__popup">
          <HexColorPicker color={value} onChange={onChangeColor} />
        </div>
      }
    </div>
  );
};