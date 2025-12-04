import React from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { RRHHProvider } from './store/RRHHContext'
import { NotificationProvider } from './components/common/NotificationProvider'
import RRHHApp from './components/RRHHApp'
import Routes from './routes'

// Componente interno para manejar el layout condicional
const AppContent = () => {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  if (isLoginPage) {
    return <Routes />
  }

  return (
    <RRHHApp>
      <Routes />
    </RRHHApp>
  )
}

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <RRHHProvider>
          <AppContent />
        </RRHHProvider>
      </NotificationProvider>
    </BrowserRouter>
  )
}

export default App

