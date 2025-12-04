import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiClient from '../services/api'
import './FormularioPostulacion.css'

const FormularioPostulacion = () => {
  const { idVacante } = useParams()
  const navigate = useNavigate()
  
  const [vacante, setVacante] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: '',
    genero: '',
    dni: '',
    estadoCivil: '',
    cvGoogleDriveLink: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    cargarVacante()
  }, [idVacante])

  const cargarVacante = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get(`/vacantes/${idVacante}`)
      setVacante(data)
    } catch (err) {
      console.error('Error al cargar vacante:', err)
      setError('Error al cargar la información de la oportunidad')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateGoogleDriveLink = (link) => {
    if (!link.trim()) return false
    
    // Validar que sea un enlace de Google Drive
    const drivePatterns = [
      /^https?:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
      /^https?:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
      /^https?:\/\/docs\.google\.com\/.*\/d\/([a-zA-Z0-9_-]+)/
    ]
    
    return drivePatterns.some(pattern => pattern.test(link))
  }

  const handleLinkChange = (e) => {
    const link = e.target.value.trim()
    setFormData(prev => ({
      ...prev,
      cvGoogleDriveLink: link
    }))
    
    // Validar en tiempo real
    if (link && !validateGoogleDriveLink(link)) {
      setErrors(prev => ({
        ...prev,
        cvGoogleDriveLink: 'Por favor ingrese un enlace válido de Google Drive'
      }))
    } else {
      setErrors(prev => ({
        ...prev,
        cvGoogleDriveLink: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombres.trim()) newErrors.nombres = 'Los nombres son requeridos'
    if (!formData.apellidoPaterno.trim()) newErrors.apellidoPaterno = 'El apellido paterno es requerido'
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido'
    }
    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es requerida'
    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida'
    }
    if (!formData.genero) newErrors.genero = 'El género es requerido'
    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es requerido'
    } else if (!/^\d{8}$/.test(formData.dni)) {
      newErrors.dni = 'El DNI debe tener 8 dígitos'
    }
    if (!formData.estadoCivil) newErrors.estadoCivil = 'El estado civil es requerido'
    if (!formData.cvGoogleDriveLink.trim()) {
      newErrors.cvGoogleDriveLink = 'Debe proporcionar un enlace de Google Drive a su CV'
    } else if (!validateGoogleDriveLink(formData.cvGoogleDriveLink)) {
      newErrors.cvGoogleDriveLink = 'Por favor ingrese un enlace válido de Google Drive'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      // 1. Crear el postulante
      const postulanteData = {
        nombres: formData.nombres.trim(),
        apellidoPaterno: formData.apellidoPaterno.trim(),
        apellidoMaterno: formData.apellidoMaterno.trim() || null,
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim(),
        fechaNacimiento: formData.fechaNacimiento,
        genero: formData.genero,
        dni: formData.dni.trim(),
        estadoCivil: formData.estadoCivil
      }

      const nuevoPostulante = await apiClient.post('/candidatos', postulanteData)

      // 2. Subir el CV desde Google Drive y registrar la postulación
      if (formData.cvGoogleDriveLink) {
        await apiClient.post('/cvs/google-drive', {
          idPostulante: nuevoPostulante.idPostulante,
          idVacante: parseInt(idVacante),
          enlaceGoogleDrive: formData.cvGoogleDriveLink,
          fuente: 'PORTAL'
        })
      }

      setSuccess(true)
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/')
      }, 3000)

    } catch (err) {
      console.error('Error al enviar postulación:', err)
      setError(err.message || 'Error al enviar su postulación. Por favor, intente nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="formulario-container">
        <div className="loading">Cargando información...</div>
      </div>
    )
  }

  if (!vacante) {
    return (
      <div className="formulario-container">
        <div className="error">No se encontró la oportunidad de trabajo</div>
        <button className="btn-volver" onClick={() => navigate('/')}>
          Volver a oportunidades
        </button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="formulario-container">
        <div className="success-message">
          <h2>¡Postulación enviada exitosamente!</h2>
          <p>Gracias por postular a <strong>{vacante.nombre}</strong></p>
          <p>Hemos recibido su información y nos pondremos en contacto pronto.</p>
          <p>Será redirigido en unos segundos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="formulario-container">
      <div className="formulario-header">
        <button className="btn-volver" onClick={() => navigate('/')}>
          ← Volver a oportunidades
        </button>
        <h1>Postular a: {vacante.nombre}</h1>
        <p className="departamento-info">Departamento: {vacante.departamento}</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="formulario-postulacion">
        <div className="form-section">
          <h2>Información Personal</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombres">Nombres *</label>
              <input
                type="text"
                id="nombres"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                className={errors.nombres ? 'error' : ''}
                required
              />
              {errors.nombres && <span className="error-text">{errors.nombres}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="apellidoPaterno">Apellido Paterno *</label>
              <input
                type="text"
                id="apellidoPaterno"
                name="apellidoPaterno"
                value={formData.apellidoPaterno}
                onChange={handleChange}
                className={errors.apellidoPaterno ? 'error' : ''}
                required
              />
              {errors.apellidoPaterno && <span className="error-text">{errors.apellidoPaterno}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="apellidoMaterno">Apellido Materno</label>
              <input
                type="text"
                id="apellidoMaterno"
                name="apellidoMaterno"
                value={formData.apellidoMaterno}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dni">DNI *</label>
              <input
                type="text"
                id="dni"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                maxLength="8"
                className={errors.dni ? 'error' : ''}
                required
              />
              {errors.dni && <span className="error-text">{errors.dni}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fechaNacimiento">Fecha de Nacimiento *</label>
              <input
                type="date"
                id="fechaNacimiento"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                className={errors.fechaNacimiento ? 'error' : ''}
                required
              />
              {errors.fechaNacimiento && <span className="error-text">{errors.fechaNacimiento}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="genero">Género *</label>
              <select
                id="genero"
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                className={errors.genero ? 'error' : ''}
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
                <option value="Prefiero no decir">Prefiero no decir</option>
              </select>
              {errors.genero && <span className="error-text">{errors.genero}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="estadoCivil">Estado Civil *</label>
              <select
                id="estadoCivil"
                name="estadoCivil"
                value={formData.estadoCivil}
                onChange={handleChange}
                className={errors.estadoCivil ? 'error' : ''}
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Soltero">Soltero</option>
                <option value="Casado">Casado</option>
                <option value="Divorciado">Divorciado</option>
                <option value="Viudo">Viudo</option>
                <option value="Conviviente">Conviviente</option>
              </select>
              {errors.estadoCivil && <span className="error-text">{errors.estadoCivil}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Información de Contacto</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                required
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono *</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className={errors.telefono ? 'error' : ''}
                required
              />
              {errors.telefono && <span className="error-text">{errors.telefono}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="direccion">Dirección *</label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className={errors.direccion ? 'error' : ''}
              required
            />
            {errors.direccion && <span className="error-text">{errors.direccion}</span>}
          </div>
        </div>

        <div className="form-section">
          <h2>Documentos</h2>
          
          <div className="form-group">
            <label htmlFor="cvGoogleDriveLink">Enlace de Google Drive al CV (PDF) *</label>
            <input
              type="url"
              id="cvGoogleDriveLink"
              name="cvGoogleDriveLink"
              value={formData.cvGoogleDriveLink}
              onChange={handleLinkChange}
              placeholder="https://drive.google.com/file/d/..."
              className={errors.cvGoogleDriveLink ? 'error' : ''}
              required
            />
            {errors.cvGoogleDriveLink && <span className="error-text">{errors.cvGoogleDriveLink}</span>}
            <small className="file-hint">
              Comparta su CV en Google Drive y pegue el enlace aquí. 
              Asegúrese de que el archivo tenga permisos de "Cualquiera con el enlace puede ver".
            </small>
            {formData.cvGoogleDriveLink && validateGoogleDriveLink(formData.cvGoogleDriveLink) && (
              <div className="file-selected" style={{ color: '#28a745', marginTop: '8px' }}>
                ✓ Enlace válido de Google Drive
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? 'Enviando...' : 'Enviar Postulación'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormularioPostulacion

