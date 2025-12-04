import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ListaVacantes from './pages/ListaVacantes'
import FormularioPostulacion from './pages/FormularioPostulacion'
import './App.css'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<ListaVacantes />} />
        <Route path="/postular/:idVacante" element={<FormularioPostulacion />} />
      </Routes>
    </div>
  )
}

export default App

