package com.rrhh.reclutamiento.service;

import com.rrhh.shared.domain.model.Entrevista;
import com.rrhh.reclutamiento.dto.ProgramarEntrevistaDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface IServicioEntrevista {
    Entrevista programarEntrevista(ProgramarEntrevistaDTO dto);
    Entrevista reprogramarEntrevista(Integer idEntrevista, LocalDate nuevaFecha, LocalTime nuevaHora);
    Entrevista registrarResultados(Integer idEntrevista, BigDecimal calificacion, String observaciones);
    boolean verificarDisponibilidad(LocalDate fecha, LocalTime hora, String entrevistador);
    List<Entrevista> obtenerEntrevistasPendientes();
    Entrevista obtenerEntrevistaPorId(Integer idEntrevista);
    List<Entrevista> obtenerEntrevistasPorCandidato(Integer idCandidato);
    Entrevista cancelarEntrevista(Integer idEntrevista, String motivo);
}

