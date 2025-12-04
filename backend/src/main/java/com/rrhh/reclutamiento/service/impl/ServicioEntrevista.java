package com.rrhh.reclutamiento.service.impl;

import com.rrhh.shared.domain.model.Entrevista;
import com.rrhh.shared.domain.model.PostulanteProceso;
import com.rrhh.shared.domain.enums.EtapaProceso;
import com.rrhh.reclutamiento.dto.ProgramarEntrevistaDTO;
import com.rrhh.shared.exception.BusinessException;
import com.rrhh.shared.exception.ResourceNotFoundException;
import com.rrhh.reclutamiento.repository.EntrevistaRepository;
import com.rrhh.reclutamiento.repository.PostulanteProcesoRepository;
import com.rrhh.reclutamiento.service.IServicioEntrevista;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServicioEntrevista implements IServicioEntrevista {
    
    private final EntrevistaRepository entrevistaRepository;
    private final PostulanteProcesoRepository postulanteProcesoRepository;
    
    @Override
    @Transactional
    public Entrevista programarEntrevista(ProgramarEntrevistaDTO dto) {
        // Validar disponibilidad
        if (!verificarDisponibilidad(dto.getFecha(), dto.getHora(), dto.getEntrevistador())) {
            throw new BusinessException("UNAVAILABLE_SLOT", 
                "El entrevistador no está disponible en la fecha y hora seleccionadas");
        }
        
        // Verificar que el candidato esté en etapa de entrevista
        PostulanteProceso postulanteProceso = postulanteProcesoRepository
            .findByIdProcesoActualAndIdPostulante(dto.getIdProceso(), dto.getIdCandidato())
            .orElseThrow(() -> new ResourceNotFoundException("Candidato no encontrado en el proceso"));
        
        if (postulanteProceso.getEtapaActual() != EtapaProceso.ENTREVISTA) {
            throw new BusinessException("INVALID_STAGE", 
                "El candidato no está en la etapa de entrevista");
        }
        
        // Crear entrevista
        Entrevista entrevista = new Entrevista();
        entrevista.setIdCandidato(dto.getIdCandidato());
        entrevista.setIdProceso(dto.getIdProceso());
        entrevista.setFecha(dto.getFecha());
        entrevista.setHora(dto.getHora());
        entrevista.setLugar(dto.getLugar());
        entrevista.setEntrevistador(dto.getEntrevistador());
        entrevista.setEstado("PENDIENTE");
        entrevista.setObservaciones(dto.getObservaciones());
        
        return entrevistaRepository.save(entrevista);
    }
    
    @Override
    @Transactional
    public Entrevista reprogramarEntrevista(Integer idEntrevista, LocalDate nuevaFecha, LocalTime nuevaHora) {
        Entrevista entrevista = entrevistaRepository.findById(idEntrevista)
            .orElseThrow(() -> new ResourceNotFoundException("Entrevista", idEntrevista));
        
        if (!"PENDIENTE".equals(entrevista.getEstado())) {
            throw new BusinessException("INVALID_STATUS", 
                "Solo se pueden reprogramar entrevistas pendientes");
        }
        
        if (!verificarDisponibilidad(nuevaFecha, nuevaHora, entrevista.getEntrevistador())) {
            throw new BusinessException("UNAVAILABLE_SLOT", 
                "El entrevistador no está disponible en la nueva fecha y hora");
        }
        
        entrevista.setFecha(nuevaFecha);
        entrevista.setHora(nuevaHora);
        
        return entrevistaRepository.save(entrevista);
    }
    
    @Override
    @Transactional
    public Entrevista registrarResultados(Integer idEntrevista, BigDecimal calificacion, String observaciones) {
        Entrevista entrevista = entrevistaRepository.findById(idEntrevista)
            .orElseThrow(() -> new ResourceNotFoundException("Entrevista", idEntrevista));
        
        if (!"PENDIENTE".equals(entrevista.getEstado())) {
            throw new BusinessException("INVALID_STATUS", 
                "Solo se pueden registrar resultados de entrevistas pendientes");
        }
        
        entrevista.setCalificacion(calificacion);
        entrevista.setObservaciones(observaciones);
        entrevista.setEstado("COMPLETADA");
        
        // Actualizar calificación del candidato en el proceso
        PostulanteProceso postulanteProceso = postulanteProcesoRepository
            .findByIdProcesoActualAndIdPostulante(entrevista.getIdProceso(), entrevista.getIdCandidato())
            .orElse(null);
        
        if (postulanteProceso != null) {
            // Promediar con calificación anterior si existe
            BigDecimal calificacionAnterior = postulanteProceso.getCalificacion();
            if (calificacionAnterior != null) {
                BigDecimal promedio = calificacionAnterior.add(calificacion).divide(new BigDecimal("2"));
                postulanteProceso.setCalificacion(promedio);
            } else {
                postulanteProceso.setCalificacion(calificacion);
            }
            postulanteProcesoRepository.save(postulanteProceso);
        }
        
        return entrevistaRepository.save(entrevista);
    }
    
    @Override
    public boolean verificarDisponibilidad(LocalDate fecha, LocalTime hora, String entrevistador) {
        List<Entrevista> entrevistasExistentes = entrevistaRepository.verificarDisponibilidad(
            fecha, hora, entrevistador
        );
        return entrevistasExistentes.isEmpty();
    }
    
    @Override
    public List<Entrevista> obtenerEntrevistasPendientes() {
        return entrevistaRepository.findEntrevistasPendientes();
    }
    
    @Override
    public Entrevista obtenerEntrevistaPorId(Integer idEntrevista) {
        return entrevistaRepository.findById(idEntrevista)
            .orElseThrow(() -> new ResourceNotFoundException("Entrevista", idEntrevista));
    }
    
    @Override
    public List<Entrevista> obtenerEntrevistasPorCandidato(Integer idCandidato) {
        return entrevistaRepository.findByIdCandidato(idCandidato);
    }
    
    @Override
    @Transactional
    public Entrevista cancelarEntrevista(Integer idEntrevista, String motivo) {
        Entrevista entrevista = entrevistaRepository.findById(idEntrevista)
            .orElseThrow(() -> new ResourceNotFoundException("Entrevista", idEntrevista));
        
        if (!"PENDIENTE".equals(entrevista.getEstado())) {
            throw new BusinessException("INVALID_STATUS", 
                "Solo se pueden cancelar entrevistas pendientes");
        }
        
        entrevista.setEstado("CANCELADA");
        entrevista.setObservaciones(
            (entrevista.getObservaciones() != null ? entrevista.getObservaciones() + "\n" : "") +
            "Cancelada: " + motivo
        );
        
        return entrevistaRepository.save(entrevista);
    }
}

