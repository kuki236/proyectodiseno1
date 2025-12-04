// Archivo: backend/src/main/java/com/rrhh/vacaciones/model/Solicitud.java
package com.rrhh.vacaciones.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.ArrayList;

@Data // Esto genera automáticamente los Getters y Setters
@Entity
@Table(name = "solicitudes")
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Integer idSolicitud;

    // --- ASEGÚRATE DE TENER ESTE CAMPO ---
    @Column(name = "fecha_solicitud")
    private LocalDate fechaSolicitud;
    // -------------------------------------

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "motivo")
    private String motivo;

    @Column(name = "motivo_rechazo")
    private String motivoRechazo;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    private Estado estado;

    @Column(name = "dias_solicitados")
    private Integer diasSolicitados;

    @ManyToOne
    @JoinColumn(name = "id_empleado")
    private Trabajador empleado; // O Empleado según tu implementación

    @ManyToOne
    @JoinColumn(name = "id_tipo_solicitud")
    private TipoSolicitud tipoSolicitud;

    @JsonIgnore
    @OneToMany(mappedBy = "solicitud", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HistorialSolicitud> historial = new ArrayList<>();

    @Transient
    private List<Documento> documentos;

    @Column(name = "archivo_adjunto")
    private String rutaArchivoAdjunto;

    public void calcularDias() {
        if (fechaInicio != null && fechaFin != null) {
            this.diasSolicitados = (int) ChronoUnit.DAYS.between(fechaInicio, fechaFin) + 1;
        }
    }

    public void agregarHistorial(HistorialSolicitud nuevoHistorial) {
        this.historial.add(nuevoHistorial);
        nuevoHistorial.setSolicitud(this);
    }
}