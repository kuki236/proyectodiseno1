package com.rrhh.vacaciones.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "saldos_vacaciones")
public class SaldoVacaciones {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_saldo")
    private Integer idSaldo;

    @Column(name = "anio")
    private Integer anio;

    @Column(name = "dias_asignados")
    private Integer diasAsignados;

    @Column(name = "dias_tomados")
    private Integer diasTomados;

    @Column(name = "dias_pendientes", insertable = false, updatable = false)
    private Integer diasPendientes;

    // --- AGREGAR ESTE CAMPO ---
    @Column(name = "dias_vencidos")
    private Integer diasVencidos;
    // --------------------------

    @ManyToOne
    @JoinColumn(name = "id_empleado")
    private Trabajador empleado;
}