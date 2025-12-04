package com.rrhh.vacaciones.repository;

import com.rrhh.vacaciones.model.HistorialSolicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IHistorialSolicitudRepository extends JpaRepository<HistorialSolicitud, Integer> {

    // Para el comando: VerHistorial
    // Recupera todo el historial de una solicitud ordenado por fecha (el más reciente primero)
    @Query("SELECT h FROM HistorialSolicitud h " +
            "LEFT JOIN FETCH h.usuarioAccion " + // <--- La magia está aquí
            "WHERE h.solicitud.idSolicitud = :idSolicitud " +
            "ORDER BY h.fechaAccion DESC")
    List<HistorialSolicitud> findBySolicitudIdSolicitudOrderByFechaAccionDesc(@Param("idSolicitud") Integer idSolicitud);
}