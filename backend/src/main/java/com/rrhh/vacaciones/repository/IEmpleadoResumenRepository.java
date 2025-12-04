package com.rrhh.vacaciones.repository;

import com.rrhh.vacaciones.model.EmpleadoResumen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IEmpleadoResumenRepository extends JpaRepository<EmpleadoResumen, Integer> {
    // Método para el buscador: busca por nombre completo
    List<EmpleadoResumen> findByNombreCompletoContainingIgnoreCase(String texto);
}