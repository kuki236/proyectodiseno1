import React from 'react'
import Sidebar from './layout/Sidebar'
import NavMenu from './layout/NavMenu'

const RRHHApp = ({ children }) => {
  return (
    <div className="body-layout">
      <Sidebar />
      <main className="main-content">
        {children}
        <NavMenu />
      </main>
    </div>
  )
}

export default RRHHApp

