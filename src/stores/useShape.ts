import { create,  } from 'zustand';
import { persist } from 'zustand/middleware';
import { Shape } from '../types';

interface ShapeStore {
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
        const unit = get().unit;
        const canvas = document.querySelector('.canvas');
        const scrollLeft = canvas?.scrollLeft || 0;
        const scrollTop = canvas?.scrollTop || 0;
        const lastId = get().shapes.reduce((max, s) => {
          const idNum = parseInt(s.id.replace('shape-', ''));
          return isNaN(idNum) ? max : Math.max(max, idNum);
        }, 0);

        const newShape: Shape = {
          id: `shape-${lastId + 1}`,
          x: scrollLeft + unit * 3,
          y: scrollTop + unit * 3,
          style: {
            width: unit * 8,
            height: unit * 8,
            backgroundColor: 'white',
            zIndex: lastId + 1,
            textAlign: 'left',
            borderStyle: 'solid',
            color: '#000',
            borderColor: "#000",
            borderWidth: 0,
            borderRadius: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            paddingBottom: 0,
            fontSize: 12,
            lineHeight: 12,
          }
        };
        set((state) => ({
          shapes: [...state.shapes, newShape],
        }));
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
