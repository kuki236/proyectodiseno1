package com.rrhh.reclutamiento.repository;

import com.rrhh.shared.domain.enums.EtapaProceso;
import com.rrhh.shared.domain.enums.EstadoVacante;
import com.rrhh.shared.domain.model.Vacante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VacanteRepository extends JpaRepository<Vacante, Integer> {
    
    List<Vacante> findByEstado(EstadoVacante estado);
    
    List<Vacante> findByDepartamento(String departamento);

    List<Vacante> findByPrioridad(String prioridad);

    @Query("SELECT v FROM Vacante v " +
           "JOIN v.procesoSeleccion p " +
           "WHERE v.estado = :estado AND p.etapaActual = :etapa")
    List<Vacante> findByEstadoAndEtapa(
        @Param("estado") EstadoVacante estado,
        @Param("etapa") EtapaProceso etapa
    );
    
    @Query("SELECT v FROM Vacante v WHERE " +
           "v.estado = :estado AND " +
           "(:departamento IS NULL OR v.departamento = :departamento) AND " +
           "(:prioridad IS NULL OR v.prioridad = :prioridad)")
    List<Vacante> buscarConFiltros(
        @Param("estado") EstadoVacante estado,
        @Param("departamento") String departamento,
        @Param("prioridad") String prioridad
    );
}

