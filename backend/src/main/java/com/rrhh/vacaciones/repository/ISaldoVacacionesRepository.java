package com.rrhh.vacaciones.repository;

import com.rrhh.vacaciones.model.SaldoVacaciones;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ISaldoVacacionesRepository extends JpaRepository<SaldoVacaciones, Integer> {

    // Consulta para obtener el último saldo de cada empleado (año actual)
    @Query("SELECT s FROM SaldoVacaciones s JOIN FETCH s.empleado WHERE s.anio = YEAR(CURRENT_DATE)")
    List<SaldoVacaciones> findAllCurrentYear();

    // NUEVO: Buscar saldo por empleado y año
    Optional<SaldoVacaciones> findByEmpleadoIdEmpleadoAndAnio(Integer idEmpleado, Integer anio);

    // Traemos: [0]ID, [1]Departamento, [2]Area
    @Query(value = "SELECT e.id_empleado, p.departamento, p.area " +
            "FROM empleados e " +
            "JOIN empleados_puestos ep ON e.id_empleado = ep.id_empleado " +
            "JOIN puestos p ON ep.id_puesto = p.id_puesto " +
            "WHERE ep.activo = 1", nativeQuery = true)
    List<Object[]> obtenerDatosOrganizacionales();
}