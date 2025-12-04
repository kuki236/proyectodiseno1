package com.rrhh.reclutamiento.service.impl;

import com.rrhh.shared.domain.model.*;
import com.rrhh.shared.domain.enums.EstadoPostulante;
import com.rrhh.shared.domain.enums.EtapaProceso;
import com.rrhh.shared.domain.enums.EstadoVacante;
import com.rrhh.shared.exception.BusinessException;
import com.rrhh.shared.exception.ResourceNotFoundException;
import com.rrhh.reclutamiento.repository.*;
import com.rrhh.reclutamiento.service.IServicioReclutamiento;
import com.rrhh.reclutamiento.service.IServicioNotificacion;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServicioReclutamiento implements IServicioReclutamiento {
    
    private final PostulanteProcesoRepository postulanteProcesoRepository;
    private final PostulanteRepository postulanteRepository;
    private final VacanteRepository vacanteRepository;
    private final ProcesoSeleccionRepository procesoSeleccionRepository;
    private final IServicioNotificacion servicioNotificacion;
    
    @Override
    @Transactional
    public PostulanteProceso vincularCandidatoVacante(Integer idCandidato, Integer idVacante) {
        // Validar que el candidato existe
        Postulante postulante = postulanteRepository.findById(idCandidato)
            .orElseThrow(() -> new ResourceNotFoundException("Candidato", idCandidato));
        
        // Validar que la vacante existe y está abierta
        Vacante vacante = vacanteRepository.findById(idVacante)
            .orElseThrow(() -> new ResourceNotFoundException("Vacante", idVacante));
        
        if (vacante.getEstado() != EstadoVacante.ABIERTA) {
            throw new BusinessException("VACANTE_CERRADA", 
                "No se pueden vincular candidatos a vacantes cerradas");
        }
        
        // Verificar que el candidato no esté ya vinculado
        ProcesoSeleccion proceso = procesoSeleccionRepository.findByIdVacante(idVacante)
            .orElseGet(() -> {
                ProcesoSeleccion nuevoProceso = new ProcesoSeleccion();
                nuevoProceso.setIdVacante(idVacante);
                nuevoProceso.setNombreProceso("Proceso de Selección - " + vacante.getNombre());
                nuevoProceso.iniciar();
                return procesoSeleccionRepository.save(nuevoProceso);
            });
        
        // Verificar si ya está vinculado
        Optional<PostulanteProceso> existente = postulanteProcesoRepository
            .findByIdProcesoActualAndIdPostulante(proceso.getIdProceso(), idCandidato);
        
        if (existente.isPresent()) {
            throw new BusinessException("CANDIDATO_YA_VINCULADO", 
                "El candidato ya está vinculado a esta vacante");
        }
        
        // Crear relación PostulanteProceso
        PostulanteProceso postulanteProceso = new PostulanteProceso();
        postulanteProceso.setIdPostulante(idCandidato);
        postulanteProceso.setIdProcesoActual(proceso.getIdProceso());
        postulanteProceso.setEtapaActual(EtapaProceso.REVISION_CV);
        postulanteProceso.setEstado(EstadoPostulante.ACTIVO);
        postulanteProceso.setFechaUltimaActualizacion(LocalDateTime.now());
        
        PostulanteProceso guardado = postulanteProcesoRepository.save(postulanteProceso);
        
        // Notificar al candidato
        servicioNotificacion.notificarCandidato(
            postulante.getEmail(),
            "Postulación recibida",
            "Tu postulación para " + vacante.getNombre() + " ha sido recibida"
        );
        
        return guardado;
    }
    
    @Override
    public List<PostulanteProceso> filtrarCandidatos(Map<String, Object> criterios) {
        Integer idVacante = (Integer) criterios.get("idVacante");
        String etapaStr = (String) criterios.get("etapa");
        EtapaProceso etapa = etapaStr != null ? EtapaProceso.valueOf(etapaStr) : null;
        String nombre = (String) criterios.get("nombre");
        String email = (String) criterios.get("email");
        BigDecimal calificacionMinima = criterios.get("calificacionMinima") != null ? 
            new BigDecimal(criterios.get("calificacionMinima").toString()) : null;
        
        List<PostulanteProceso> resultados;
        
        if (idVacante != null && etapa != null) {
            ProcesoSeleccion proceso = procesoSeleccionRepository.findByIdVacante(idVacante)
                .orElseThrow(() -> new ResourceNotFoundException("Proceso no encontrado"));
            resultados = postulanteProcesoRepository.findByProcesoYEtapa(
                proceso.getIdProceso(), etapa, EstadoPostulante.DESCARTADO);
        } else if (idVacante != null) {
            resultados = postulanteProcesoRepository.findByVacante(idVacante, EstadoPostulante.DESCARTADO);
        } else {
            resultados = postulanteProcesoRepository.findAll();
        }
        
        // Aplicar filtros adicionales
        if (nombre != null && !nombre.isEmpty()) {
            resultados = resultados.stream()
                .filter(pp -> {
                    Postulante p = postulanteRepository.findById(pp.getIdPostulante()).orElse(null);
                    return p != null && p.getNombreCompleto().toLowerCase().contains(nombre.toLowerCase());
                })
                .collect(Collectors.toList());
        }
        
        if (email != null && !email.isEmpty()) {
            resultados = resultados.stream()
                .filter(pp -> {
                    Postulante p = postulanteRepository.findById(pp.getIdPostulante()).orElse(null);
                    return p != null && p.getEmail().toLowerCase().contains(email.toLowerCase());
                })
                .collect(Collectors.toList());
        }
        
        if (calificacionMinima != null) {
            resultados = resultados.stream()
                .filter(pp -> pp.getCalificacion() != null && pp.getCalificacion().compareTo(calificacionMinima) >= 0)
                .collect(Collectors.toList());
        }
        
        return resultados;
    }
    
    @Override
    @Transactional
    public void evaluarCandidato(Integer idCandidato, Integer idProceso, Map<String, Object> evaluacion) {
        PostulanteProceso postulanteProceso = postulanteProcesoRepository
            .findByIdProcesoActualAndIdPostulante(idProceso, idCandidato)
            .orElseThrow(() -> new ResourceNotFoundException("Candidato no encontrado en el proceso"));
        
        BigDecimal calificacion = evaluacion.get("calificacion") != null ? 
            new BigDecimal(evaluacion.get("calificacion").toString()) : null;
        
        if (calificacion != null) {
            if (calificacion.compareTo(BigDecimal.ZERO) < 0 || calificacion.compareTo(new BigDecimal("100")) > 0) {
                throw new BusinessException("INVALID_SCORE", 
                    "La calificación debe estar entre 0 y 100");
            }
            
            // Promediar con calificación anterior si existe
            BigDecimal calificacionAnterior = postulanteProceso.getCalificacion();
            if (calificacionAnterior != null) {
                BigDecimal promedio = calificacionAnterior.add(calificacion).divide(new BigDecimal("2"));
                postulanteProceso.setCalificacion(promedio);
            } else {
                postulanteProceso.setCalificacion(calificacion);
            }
        }
        
        postulanteProceso.setFechaUltimaActualizacion(LocalDateTime.now());
        postulanteProcesoRepository.save(postulanteProceso);
    }
    
    @Override
    @Transactional
    public PostulanteProceso moverCandidatoEtapa(Integer idPostulanteProceso, EtapaProceso nuevaEtapa) {
        PostulanteProceso postulanteProceso = postulanteProcesoRepository.findById(idPostulanteProceso)
            .orElseThrow(() -> new ResourceNotFoundException("Candidato no encontrado en el proceso"));
        
        EtapaProceso etapaActual = postulanteProceso.getEtapaActual();
        
        // Validar transición de etapas
        if (!esTransicionValida(etapaActual, nuevaEtapa)) {
            throw new BusinessException("INVALID_TRANSITION", 
                "No se puede pasar de " + etapaActual + " a " + nuevaEtapa);
        }
        
        postulanteProceso.avanzarEtapa(nuevaEtapa);
        PostulanteProceso actualizado = postulanteProcesoRepository.save(postulanteProceso);
        
        // Notificar cambio de etapa
        Postulante postulante = postulanteRepository.findById(postulanteProceso.getIdPostulante())
            .orElse(null);
        if (postulante != null) {
            servicioNotificacion.notificarCambioEtapa(idPostulanteProceso, nuevaEtapa.toString());
        }
        
        return actualizado;
    }
    
    @Override
    public List<PostulanteProceso> obtenerCandidatosPorEtapa(Integer idProceso, EtapaProceso etapa) {
        return postulanteProcesoRepository.findByProcesoYEtapa(
            idProceso,
            etapa,
            EstadoPostulante.DESCARTADO
        );
    }
    
    @Override
    public Map<String, Object> calcularCompatibilidad(Integer idCandidato, Integer idVacante) {
        Postulante candidato = postulanteRepository.findById(idCandidato)
            .orElseThrow(() -> new ResourceNotFoundException("Candidato", idCandidato));
        
        // Validar que la vacante existe
        vacanteRepository.findById(idVacante)
            .orElseThrow(() -> new ResourceNotFoundException("Vacante", idVacante));
        
        Map<String, Object> resultado = new HashMap<>();
        int puntos = 0;
        int maxPuntos = 100;
        List<String> razones = new ArrayList<>();
        
        // Calcular compatibilidad basada en:
        // 1. Experiencia relevante (40 puntos)
        // 2. Habilidades técnicas (30 puntos)
        // 3. Habilidades blandas (20 puntos)
        // 4. Educación (10 puntos)
        
        // Experiencia relevante
        if (candidato.getExperiencias() != null && !candidato.getExperiencias().isEmpty()) {
            puntos += 40;
            razones.add("Tiene experiencia laboral");
        }
        
        // Habilidades técnicas
        if (candidato.getHabilidades() != null) {
            long habilidadesTecnicas = candidato.getHabilidades().stream()
                .filter(h -> h.getHabilidad() instanceof HabilidadTecnica)
                .count();
            if (habilidadesTecnicas > 0) {
                puntos += Math.min(30, (int) (habilidadesTecnicas * 10));
                razones.add("Tiene " + habilidadesTecnicas + " habilidades técnicas");
            }
        }
        
        // Habilidades blandas
        if (candidato.getHabilidades() != null) {
            long habilidadesBlandas = candidato.getHabilidades().stream()
                .filter(h -> h.getHabilidad() instanceof HabilidadBlanda)
                .count();
            if (habilidadesBlandas > 0) {
                puntos += Math.min(20, (int) (habilidadesBlandas * 5));
                razones.add("Tiene " + habilidadesBlandas + " habilidades blandas");
            }
        }
        
        // Educación
        if (candidato.getCv() != null) {
            puntos += 10;
            razones.add("Tiene CV cargado");
        }
        
        resultado.put("compatibilidad", (double) puntos / maxPuntos);
        resultado.put("puntos", puntos);
        resultado.put("maxPuntos", maxPuntos);
        resultado.put("razones", razones);
        resultado.put("recomendacion", puntos >= 70 ? "ALTA" : puntos >= 50 ? "MEDIA" : "BAJA");
        
        return resultado;
    }
    
    @Override
    @Transactional
    public PostulanteProceso rechazarCandidato(Integer idPostulanteProceso, String motivo) {
        PostulanteProceso postulanteProceso = postulanteProcesoRepository.findById(idPostulanteProceso)
            .orElseThrow(() -> new ResourceNotFoundException("Candidato no encontrado"));
        
        if (postulanteProceso.getEstado() == EstadoPostulante.DESCARTADO) {
            throw new BusinessException("ALREADY_REJECTED", 
                "El candidato ya fue rechazado anteriormente");
        }
        
        postulanteProceso.actualizarEstado(EstadoPostulante.DESCARTADO);
        PostulanteProceso actualizado = postulanteProcesoRepository.save(postulanteProceso);
        
        // Notificar al candidato
        Postulante postulante = postulanteRepository.findById(postulanteProceso.getIdPostulante())
            .orElse(null);
        if (postulante != null) {
            servicioNotificacion.notificarCandidato(
                postulante.getEmail(),
                "Actualización de postulación",
                "Lamentamos informarte que tu postulación no ha sido seleccionada. " + 
                (motivo != null ? "Motivo: " + motivo : "")
            );
        }
        
        return actualizado;
    }
    
    private boolean esTransicionValida(EtapaProceso etapaActual, EtapaProceso nuevaEtapa) {
        // Definir transiciones válidas
        Map<EtapaProceso, List<EtapaProceso>> transicionesValidas = new HashMap<>();
        transicionesValidas.put(EtapaProceso.REVISION_CV, 
            Arrays.asList(EtapaProceso.ENTREVISTA, EtapaProceso.CONTRATACION));
        transicionesValidas.put(EtapaProceso.ENTREVISTA, 
            Arrays.asList(EtapaProceso.PRUEBA, EtapaProceso.CONTRATACION));
        transicionesValidas.put(EtapaProceso.PRUEBA, 
            Arrays.asList(EtapaProceso.OFERTA, EtapaProceso.CONTRATACION));
        transicionesValidas.put(EtapaProceso.OFERTA, 
            Arrays.asList(EtapaProceso.CONTRATACION));
        transicionesValidas.put(EtapaProceso.CONTRATACION, 
            Arrays.asList()); // Estado final
        
        List<EtapaProceso> permitidas = transicionesValidas.get(etapaActual);
        return permitidas != null && permitidas.contains(nuevaEtapa);
    }
    
    @Override
    public ProcesoSeleccion obtenerProcesoPorVacante(Integer idVacante) {
        return procesoSeleccionRepository.findByIdVacante(idVacante)
            .orElseThrow(() -> new ResourceNotFoundException("No se encontró proceso de selección para la vacante " + idVacante));
    }
}

