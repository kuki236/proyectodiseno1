package com.rrhh.incentivos.domain.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime; // Importación necesaria

@Data
@Entity
@Table(name = "metas")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo_meta", discriminatorType = DiscriminatorType.STRING)
public abstract class Meta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_meta")
    private Integer idMeta;

    @ManyToOne
    @JoinColumn(name = "id_empleado")
    private EmpleadoInc empleado;

    @Column(name = "id_departamento") 
    private String idDepartamento;

    @Column(name = "nombre_meta")
    private String nombreMeta;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;


    @Column(name = "valor_objetivo")
    private BigDecimal valorObjetivo;

    @Column(name = "valor_actual")
    private BigDecimal valorActual;

    @Column(name = "unidad_medida")
    private String unidadMedida;

    @Column(name = "periodo")
    private String periodo;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;
    
    @Column(name = "estado")
    private String estado;

    @Column(name = "incentivo_asociado")
    private BigDecimal incentivoAsociado;

    // --- Auditoría ---
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    // Métodos Lifecycle para manejar las fechas automáticamente
    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        this.fechaActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }

    public abstract boolean verificarCumplimiento();
}