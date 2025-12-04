package com.rrhh.reclutamiento.service;

import com.rrhh.shared.domain.model.Oferta;
import com.rrhh.reclutamiento.dto.EmitirOfertaDTO;

import java.util.List;

public interface IServicioOferta {
    Oferta emitirOferta(EmitirOfertaDTO dto);
    Oferta registrarRespuestaOferta(Integer idOferta, boolean aceptada, String motivo);
    List<Oferta> obtenerOfertasPendientes();
    Oferta obtenerOfertaPorId(Integer idOferta);
    List<Oferta> obtenerOfertasPorCandidato(Integer idCandidato);
    Oferta cancelarOferta(Integer idOferta, String motivo);
}

