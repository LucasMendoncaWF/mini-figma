export type ShapeType = 'rectangle';

export interface Shape {
  id: string;
  x: number;
  y: number;
  style: React.CSSProperties;
  text?: string;
  selected?: boolean;
}
