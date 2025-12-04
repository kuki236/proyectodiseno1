package com.rrhh.reclutamiento.service;

import com.rrhh.shared.domain.model.Vacante;
import com.rrhh.shared.domain.enums.EstadoVacante;
import com.rrhh.shared.domain.enums.EtapaProceso;

import java.util.List;

public interface IServicioVacante {
    Vacante crearVacante(Vacante vacante);
    Vacante publicarVacante(Integer idVacante);
    Vacante cerrarVacante(Integer idVacante);
    List<Vacante> buscarVacantesActivas();
    List<Vacante> buscarVacantesPorEstadoYEtapa(EstadoVacante estado, EtapaProceso etapa);
    Vacante actualizarVacante(Integer idVacante, Vacante vacante);
    Vacante obtenerVacantePorId(Integer idVacante);
    void eliminarVacante(Integer idVacante);
    Vacante actualizarEstado(Integer idVacante, EstadoVacante nuevoEstado);
}

