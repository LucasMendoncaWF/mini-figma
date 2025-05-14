import { useEffect, useRef, useState } from "react";
import { useShapesStore } from "../../stores/useShape";
import Input, { ChangeValues } from "./Input";
import { Shape } from "../../types";
import TextArea from "./TextArea";
import './Sidebar.scss';
import Alignment from "./Alignment";
import ColorPicker from "./ColorPicker";

const shallowEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1?.length !== keys2?.length) return false;

  return keys1.every(key => obj1[key] === obj2[key]);
};

export default function SideBar() {
  const { addRectangle, focusedShape, unit, setUnit, updateShape } = useShapesStore();
  const lastShape = useRef<Shape | null>(null);

  const [style, setStyle] = useState(focusedShape?.style || {});
  const [text, setText] = useState(focusedShape?.text || '');

  useEffect(() => {
    const hasChanged = !shallowEqual(focusedShape?.style, style);
    if (lastShape.current?.id !== focusedShape?.id || hasChanged) {
      lastShape.current = focusedShape;
      setStyle(focusedShape?.style || {});
      setText(focusedShape?.text || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedShape]);

  const onChange = ({ value, name }: ChangeValues) => {
    if (!focusedShape?.id) return;

    const updatedStyle = { ...style, [name]: value };
    setStyle(updatedStyle);
    updateShape(focusedShape.id, { style: updatedStyle });
  };

  const onChangeTextArea = ({ value }: { value: string }) => {
    if (!focusedShape?.id) return;

    setText(value);
    updateShape(focusedShape.id, { text: value });
  };

  return (
    <div className="side-bar screen-height">
      <div className="side-bar__permanent-content">
        <Input
          name="base_unit"
          type="number"
          unit="px"
          label="Base unit"
          value={unit}
          onChange={({ value }) => setUnit(parseInt(value.toString()))}
        />
        <button className="button__primary" onClick={addRectangle}>Add Shape</button>
      </div>
      {focusedShape && (
        <div className="side-bar__content">
          <Section title="Container">
            <Row>
              <HalfInput label="Width" name="width" value={style?.width} onChange={onChange} />
              <HalfInput label="Height" name="height" value={style?.height} onChange={onChange} />
            </Row>
            <Row>
              <HalfInput label="Opacity" name="opacity" value={style?.opacity} onChange={onChange} min={0} max={100} />
              <HalfInput label="Layer" name="zIndex" value={style?.zIndex} onChange={onChange} />
            </Row>
            <ColorPicker label="Background Color" value={style?.backgroundColor} onChange={onChange} name="backgroundColor" />
          </Section>

          <Section title="Border">
            <Row>
              <HalfInput label="Border Size" name="borderWidth" value={style?.borderWidth} onChange={onChange} />
              <HalfInput label="Border Radius" name="borderRadius" value={style?.borderRadius} onChange={onChange} />
            </Row>
            <ColorPicker label="Border Color" value={style?.borderColor} onChange={onChange} name="borderColor" />
          </Section>

          <Section title="Content">
            <Row>
              <HalfInput label="Font Size" name="fontSize" value={style?.fontSize} onChange={onChange} />
              <HalfInput label="Line Height" name="lineHeight" value={style?.lineHeight} onChange={onChange} />
            </Row>
            <TextArea size="full" label="Text Content" name="text-content" value={text} onChange={onChangeTextArea} />
            <ColorPicker label="Text Color" value={style?.color} onChange={onChange} name="color" />
            <Alignment value={style?.textAlign} onChange={onChange} />
          </Section>

          <Section title="Padding">
            <Row>
              <HalfInput label="Padding Left" name="paddingLeft" value={style?.paddingLeft} onChange={onChange} />
              <HalfInput label="Padding Right" name="paddingRight" value={style?.paddingRight} onChange={onChange} />
            </Row>
            <Row>
              <HalfInput label="Padding Top" name="paddingTop" value={style?.paddingTop} onChange={onChange} />
              <HalfInput label="Padding Bottom" name="paddingBottom" value={style?.paddingBottom} onChange={onChange} />
            </Row>
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div>
      <div className="side-bar__label"><label>{title}</label></div>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-between gap">{children}</div>;
}

function HalfInput(props: Omit<React.ComponentProps<typeof Input>, 'size' | 'type' | 'unit'> & { value: any }) {
  return <Input size="half" type="number" unit="px" {...props} />;
}
