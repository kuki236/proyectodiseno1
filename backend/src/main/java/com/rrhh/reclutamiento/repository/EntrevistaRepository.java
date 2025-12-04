package com.rrhh.reclutamiento.repository;

import com.rrhh.shared.domain.model.Entrevista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EntrevistaRepository extends JpaRepository<Entrevista, Integer> {
    
    List<Entrevista> findByIdCandidato(Integer idCandidato);
    
    List<Entrevista> findByIdProceso(Integer idProceso);
    
    List<Entrevista> findByEstado(String estado);
    
    @Query("SELECT e FROM Entrevista e WHERE e.estado = 'PENDIENTE'")
    List<Entrevista> findEntrevistasPendientes();
    
    @Query("SELECT e FROM Entrevista e WHERE " +
           "e.fecha = :fecha AND e.hora = :hora AND e.entrevistador = :entrevistador")
    List<Entrevista> verificarDisponibilidad(
        @Param("fecha") LocalDate fecha,
        @Param("hora") java.time.LocalTime hora,
        @Param("entrevistador") String entrevistador
    );
}

