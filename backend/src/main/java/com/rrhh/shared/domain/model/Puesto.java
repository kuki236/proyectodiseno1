package com.rrhh.shared.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "puestos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Puesto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_puesto")
    private Integer idPuesto;

    @Column(name = "nombre_puesto", nullable = false, length = 120)
    private String nombrePuesto;

    @Column(name = "departamento", nullable = false, length = 120)
    private String departamento;

    @Column(name = "area", nullable = false, length = 120)
    private String area;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "nivel_jerarquico", length = 50)
    private String nivelJerarquico;

    @Column(name = "salario_minimo")
    private Double salarioMinimo;

    @Column(name = "salario_maximo")
    private Double salarioMaximo;

    @Column(name = "activo")
    private Boolean activo;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        if (activo == null) {
            activo = true;
        }
    }
}
