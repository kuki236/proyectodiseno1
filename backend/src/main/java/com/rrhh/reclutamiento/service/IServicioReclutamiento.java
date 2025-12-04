package com.rrhh.reclutamiento.service;

import com.rrhh.shared.domain.model.PostulanteProceso;
import com.rrhh.shared.domain.model.ProcesoSeleccion;
import com.rrhh.shared.domain.enums.EtapaProceso;

import java.util.List;
import java.util.Map;

public interface IServicioReclutamiento {
    PostulanteProceso vincularCandidatoVacante(Integer idCandidato, Integer idVacante);
    List<PostulanteProceso> filtrarCandidatos(Map<String, Object> criterios);
    void evaluarCandidato(Integer idCandidato, Integer idProceso, Map<String, Object> evaluacion);
    PostulanteProceso moverCandidatoEtapa(Integer idPostulanteProceso, EtapaProceso nuevaEtapa);
    List<PostulanteProceso> obtenerCandidatosPorEtapa(Integer idProceso, EtapaProceso etapa);
    Map<String, Object> calcularCompatibilidad(Integer idCandidato, Integer idVacante);
    PostulanteProceso rechazarCandidato(Integer idPostulanteProceso, String motivo);
    ProcesoSeleccion obtenerProcesoPorVacante(Integer idVacante);
}

