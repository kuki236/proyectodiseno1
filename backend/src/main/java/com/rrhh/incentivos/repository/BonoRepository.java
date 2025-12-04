package com.rrhh.incentivos.repository;

import com.rrhh.incentivos.domain.model.Bono;
import com.rrhh.incentivos.domain.model.EstadoBono;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BonoRepository extends JpaRepository<Bono, Integer> {

    List<Bono> findByEmpleadoIdEmpleado(Integer idEmpleado);

    List<Bono> findByEmpleadoIdEmpleadoAndPeriodo(Integer idEmpleado, String periodo);
    List<Bono> findByPeriodo(String periodo);
    @Query("SELECT b FROM Bono b WHERE b.estado = 'PENDIENTE'")
    List<Bono> findBonosPendientes();
    @Query("SELECT SUM(b.monto) FROM Bono b WHERE b.periodo = :periodo")
    BigDecimal sumMontoTotalPorPeriodo(@Param("periodo") String periodo);

    long countByEstado(EstadoBono estado);
    
    @Query("SELECT b.periodo, SUM(b.monto) FROM Bono b GROUP BY b.periodo ORDER BY b.periodo DESC LIMIT 6")
    List<Object[]> findEvolucionSemestral();

    @Query("SELECT SUM(b.monto) FROM Bono b WHERE b.periodo = :periodo AND b.estado = :estado")
    BigDecimal sumMontoPorPeriodoYEstado(@Param("periodo") String periodo, @Param("estado") EstadoBono estado);

    @Query("SELECT SUM(b.monto) FROM Bono b WHERE b.periodo = :periodo")
    BigDecimal sumTotalPeriodo(@Param("periodo") String periodo);

    @Query("SELECT b FROM Bono b WHERE b.estado = 'PENDIENTE' AND b.periodo = :periodo")
    List<Bono> findPendientesPorPeriodo(@Param("periodo") String periodo);
    @Query("SELECT b FROM Bono b WHERE b.periodo LIKE %:anio%")
    List<Bono> findByAnio(@Param("anio") String anio);
    List<Bono> findTop5ByEmpleadoIdEmpleadoOrderByFechaCalculoDesc(Integer idEmpleado);
}