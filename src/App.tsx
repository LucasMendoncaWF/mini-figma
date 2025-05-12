import Canvas from './components/Canvas';
import SideBar from './components/Sidebar';
import { useShapesStore } from './hooks/useShape';

const App = () => {
  const { shapes, updateShape } = useShapesStore();

  return (
    <div>
      <div className='flex'>
        <Canvas shapes={shapes} onUpdateShape={updateShape} />
        <SideBar />
      </div>
    </div>
  );
};

export default App;
