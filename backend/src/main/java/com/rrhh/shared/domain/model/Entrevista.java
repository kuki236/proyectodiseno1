package com.rrhh.shared.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "entrevistas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Entrevista {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_entrevista")
    private Integer idEntrevista;
    
    @Column(name = "id_candidato")
    private Integer idCandidato;
    
    @Column(name = "id_proceso")
    private Integer idProceso;
    
    @Column(name = "fecha")
    private LocalDate fecha;
    
    @Column(name = "hora")
    private LocalTime hora;
    
    @Column(name = "lugar", length = 255)
    private String lugar;
    
    @Column(name = "entrevistador", length = 200)
    private String entrevistador;
    
    @Column(name = "estado", length = 50)
    private String estado;
    
    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;
    
    @Column(name = "calificacion", precision = 5, scale = 2)
    private BigDecimal calificacion;
    
    @Column(name = "tipo_entrevista", length = 50)
    private String tipoEntrevista;
    
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
        if (estado == null) {
            estado = "PENDIENTE";
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
    
    // Relaciones
    @ManyToOne
    @JoinColumn(name = "id_proceso", insertable = false, updatable = false)
    private ProcesoSeleccion procesoSeleccion;
}

