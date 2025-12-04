package com.rrhh.reclutamiento.repository;

import com.rrhh.shared.domain.model.Experiencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface ExperienciaRepository extends JpaRepository<Experiencia, Integer> {
    boolean existsByIdPostulanteAndEmpresaAndCargoAndFechaInicio(
            Integer idPostulante,
            String empresa,
            String cargo,
            LocalDate fechaInicio
    );

    boolean existsByIdPostulante(Integer idPostulante);
}
