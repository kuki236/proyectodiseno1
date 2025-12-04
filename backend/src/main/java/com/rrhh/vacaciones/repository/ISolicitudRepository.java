package com.rrhh.vacaciones.repository;

import com.rrhh.vacaciones.model.Estado;
import com.rrhh.vacaciones.model.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ISolicitudRepository extends JpaRepository<Solicitud, Integer> {

    // Para el comando: BuscarMisSolicitudes
    // Busca todas las solicitudes asociadas a un empleado específico
    List<Solicitud> findByEmpleadoIdEmpleado(Integer idEmpleado);

    // Para el comando: BuscarSolicitudesPorEstado
    List<Solicitud> findByEstado(Estado estado);

    // Para el comando: BuscarSolicitudesPorPeriodo
    // Busca solicitudes que inicien después de una fecha dada
    List<Solicitud> findByFechaInicioAfter(LocalDate fechaInicio);

    // Para el comando: BuscarSolicitudesPorPeriodoYEstado
    List<Solicitud> findByEstadoAndFechaInicioAfter(Estado estado, LocalDate fechaInicio);

    // Consulta personalizada para buscar solapamientos o rangos específicos
    @Query("SELECT s FROM Solicitud s WHERE s.fechaInicio >= :inicio AND s.fechaFin <= :fin")
    List<Solicitud> findByRangoFechas(@Param("inicio") LocalDate inicio, @Param("fin") LocalDate fin);
}