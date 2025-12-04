package com.rrhh.vacaciones.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "empleados")
public class Trabajador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empleado")
    private Integer idEmpleado;

    @Column(name = "nombres")
    private String nombres;

    // Renombramos 'apellidos' a 'apellidoPaterno' para mayor claridad
    @Column(name = "apellido_paterno")
    private String apellidoPaterno;

    // Agregamos el campo que faltaba
    @Column(name = "apellido_materno")
    private String apellidoMaterno;

    @Column(name = "email")
    private String email;

    // Campo area para el reporte (opcional, si existe en tu BD 'empleados')
    // Si no existe columna 'area' en la tabla empleados, ignora esta línea o usa @Transient
    @Transient
    private String area;

    @Transient // No se guarda en la tabla empleados, es solo para mostrar
    private String puesto;

    @JsonIgnore
    @OneToMany(mappedBy = "empleado", fetch = FetchType.LAZY)
    private List<Solicitud> solicitudes;
}