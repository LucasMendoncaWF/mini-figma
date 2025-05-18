import Canvas from './components/Canvas';
import SideBar from './components/Sidebar';
import { useShapesStore } from './stores/useShape';
import DevicesImage from './assets/images/devices.png';

const App = () => {
  const { shapes, updateShape } = useShapesStore();

  return (
    <div>
      <div className='size-not-allowed'>
        <img src={DevicesImage} alt='devices' width={100} height={80} />
        <p>Screen size not allowed. Please access from a bigger screen.</p>
      </div>
      <div className='flex'>
        <Canvas shapes={shapes} onUpdateShape={updateShape} />
        <SideBar />
      </div>
    </div>
  );
};

export default App;
