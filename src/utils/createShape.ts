import { ShapeStore } from "../stores/useShape";

export function createShape (get: () => ShapeStore) {
  const unit = get().unit;
  const canvas = document.querySelector('.canvas__content');
  const scrollLeft = canvas?.scrollLeft || 0;
  const scrollTop = canvas?.scrollTop || 0;
  if(!canvas) return;

  const canvasStyle = getComputedStyle(canvas);
  console.log(canvasStyle.transform)
  const transformMatrix = canvasStyle.transform || 'matrix(1, 0, 0, 1, 0, 0)'; 
  const matrix = transformMatrix.match(/matrix\(([^)]+)\)/);
  console.log(matrix)
  if(!matrix) return;
  const values = matrix[1].split(',').map(Number);
  const scaleX = values[0];
  const scaleY = values[3];
  const translateX = values[4];
  const translateY = values[5];


  const lastId = get().shapes.reduce((max, s) => {
    const idNum = parseInt(s.id.replace('shape-', ''));
    return isNaN(idNum) ? max : Math.max(max, idNum);
  }, 0);

  const shapeWidth = unit * 8;
  const shapeHeight = unit * 8;
  const screenWidth = (window.innerWidth - 300) / 2;
  const screenHeight = window.innerHeight / 2;
  const centerX = (scrollLeft + screenWidth + unit * 3 - translateX) / scaleX;
  const centerY = (scrollTop + screenHeight + unit * 3 - translateY) / scaleY;

  const newShape = {
    id: `shape-${lastId + 1}`,
    x: centerX - shapeWidth / 2,
    y: centerY - shapeHeight / 2,
    style: {
      width: shapeWidth,
      height: shapeHeight,
      backgroundColor: 'white',
      zIndex: lastId + 1,
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
      opacity: 100,
    }
  };
  return newShape;
}