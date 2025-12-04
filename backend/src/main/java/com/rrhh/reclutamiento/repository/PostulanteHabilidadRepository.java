package com.rrhh.reclutamiento.repository;

import com.rrhh.shared.domain.model.PostulanteHabilidad;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostulanteHabilidadRepository extends JpaRepository<PostulanteHabilidad, Integer> {
    boolean existsByIdPostulanteAndIdHabilidad(Integer idPostulante, Integer idHabilidad);

    boolean existsByIdPostulante(Integer idPostulante);
}
