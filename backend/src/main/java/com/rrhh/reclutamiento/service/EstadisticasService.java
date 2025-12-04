package com.rrhh.reclutamiento.service;

import com.rrhh.reclutamiento.repository.*;
import com.rrhh.shared.domain.enums.EstadoPostulante;
import com.rrhh.shared.domain.model.PostulanteProceso;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EstadisticasService {
    
    private final PostulanteProcesoRepository postulanteProcesoRepository;
    private final EntrevistaRepository entrevistaRepository;
    private final OfertaRepository ofertaRepository;
    private final ProcesoSeleccionRepository procesoSeleccionRepository;
    
    public Map<String, Object> obtenerEstadisticasVacante(Integer idVacante) {
        Map<String, Object> estadisticas = new HashMap<>();
        
        // Total de candidatos vinculados (excluyendo DESCARTADO)
        List<PostulanteProceso> candidatos = postulanteProcesoRepository
            .findByVacante(idVacante, EstadoPostulante.DESCARTADO);
        long totalCandidatos = candidatos.size();
        estadisticas.put("totalCandidatos", totalCandidatos);

        // Candidatos seleccionados (en etapa OFERTA o CONTRATACION)
        long candidatosSeleccionados = candidatos.stream()
            .filter(pp -> pp.getEtapaActual().toString().equals("OFERTA") || 
                         pp.getEtapaActual().toString().equals("CONTRATACION"))
            .count();
        estadisticas.put("candidatosSeleccionados", candidatosSeleccionados);
        
        // Entrevistas programadas
        procesoSeleccionRepository.findByIdVacante(idVacante).ifPresent(proceso -> {
            long entrevistasProgramadas = entrevistaRepository.findByIdProceso(proceso.getIdProceso())
                .stream()
                .filter(e -> "PENDIENTE".equals(e.getEstado()))
                .count();
            estadisticas.put("entrevistasProgramadas", entrevistasProgramadas);
        });
        
        // Ofertas emitidas
        long ofertasEmitidas = ofertaRepository.findByIdVacante(idVacante).size();
        estadisticas.put("ofertasEmitidas", ofertasEmitidas);
        
        // Ofertas aceptadas
        long ofertasAceptadas = ofertaRepository.findByIdVacante(idVacante).stream()
            .filter(o -> o.getEstadoOferta().toString().equals("ACEPTADA"))
            .count();
        estadisticas.put("ofertasAceptadas", ofertasAceptadas);
        
        // Tasa de conversión
        double tasaConversion = totalCandidatos > 0 ? 
            (candidatosSeleccionados * 100.0 / totalCandidatos) : 0;
        estadisticas.put("tasaConversion", String.format("%.2f%%", tasaConversion));
        
        return estadisticas;
    }
}

