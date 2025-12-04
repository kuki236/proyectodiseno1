package com.rrhh.vacaciones.model;

import com.rrhh.shared.domain.model.Usuario;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "historial_solicitudes")
public class HistorialSolicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial")
    private Integer idHistorial; // En diagrama no tiene ID, pero JPA lo requiere

    @Column(name = "fecha_cambio")
    private LocalDateTime fechaAccion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_nuevo")
    private Estado estado;

    @Column(name = "comentarios")
    private String comentarios;

    // Relación inversa con Solicitud
    @ManyToOne
    @JoinColumn(name = "id_solicitud", nullable = false)
    private Solicitud solicitud;

    @Column(name = "id_usuario_accion")
    private Integer idUsuarioAccion; // Quién hizo el cambio

    @ManyToOne
    @JoinColumn(name = "id_usuario_accion", insertable = false, updatable = false)
    private Usuario usuarioAccion;
}