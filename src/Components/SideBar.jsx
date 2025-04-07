import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import logo from '../assets/logo.png';

function SideBar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="Company Logo" />
        <h2>Finolex</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/pincode" className={({ isActive }) => isActive ? 'active' : ''}>
        Search Pincode
        </NavLink>
        <NavLink to="/ifsc" className={({ isActive }) => isActive ? 'active' : ''}>
        IFSC Code
        </NavLink>
      </nav>
    </div>
  );
}

export default SideBar;