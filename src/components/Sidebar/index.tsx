import { useShapesStore } from "../../hooks/useShape";
import './Sidebar.scss';

export default function SideBar() {
    const { addRectangle } = useShapesStore();
  
  return (
    <div className='side-bar screen-height'>
      <div className="permanent-content">
        <button className="button__primary" onClick={addRectangle}>Add Shape</button>
      </div>
      
      <div className="content">
      </div>
    </div>
  )
}
