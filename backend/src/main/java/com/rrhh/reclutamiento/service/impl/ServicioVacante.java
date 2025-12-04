package com.rrhh.reclutamiento.service.impl;

import com.rrhh.shared.domain.enums.EtapaProceso;
import com.rrhh.shared.domain.enums.EstadoVacante;
import com.rrhh.shared.domain.model.Vacante;
import com.rrhh.shared.exception.BusinessException;
import com.rrhh.shared.exception.ResourceNotFoundException;
import com.rrhh.reclutamiento.repository.VacanteRepository;
import com.rrhh.reclutamiento.service.IServicioVacante;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServicioVacante implements IServicioVacante {
    
    private final VacanteRepository vacanteRepository;
    
    @Override
    @Transactional
    public Vacante crearVacante(Vacante vacante) {
        // Validaciones de negocio
        if (vacante.getNombre() == null || vacante.getNombre().trim().isEmpty()) {
            throw new BusinessException("NOMBRE_REQUERIDO", "El nombre de la vacante es obligatorio");
        }
        
        if (vacante.getDescripcion() == null || vacante.getDescripcion().trim().isEmpty()) {
            throw new BusinessException("DESCRIPCION_REQUERIDA", "La descripción es obligatoria");
        }
        
        vacante.setEstado(EstadoVacante.PAUSADA);
        return vacanteRepository.save(vacante);
    }
    
    @Override
    @Transactional
    public Vacante publicarVacante(Integer idVacante) {
        Vacante vacante = vacanteRepository.findById(idVacante)
            .orElseThrow(() -> new ResourceNotFoundException("Vacante", idVacante));
        
        if (vacante.getEstado() == EstadoVacante.ABIERTA) {
            throw new BusinessException("VACANTE_YA_PUBLICADA", 
                "La vacante ya está publicada");
        }
        
        if (vacante.getRequisitos() == null || vacante.getRequisitos().trim().isEmpty()) {
            throw new BusinessException("REQUISITOS_REQUERIDOS", 
                "No se puede publicar una vacante sin requisitos");
        }
        
        vacante.publicar();
        return vacanteRepository.save(vacante);
    }
    
    @Override
    @Transactional
    public Vacante cerrarVacante(Integer idVacante) {
        Vacante vacante = vacanteRepository.findById(idVacante)
            .orElseThrow(() -> new ResourceNotFoundException("Vacante", idVacante));
        
        if (vacante.getEstado() == EstadoVacante.CERRADA) {
            throw new BusinessException("VACANTE_YA_CERRADA", 
                "La vacante ya está cerrada");
        }
        
        vacante.cerrar();
        return vacanteRepository.save(vacante);
    }
    
    @Override
    public List<Vacante> buscarVacantesActivas() {
        return vacanteRepository.findByEstado(EstadoVacante.ABIERTA);
    }

    @Override
    public List<Vacante> buscarVacantesPorEstadoYEtapa(EstadoVacante estado, EtapaProceso etapa) {
        return vacanteRepository.findByEstadoAndEtapa(estado, etapa);
    }
    
    @Override
    @Transactional
    public Vacante actualizarVacante(Integer idVacante, Vacante vacanteActualizada) {
        Vacante vacante = vacanteRepository.findById(idVacante)
            .orElseThrow(() -> new ResourceNotFoundException("Vacante", idVacante));
        
        // No permitir actualizar vacantes cerradas
        if (vacante.getEstado() == EstadoVacante.CERRADA) {
            throw new BusinessException("VACANTE_CERRADA", 
                "No se puede actualizar una vacante cerrada");
        }
        
        vacante.setNombre(vacanteActualizada.getNombre());
        vacante.setDescripcion(vacanteActualizada.getDescripcion());
        vacante.setRequisitos(vacanteActualizada.getRequisitos());
        vacante.setModalidad(vacanteActualizada.getModalidad());
        vacante.setRangoSalarial(vacanteActualizada.getRangoSalarial());
        vacante.setDepartamento(vacanteActualizada.getDepartamento());
        vacante.setPrioridad(vacanteActualizada.getPrioridad());
        vacante.setTipoContrato(vacanteActualizada.getTipoContrato());
        
        return vacanteRepository.save(vacante);
    }
    
    @Override
    public Vacante obtenerVacantePorId(Integer idVacante) {
        return vacanteRepository.findById(idVacante)
            .orElseThrow(() -> new ResourceNotFoundException("Vacante", idVacante));
    }
    
    @Override
    @Transactional
    public void eliminarVacante(Integer idVacante) {
        Vacante vacante = vacanteRepository.findById(idVacante)
            .orElseThrow(() -> new ResourceNotFoundException("Vacante", idVacante));
        
        // No permitir eliminar vacantes con candidatos activos
        // Esta validación se puede mejorar consultando PostulanteProceso
        if (vacante.getEstado() == EstadoVacante.ABIERTA) {
            throw new BusinessException("VACANTE_ABIERTA", 
                "No se puede eliminar una vacante abierta. Cierra la vacante primero.");
        }
        
        vacanteRepository.deleteById(idVacante);
    }
    
    @Override
    @Transactional
    public Vacante actualizarEstado(Integer idVacante, EstadoVacante nuevoEstado) {
        Vacante vacante = vacanteRepository.findById(idVacante)
            .orElseThrow(() -> new RuntimeException("Vacante no encontrada"));
        vacante.setEstado(nuevoEstado);
        return vacanteRepository.save(vacante);
    }
}

