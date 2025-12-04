package com.rrhh.incentivos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rrhh.incentivos.domain.model.Meta;

import java.util.List;
import java.util.Optional;

@Repository
public interface MetaRepository extends JpaRepository<Meta, Integer> {

    long countByPeriodo(String periodo);

    @Query("SELECT COUNT(m) FROM Meta m WHERE m.periodo = :periodo AND m.valorActual >= m.valorObjetivo")
    long countMetasCumplidas(@Param("periodo") String periodo);

    @Query("SELECT m FROM Meta m WHERE m.idDepartamento = :departamento AND m.periodo = :periodo AND m.empleado IS NULL")
    Optional<Meta> findMetaGlobal(@Param("departamento") String departamento, @Param("periodo") String periodo);

    Optional<Meta> findByEmpleadoIdEmpleadoAndPeriodo(Integer idEmpleado, String periodo);

    
    @Query(value = """
        SELECT m.* FROM metas m
        INNER JOIN empleados e ON m.id_empleado = e.id_empleado
        INNER JOIN empleados_puestos ep ON e.id_empleado = ep.id_empleado
        INNER JOIN puestos p ON ep.id_puesto = p.id_puesto
        WHERE p.departamento = :departamento 
        AND m.periodo = :periodo
        AND ep.activo = 1
        """, nativeQuery = true)
    List<Meta> findMetasIndividuales(@Param("departamento") String departamento, @Param("periodo") String periodo);
}