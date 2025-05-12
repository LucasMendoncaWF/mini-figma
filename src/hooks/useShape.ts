import { create,  } from 'zustand';
import { persist } from 'zustand/middleware';
import { Shape } from '../types';
import { unit } from '../constants/units';

interface ShapeStore {
  focused: HTMLDivElement | null;
  shapes: Shape[];
  addRectangle: () => void;
  updateShape: (id: string, newProps: Partial<Shape>) => void;
  setFocused: (el: HTMLDivElement | null) => void;
  onDelete: (id: string) => void;
}

export const useShapesStore = create<ShapeStore>()(
  persist(
    (set, get) => ({
      focused: null,
      shapes: [],
      addRectangle: () => {
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
          width: unit * 8,
          height: unit * 8,
          style: {
            backgroundColor: 'white',
            zIndex: lastId + 1
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
      setFocused: (el) => {
        set({ focused: el });
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
