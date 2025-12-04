package com.rrhh.vacaciones.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "tipos_solicitud")
public class TipoSolicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_solicitud")
    private Integer idTipoSolicitud;

    @Column(name = "nombre", nullable = false)
    private String nombre; // Equivalente a "tipoPermiso" String en tu diagrama

    @Column(name = "descripcion")
    private String descripcion;
}