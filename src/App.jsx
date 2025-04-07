import React from 'react'
import PincodeSearch from './Components/PincodeSearch'
import SideBar from './Components/SideBar'

import { Navigate, Route, Router, Routes } from 'react-router-dom'
import IFSCSearch from './Components/IFSCSearch'

const App = () => {
  return (
    <div className="app-container">
      <SideBar />
      <div className="content-container">
        <Routes>
          <Route path="/" element={<Navigate to="/pincode" />} />
          <Route path="/pincode" element={<PincodeSearch />} />
          <Route path="/ifsc" element={<IFSCSearch />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
