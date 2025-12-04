package com.rrhh.reclutamiento.repository;

import com.rrhh.shared.domain.model.Habilidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface HabilidadRepository extends JpaRepository<Habilidad, Integer> {

    @Query("SELECT h FROM Habilidad h WHERE LOWER(h.nombreHabilidad) = LOWER(:nombre)")
    Optional<Habilidad> findByNombreIgnoreCase(@Param("nombre") String nombre);
}
