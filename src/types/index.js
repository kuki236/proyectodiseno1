// ========== ENUMS ==========

export const EstadoOferta = {
  PENDIENTE: 'PENDIENTE',
  ACEPTADA: 'ACEPTADA',
  RECHAZADA: 'RECHAZADA',
  CANCELADA: 'CANCELADA'
}

export const EstadoVacante = {
  ABIERTA: 'ABIERTA',
  CERRADA: 'CERRADA',
  PAUSADA: 'PAUSADA'
}

export const EtapaProceso = {
  REVISION_CV: 'REVISION_CV',
  ENTREVISTA: 'ENTREVISTA',
  PRUEBA: 'PRUEBA',
  OFERTA: 'OFERTA',
  CONTRATACION: 'CONTRATACION'
}

export const EstadoPostulante = {
  ACTIVO: 'ACTIVO',
  DESCARTADO: 'DESCARTADO',
  CONTRATADO: 'CONTRATADO'
}

// ========== TIPOS DE DATOS ==========

export class Postulante {
  constructor(data = {}) {
    this.idPostulante = data.idPostulante || null
    this.nombres = data.nombres || ''
    this.apellidoPaterno = data.apellidoPaterno || ''
    this.apellidoMaterno = data.apellidoMaterno || ''
    this.telefono = data.telefono || ''
    this.direccion = data.direccion || ''
    this.email = data.email || ''
    this.fechaNacimiento = data.fechaNacimiento || null
    this.estadoPostulacion = data.estadoPostulacion || EstadoPostulante.ACTIVO
    this.habilidades = data.habilidades || []
    this.experiencias = data.experiencias || []
    this.formacionesAcademicas = data.formacionesAcademicas || []
    this.cv = data.cv || null
  }

  get nombreCompleto() {
    return `${this.nombres} ${this.apellidoPaterno} ${this.apellidoMaterno}`.trim()
  }
}

export class Vacante {
  constructor(data = {}) {
    this.idVacante = data.idVacante || null
    this.idReclutador = data.idReclutador || null
    this.nombre = data.nombre || ''
    this.requisitos = data.requisitos || ''
    this.modalidad = data.modalidad || ''
    this.rangoSalarial = data.rangoSalarial || ''
    this.estado = data.estado || EstadoVacante.ABIERTA
    this.fechaPublicacion = data.fechaPublicacion || null
    this.fechaCierre = data.fechaCierre || null
    this.descripcion = data.descripcion || ''
    this.departamento = data.departamento || ''
    this.prioridad = data.prioridad || ''
    this.tipoContrato = data.tipoContrato || ''
  }
}

export class ProcesoSeleccion {
  constructor(data = {}) {
    this.idProceso = data.idProceso || null
    this.idVacante = data.idVacante || null
    this.nombreProceso = data.nombreProceso || ''
    this.fechaInicio = data.fechaInicio || null
    this.etapaActual = data.etapaActual || EtapaProceso.REVISION_CV
    this.candidatos = data.candidatos || []
  }
}

export class PostulanteProceso {
  constructor(data = {}) {
    this.idPostulanteProceso = data.idPostulanteProceso || null
    this.idPostulante = data.idPostulante || null
    this.idProcesoActual = data.idProcesoActual || null
    this.etapaActual = data.etapaActual || EtapaProceso.REVISION_CV
    this.calificacion = data.calificacion || 0
    this.estado = data.estado || EstadoPostulante.ACTIVO
    this.fechaUltimaActualizacion = data.fechaUltimaActualizacion || null
    this.postulante = data.postulante || null
  }
}

export class Entrevista {
  constructor(data = {}) {
    this.idEntrevista = data.idEntrevista || null
    this.idCandidato = data.idCandidato || null
    this.idProceso = data.idProceso || null
    this.fecha = data.fecha || null
    this.hora = data.hora || null
    this.lugar = data.lugar || ''
    this.entrevistador = data.entrevistador || ''
    this.estado = data.estado || 'PENDIENTE'
    this.observaciones = data.observaciones || ''
    this.calificacion = data.calificacion || 0
  }
}

export class Evaluacion {
  constructor(data = {}) {
    this.idEvaluacion = data.idEvaluacion || null
    this.idProceso = data.idProceso || null
    this.idCandidato = data.idCandidato || null
    this.fecha = data.fecha || null
    this.puntuacion = data.puntuacion || 0
    this.comentarios = data.comentarios || ''
    this.estado = data.estado || 'PENDIENTE'
  }
}

export class Oferta {
  constructor(data = {}) {
    this.idOferta = data.idOferta || null
    this.idVacante = data.idVacante || null
    this.salarioOfrecido = data.salarioOfrecido || 0
    this.condiciones = data.condiciones || ''
    this.fechaEmision = data.fechaEmision || null
    this.fechaRespuesta = data.fechaRespuesta || null
    this.estadoOferta = data.estadoOferta || EstadoOferta.PENDIENTE
  }
}

export class Habilidad {
  constructor(data = {}) {
    this.idHabilidad = data.idHabilidad || null
    this.nombreHabilidad = data.nombreHabilidad || ''
  }
}

export class HabilidadTecnica extends Habilidad {
  constructor(data = {}) {
    super(data)
    this.tecnologia = data.tecnologia || ''
    this.nivelDominio = data.nivelDominio || ''
    this.certificacion = data.certificacion || ''
  }
}

export class HabilidadBlanda extends Habilidad {
  constructor(data = {}) {
    super(data)
    this.tipoInteraccion = data.tipoInteraccion || ''
    this.descripcionHabilidad = data.descripcionHabilidad || ''
  }
}

export class Experiencia {
  constructor(data = {}) {
    this.idExperiencia = data.idExperiencia || null
    this.idPostulante = data.idPostulante || null
    this.empresa = data.empresa || ''
    this.cargo = data.cargo || ''
    this.funcionesPrincipales = data.funcionesPrincipales || ''
    this.fechaInicio = data.fechaInicio || null
    this.fechaFin = data.fechaFin || null
    this.referenciaContacto = data.referenciaContacto || ''
    this.telefonoReferencia = data.telefonoReferencia || ''
    this.fechaCreacion = data.fechaCreacion || null
  }
}

export class FormacionAcademica {
  constructor(data = {}) {
    this.idFormacion = data.idFormacion || null
    this.idPostulante = data.idPostulante || null
    this.nivelEstudios = data.nivelEstudios || ''
    this.situacion = data.situacion || ''
    this.carrera = data.carrera || ''
    this.institucion = data.institucion || ''
    this.fechaInicio = data.fechaInicio || null
    this.fechaFin = data.fechaFin || null
    this.cursosRelevantes = data.cursosRelevantes || ''
    this.observaciones = data.observaciones || ''
    this.fechaCreacion = data.fechaCreacion || null
  }
}

export class CV {
  constructor(data = {}) {
    this.idCV = data.idCV || null
    this.idPostulante = data.idPostulante || null
    this.nombreArchivo = data.nombreArchivo || ''
    this.rutaArchivo = data.rutaArchivo || ''
    this.fechaCarga = data.fechaCarga || null
    this.estado = data.estado || 'PENDIENTE'
  }
}

export class Reclutador {
  constructor(data = {}) {
    this.idReclutador = data.idReclutador || null
    this.nombre = data.nombre || ''
    this.email = data.email || ''
    this.departamento = data.departamento || ''
    this.permisos = data.permisos || ''
  }
}

// ========== DTOs para requests/responses ==========

export class CrearVacanteDTO {
  constructor(data = {}) {
    this.idReclutador = data.idReclutador
    this.nombre = data.nombre
    this.requisitos = data.requisitos
    this.modalidad = data.modalidad
    this.rangoSalarial = data.rangoSalarial
    this.descripcion = data.descripcion
    this.departamento = data.departamento
    this.prioridad = data.prioridad
    this.tipoContrato = data.tipoContrato
  }
}

export class FiltrarCandidatosDTO {
  constructor(data = {}) {
    this.idVacante = data.idVacante
    this.criterios = data.criterios || {}
    this.etapa = data.etapa
  }
}

export class ProgramarEntrevistaDTO {
  constructor(data = {}) {
    this.idCandidato = data.idCandidato
    this.idProceso = data.idProceso
    this.fecha = data.fecha
    this.hora = data.hora
    this.lugar = data.lugar
    this.entrevistador = data.entrevistador
  }
}

export class EmitirOfertaDTO {
  constructor(data = {}) {
    this.idVacante = data.idVacante
    this.idCandidato = data.idCandidato
    this.salarioOfrecido = data.salarioOfrecido
    this.condiciones = data.condiciones
    this.fechaInicio = data.fechaInicio
  }
}

// ========== Mapeo de estados para compatibilidad con frontend ==========

export const mapearEstadoFrontend = (estadoBackend) => {
  const mapeo = {
    [EstadoPostulante.ACTIVO]: 'En Proceso',
    [EstadoPostulante.DESCARTADO]: 'Rechazado',
    [EstadoPostulante.CONTRATADO]: 'Contratado',
    [EtapaProceso.REVISION_CV]: 'Nuevo',
    [EtapaProceso.ENTREVISTA]: 'En Entrevista',
    [EtapaProceso.PRUEBA]: 'Prueba Técnica',
    [EtapaProceso.OFERTA]: 'Oferta',
    [EtapaProceso.CONTRATACION]: 'Contratado'
  }
  return mapeo[estadoBackend] || estadoBackend
}

export const mapearEstadoBackend = (estadoFrontend) => {
  const mapeo = {
    'Nuevo': EtapaProceso.REVISION_CV,
    'En Proceso': EstadoPostulante.ACTIVO,
    'En Entrevista': EtapaProceso.ENTREVISTA,
    'Entrevistado': EtapaProceso.ENTREVISTA,
    'Prueba Técnica': EtapaProceso.PRUEBA,
    'Entrevista Final': EtapaProceso.ENTREVISTA,
    'Oferta': EtapaProceso.OFERTA,
    'Rechazado': EstadoPostulante.DESCARTADO,
    'Contratado': EstadoPostulante.CONTRATADO
  }
  return mapeo[estadoFrontend] || estadoFrontend
}

