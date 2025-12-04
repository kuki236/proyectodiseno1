package com.rrhh.incentivos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rrhh.incentivos.domain.model.ReglaIncentivo;

import java.util.List;

@Repository
public interface ReglaIncentivoRepository extends JpaRepository<ReglaIncentivo, Integer> {
    
    List<ReglaIncentivo> findByActivoTrue();

    List<ReglaIncentivo> findByNombreReglaContainingIgnoreCase(String nombre);
}