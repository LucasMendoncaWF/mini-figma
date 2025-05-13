import { create,  } from 'zustand';
import { persist } from 'zustand/middleware';
import { Shape } from '../types';
import { createShape } from '../utils/createShape';

export interface ShapeStore {
  unit: number;
  focusedShape: Shape | null;
  shapes: Shape[];
  setUnit: (unit: number) => void;
  addRectangle: () => void;
  updateShape: (id: string, newProps: Partial<Shape>) => void;
  setFocusedShape: (el: Shape | null) => void;
  onDelete: (id: string) => void;
}

export const useShapesStore = create<ShapeStore>()(
  persist(
    (set, get) => ({
      focusedShape: null,
      unit: 14,
      shapes: [],
      setUnit: (value) => set({unit: value}),
      addRectangle: () => {
        const newShape = createShape(get);
        if(newShape) {
          set((state) => ({
            shapes: [...state.shapes, newShape],
          }));
        }
      },
      updateShape: (id: string, newProps: Partial<Shape>) => {
        set((state) => ({
          shapes: state.shapes.map((shape) =>
            shape.id === id ? { ...shape, ...newProps } : shape
          ),
        }));
      },
      setFocusedShape: (shape) => {
        set({ focusedShape: shape });
      },
      onDelete: (id) => {
        const shapes = get().shapes;
        set({shapes: shapes.filter(item => item.id !== id)})
      }
    }),
    {
      name: 'shapes-storage',
      partialize: (state) => ({
        shapes: state.shapes,
      }),
    }
  )
);
