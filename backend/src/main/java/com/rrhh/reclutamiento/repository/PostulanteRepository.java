package com.rrhh.reclutamiento.repository;

import com.rrhh.shared.domain.model.Postulante;
import com.rrhh.shared.domain.enums.EstadoPostulante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostulanteRepository extends JpaRepository<Postulante, Integer> {

    Optional<Postulante> findByEmail(String email);

    List<Postulante> findByEstadoPostulacion(EstadoPostulante estado);

    @Query("SELECT DISTINCT p FROM Postulante p " +
           "LEFT JOIN FETCH p.experiencias " +
           "LEFT JOIN FETCH p.formacionesAcademicas " +
           "WHERE p.estadoPostulacion <> :estado")
    List<Postulante> findByEstadoPostulacionNot(@Param("estado") EstadoPostulante estado);

    @Query("SELECT DISTINCT p FROM Postulante p " +
           "LEFT JOIN FETCH p.experiencias " +
           "LEFT JOIN FETCH p.formacionesAcademicas " +
           "WHERE p.estadoPostulacion <> :estadoExcluido AND (" +
           "LOWER(p.nombres) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.apellidoPaterno) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Postulante> buscarPorTexto(@Param("search") String search,
                                    @Param("estadoExcluido") EstadoPostulante estadoExcluido);

    @Query("SELECT DISTINCT p FROM Postulante p " +
           "LEFT JOIN FETCH p.cv cv " +
           "LEFT JOIN FETCH cv.datosExtraidos " +
           "LEFT JOIN FETCH p.formacionesAcademicas " +
           "LEFT JOIN FETCH p.experiencias " +
           "WHERE p.idPostulante = :id")
    Optional<Postulante> findByIdWithCV(@Param("id") Integer id);

    @Query("SELECT DISTINCT p FROM Postulante p " +
           "LEFT JOIN FETCH p.habilidades ph " +
           "LEFT JOIN FETCH ph.habilidad " +
           "WHERE p.idPostulante = :id")
    Optional<Postulante> findByIdWithHabilidades(@Param("id") Integer id);

    @Query("SELECT DISTINCT p FROM Postulante p " +
            "LEFT JOIN FETCH p.cv cv " +
            "LEFT JOIN FETCH p.experiencias " +
            "LEFT JOIN FETCH p.formacionesAcademicas " +
            "LEFT JOIN FETCH p.habilidades ph " +
            "LEFT JOIN FETCH ph.habilidad " +
            "WHERE p.idPostulante = :id")
    Optional<Postulante> findByIdWithDetalles(@Param("id") Integer id);
}
