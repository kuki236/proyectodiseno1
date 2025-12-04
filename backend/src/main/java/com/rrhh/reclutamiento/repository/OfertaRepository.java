package com.rrhh.reclutamiento.repository;

import com.rrhh.shared.domain.model.Oferta;
import com.rrhh.shared.domain.enums.EstadoOferta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfertaRepository extends JpaRepository<Oferta, Integer> {
    
    List<Oferta> findByEstadoOferta(EstadoOferta estado);
    
    List<Oferta> findByIdVacante(Integer idVacante);
    
    @Query("SELECT o FROM Oferta o WHERE o.idCandidato = :idCandidato")
    List<Oferta> findByIdCandidato(@Param("idCandidato") Integer idCandidato);
    
    @Query("SELECT o FROM Oferta o WHERE o.estadoOferta = 'PENDIENTE'")
    List<Oferta> findOfertasPendientes();
}

