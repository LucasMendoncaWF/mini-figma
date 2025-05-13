import { useEffect, useRef, useState } from "react";
import { useShapesStore } from "../../stores/useShape";
import Input, { ChangeValues } from "./Input";
import { Shape } from "../../types";
import TextArea from "./TextArea";
import './Sidebar.scss';
import Alignment from "./Alignment";
import ColorPicker from "./ColorPicker";

export default function SideBar() {
  const { addRectangle, focusedShape, unit, setUnit, updateShape } = useShapesStore();
  const lastShape = useRef<Shape>(null)
  const [style, setStyle] = useState(focusedShape?.style);
  const [text, setText] = useState(focusedShape?.text);

  const onChange = ({value, name}: ChangeValues) => {
    if(focusedShape?.id) {
      const newStyle = {
        ...style,
        [name]: value,
      };

      setStyle(newStyle);
      updateShape(focusedShape?.id, {
        style: newStyle
      });
    }
  }

  const onChangeTextArea = ({value}: {value: string}) => {
    if(focusedShape?.id) {
      setText(value);
      updateShape(focusedShape?.id, {
        text: value
      });
    }
  }

  function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;

  return keys1.every(key => obj1[key] === obj2[key]);
}

  useEffect(() => {
    const hasChangedStyle = !shallowEqual(focusedShape?.style, style);
    if(lastShape.current?.id !== focusedShape?.id || hasChangedStyle) {
      lastShape.current = focusedShape;
      setStyle(focusedShape?.style);
      setText(focusedShape?.text || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedShape])

  return (
    <div className='side-bar screen-height'>
      <div className="side-bar__permanent-content">
        <Input name="base_unit" type="number" unit="px" label="Base unit" value={unit} onChange={({value}) => setUnit(parseInt(value.toString()))}/>
        <button className="button__primary" onClick={addRectangle}>Add Shape</button>
      </div>
      
      <div className="side-bar__content">
        {focusedShape && (
          <div>
            <div>
              <div className="side-bar__label side-bar__label--first"><label>Container</label></div>
              <div className="flex justify-between gap">
                <Input size="half" label="Width" name="width" type="number" unit='px' value={style?.width} onChange={onChange} />
                <Input size="half" label="Height" name="height" type="number" unit='px' value={style?.height} onChange={onChange} />
              </div>
              <ColorPicker label='Background Color' value={style?.backgroundColor} onChange={onChange} name="backgroundColor" />
             </div>
            <div>
              <div className="side-bar__label"><label>Border</label></div>
              <div className="flex justify-between gap">
                <Input size="half" label="Border Size" name="borderWidth" type="number" unit='px' value={style?.borderWidth} onChange={onChange} />
                <Input size="half" label="Border Radius" name="borderRadius" type="number" unit='px' value={style?.borderRadius} onChange={onChange} />
              </div>
              <ColorPicker label='Border Color' value={style?.borderColor} onChange={onChange} name="borderColor" />
            </div>
            <div>
              <div className="side-bar__label"><label>Content</label></div>
              <div className="flex justify-between gap">
                <Input size="half" label="Font Size" name="fontSize" type="number" unit='px' value={style?.fontSize} onChange={onChange} />
                <Input size="half" label="Line Height" name="lineHeight" type="number" unit='px' value={style?.lineHeight} onChange={onChange} />
              </div>
              <div>
                <TextArea size="full" label="" name="text-content" value={text} onChange={onChangeTextArea}/>
                <ColorPicker label='Text Color' value={style?.color} onChange={onChange} name="color" />
                <Alignment value={style?.textAlign} onChange={onChange} />
              </div>
            </div>
            <div>
              <div className="side-bar__label"><label>Padding</label></div>
              <div className="flex justify-between gap">
                <Input size="half" label="Padding Left" name="paddingLeft" type="number" unit='px' value={style?.paddingLeft} onChange={onChange} />
                <Input size="half" label="Padding Right" name="paddingRight" type="number" unit='px' value={style?.paddingRight} onChange={onChange} />
              </div>
               <div className="flex justify-between gap">
                <Input size="half" label="Padding Top" name="paddingTop" type="number" unit='px' value={style?.paddingTop} onChange={onChange} />
                <Input size="half" label="Padding Bottom" name="paddingBottom" type="number" unit='px' value={style?.paddingBottom} onChange={onChange} />
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}
