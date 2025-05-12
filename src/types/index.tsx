export type ShapeType = 'rectangle';

export interface Shape {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style: React.CSSProperties;
  text?: string;
  selected?: boolean;
}
