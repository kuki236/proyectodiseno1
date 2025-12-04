package com.rrhh.reclutamiento.repository;

import com.rrhh.shared.domain.model.ProcesoSeleccion;
import com.rrhh.shared.domain.enums.EtapaProceso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProcesoSeleccionRepository extends JpaRepository<ProcesoSeleccion, Integer> {
    
    Optional<ProcesoSeleccion> findByIdVacante(Integer idVacante);
    
    List<ProcesoSeleccion> findByEtapaActual(EtapaProceso etapa);
}

