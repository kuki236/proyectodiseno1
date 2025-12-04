package com.rrhh.reclutamiento.service.impl;

import com.rrhh.shared.domain.enums.EstadoOferta;
import com.rrhh.shared.domain.enums.EtapaProceso;
import com.rrhh.shared.domain.model.Oferta;
import com.rrhh.shared.domain.model.PostulanteProceso;
import com.rrhh.shared.domain.model.Vacante;
import com.rrhh.reclutamiento.dto.EmitirOfertaDTO;
import com.rrhh.shared.exception.BusinessException;
import com.rrhh.shared.exception.ResourceNotFoundException;
import com.rrhh.reclutamiento.repository.OfertaRepository;
import com.rrhh.reclutamiento.repository.PostulanteProcesoRepository;
import com.rrhh.reclutamiento.repository.VacanteRepository;
import com.rrhh.reclutamiento.repository.ProcesoSeleccionRepository;
import com.rrhh.reclutamiento.service.IServicioOferta;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServicioOferta implements IServicioOferta {
    
    private final OfertaRepository ofertaRepository;
    private final PostulanteProcesoRepository postulanteProcesoRepository;
    private final VacanteRepository vacanteRepository;
    private final ProcesoSeleccionRepository procesoSeleccionRepository;
    
    @Override
    @Transactional
    public Oferta emitirOferta(EmitirOfertaDTO dto) {
        // Validar que la vacante existe
        vacanteRepository.findById(dto.getIdVacante())
            .orElseThrow(() -> new ResourceNotFoundException("Vacante", dto.getIdVacante()));
        
        // Validar que el candidato está en etapa de oferta
        PostulanteProceso postulanteProceso = postulanteProcesoRepository
            .findByIdProcesoActualAndIdPostulante(
                obtenerIdProcesoPorVacante(dto.getIdVacante()),
                dto.getIdCandidato()
            )
            .orElseThrow(() -> new ResourceNotFoundException("Candidato no encontrado en el proceso"));
        
        if (postulanteProceso.getEtapaActual() != EtapaProceso.OFERTA) {
            throw new BusinessException("INVALID_STAGE", 
                "El candidato no está en la etapa de oferta");
        }
        
        // Verificar que no existe una oferta pendiente para este candidato y vacante
        List<Oferta> ofertasExistentes = ofertaRepository.findByIdVacante(dto.getIdVacante());
        boolean tieneOfertaPendiente = ofertasExistentes.stream()
            .anyMatch(o -> o.getIdCandidato().equals(dto.getIdCandidato()) && 
                          o.getEstadoOferta() == EstadoOferta.PENDIENTE);
        
        if (tieneOfertaPendiente) {
            throw new BusinessException("DUPLICATE_OFFER", 
                "Ya existe una oferta pendiente para este candidato");
        }
        
        // Crear oferta
        Oferta oferta = new Oferta();
        oferta.setIdVacante(dto.getIdVacante());
        oferta.setIdCandidato(dto.getIdCandidato());
        oferta.setSalarioOfrecido(dto.getSalarioOfrecido());
        oferta.setCondiciones(dto.getCondiciones());
        oferta.setFechaEmision(LocalDate.now());
        oferta.setEstadoOferta(EstadoOferta.PENDIENTE);
        
        return ofertaRepository.save(oferta);
    }
    
    @Override
    @Transactional
    public Oferta registrarRespuestaOferta(Integer idOferta, boolean aceptada, String motivo) {
        Oferta oferta = ofertaRepository.findById(idOferta)
            .orElseThrow(() -> new ResourceNotFoundException("Oferta", idOferta));
        
        if (oferta.getEstadoOferta() != EstadoOferta.PENDIENTE) {
            throw new BusinessException("INVALID_STATUS", 
                "Solo se pueden responder ofertas pendientes");
        }
        
        if (aceptada) {
            oferta.aceptar();
            
            // Mover candidato a etapa de contratación
            Integer idProceso = obtenerIdProcesoPorVacante(oferta.getIdVacante());
            if (idProceso != null) {
                PostulanteProceso postulanteProceso = postulanteProcesoRepository
                    .findByIdProcesoActualAndIdPostulante(idProceso, oferta.getIdCandidato())
                    .orElse(null);
                
                if (postulanteProceso != null) {
                    postulanteProceso.avanzarEtapa(EtapaProceso.CONTRATACION);
                    postulanteProcesoRepository.save(postulanteProceso);
                }
            }
        } else {
            oferta.rechazar();
        }
        
        return ofertaRepository.save(oferta);
    }
    
    @Override
    public List<Oferta> obtenerOfertasPendientes() {
        return ofertaRepository.findOfertasPendientes();
    }
    
    @Override
    public Oferta obtenerOfertaPorId(Integer idOferta) {
        return ofertaRepository.findById(idOferta)
            .orElseThrow(() -> new ResourceNotFoundException("Oferta", idOferta));
    }
    
    @Override
    public List<Oferta> obtenerOfertasPorCandidato(Integer idCandidato) {
        return ofertaRepository.findByIdCandidato(idCandidato);
    }
    
    @Override
    @Transactional
    public Oferta cancelarOferta(Integer idOferta, String motivo) {
        Oferta oferta = ofertaRepository.findById(idOferta)
            .orElseThrow(() -> new ResourceNotFoundException("Oferta", idOferta));
        
        if (oferta.getEstadoOferta() != EstadoOferta.PENDIENTE) {
            throw new BusinessException("INVALID_STATUS", 
                "Solo se pueden cancelar ofertas pendientes");
        }
        
        oferta.cancelar();
        return ofertaRepository.save(oferta);
    }
    
    private Integer obtenerIdProcesoPorVacante(Integer idVacante) {
        return procesoSeleccionRepository.findByIdVacante(idVacante)
            .map(com.rrhh.shared.domain.model.ProcesoSeleccion::getIdProceso)
            .orElse(null);
    }
}

