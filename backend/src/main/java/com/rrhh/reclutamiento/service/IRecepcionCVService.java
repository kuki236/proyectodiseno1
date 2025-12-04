package com.rrhh.reclutamiento.service;

import com.rrhh.reclutamiento.dto.PostulanteRevisionDTO;
import com.rrhh.reclutamiento.dto.ResumenProcesamientoCV;
import com.rrhh.shared.domain.model.Postulante;
import com.rrhh.shared.domain.model.Puesto;

import java.util.List;
import java.util.Optional;

public interface IRecepcionCVService {
    List<Puesto> obtenerPuestosActivos();
    List<PostulanteRevisionDTO> obtenerPostulantesRevisionPorPuesto(Integer idPuesto);
    Optional<Postulante> obtenerPostulanteConCV(Integer idPostulante);
    List<ResumenProcesamientoCV> procesarCVsPorPuesto(Integer idPuesto);
}
