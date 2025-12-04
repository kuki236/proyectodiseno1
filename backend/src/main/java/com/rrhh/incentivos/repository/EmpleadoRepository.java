package com.rrhh.incentivos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rrhh.incentivos.domain.model.EmpleadoInc;

import java.util.Optional;

@Repository
public interface EmpleadoRepository extends JpaRepository<EmpleadoInc, Integer> {

    
    long countByEstado(String estado);


    Optional<EmpleadoInc> findByDni(String dni);

    Optional<EmpleadoInc> findByCodigoEmpleado(String codigoEmpleado);

    Optional<EmpleadoInc> findByEmailCorporativo(String emailCorporativo);

    Optional<EmpleadoInc> findByUsuarioIdUsuario(Integer idUsuario);
}