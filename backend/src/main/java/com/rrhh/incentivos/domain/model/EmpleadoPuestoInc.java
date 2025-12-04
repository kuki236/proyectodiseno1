package com.rrhh.incentivos.domain.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

import com.rrhh.shared.domain.model.Puesto;

@Data
@Entity
@Table(name = "empleados_puestos")
public class EmpleadoPuestoInc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empleado_puesto")
    private Integer idEmpleadoPuesto;

    @ManyToOne
    @JoinColumn(name = "id_empleado")
    private EmpleadoInc empleado;

    @ManyToOne
    @JoinColumn(name = "id_puesto")
    private Puesto puesto;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "activo")
    private Boolean activo;
}