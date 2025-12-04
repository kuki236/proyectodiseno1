package com.rrhh.shared.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evaluacion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evaluacion")
    private Integer idEvaluacion;
    
    @Column(name = "id_proceso")
    private Integer idProceso;
    
    @Column(name = "id_candidato")
    private Integer idCandidato;
    
    @Column(name = "fecha")
    private LocalDate fecha;
    
    @Column(name = "puntuacion", precision = 5, scale = 2)
    private BigDecimal puntuacion;
    
    @Column(name = "comentarios", columnDefinition = "TEXT")
    private String comentarios;
    
    @Column(name = "estado", length = 50)
    private String estado;
    
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
    
    // Relaciones
    @ManyToOne
    @JoinColumn(name = "id_proceso", insertable = false, updatable = false)
    private ProcesoSeleccion procesoSeleccion;
}

