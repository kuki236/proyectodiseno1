package com.rrhh.reclutamiento.repository;

import com.rrhh.shared.domain.model.PostulanteProceso;
import com.rrhh.shared.domain.enums.EstadoPostulante;
import com.rrhh.shared.domain.enums.EtapaProceso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostulanteProcesoRepository extends JpaRepository<PostulanteProceso, Integer> {
    
    List<PostulanteProceso> findByIdProcesoActual(Integer idProceso);
    
    List<PostulanteProceso> findByEtapaActual(EtapaProceso etapa);
    
    List<PostulanteProceso> findByEstado(EstadoPostulante estado);
    
    @Query("SELECT DISTINCT pp FROM PostulanteProceso pp " +
           "JOIN FETCH pp.postulante p " +
           "LEFT JOIN FETCH p.experiencias " +
           "WHERE pp.idProcesoActual = :idProceso " +
           "AND pp.etapaActual = :etapa " +
           "AND p.estadoPostulacion <> :estadoExcluido")
    List<PostulanteProceso> findByProcesoYEtapa(
        @Param("idProceso") Integer idProceso,
        @Param("etapa") EtapaProceso etapa,
        @Param("estadoExcluido") EstadoPostulante estadoExcluido
    );
    
    @Query("SELECT DISTINCT pp FROM PostulanteProceso pp " +
           "JOIN FETCH pp.postulante p " +
           "LEFT JOIN FETCH p.experiencias " +
           "JOIN ProcesoSeleccion ps ON pp.idProcesoActual = ps.idProceso " +
           "WHERE ps.idVacante = :idVacante " +
           "AND p.estadoPostulacion <> :estadoExcluido")
    List<PostulanteProceso> findByVacante(@Param("idVacante") Integer idVacante,
                                          @Param("estadoExcluido") EstadoPostulante estadoExcluido);

    @Query("SELECT pp FROM PostulanteProceso pp " +
           "JOIN FETCH pp.postulante p " +
           "JOIN ProcesoSeleccion ps ON pp.idProcesoActual = ps.idProceso " +
           "WHERE ps.idPuesto = :idPuesto " +
           "AND pp.etapaActual = :etapa " +
           "AND p.estadoPostulacion <> :estadoExcluido")
    List<PostulanteProceso> findByPuestoYEtapa(
        @Param("idPuesto") Integer idPuesto,
        @Param("etapa") EtapaProceso etapa,
        @Param("estadoExcluido") EstadoPostulante estadoExcluido
    );
    
    Optional<PostulanteProceso> findByIdProcesoActualAndIdPostulante(Integer idProceso, Integer idPostulante);
}

