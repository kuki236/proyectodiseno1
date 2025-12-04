package com.rrhh.reclutamiento.repository;

import com.rrhh.shared.domain.model.FormacionAcademica;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormacionAcademicaRepository extends JpaRepository<FormacionAcademica, Integer> {
    boolean existsByIdPostulanteAndInstitucionAndCarreraAndNivelEstudiosAndSituacion(
            Integer idPostulante,
            String institucion,
            String carrera,
            String nivelEstudios,
            String situacion
    );

    boolean existsByIdPostulante(Integer idPostulante);
}
