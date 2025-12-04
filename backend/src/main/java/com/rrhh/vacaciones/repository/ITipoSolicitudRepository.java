package com.rrhh.vacaciones.repository;

import com.rrhh.vacaciones.model.TipoSolicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ITipoSolicitudRepository extends JpaRepository<TipoSolicitud, Integer> {
    // JpaRepository ya provee findAll(), findById(), save(), etc.
    // Se pueden agregar métodos como findByNombre si fuera necesario.
}