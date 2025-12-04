package com.rrhh.shared.domain.model;

import com.rrhh.shared.domain.enums.EstadoOferta;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ofertas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Oferta {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_oferta")
    private Integer idOferta;
    
    @Column(name = "id_vacante")
    private Integer idVacante;
    
    @Column(name = "salario_ofrecido", precision = 10, scale = 2)
    private BigDecimal salarioOfrecido;
    
    @Column(name = "condiciones", columnDefinition = "TEXT")
    private String condiciones;
    
    @Column(name = "fecha_emision")
    private LocalDate fechaEmision;
    
    @Column(name = "fecha_respuesta")
    private LocalDate fechaRespuesta;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "estado_oferta")
    private EstadoOferta estadoOferta;
    
    @Column(name = "id_candidato")
    private Integer idCandidato;
    
    @Column(name = "motivo_rechazo", columnDefinition = "TEXT")
    private String motivoRechazo;
    
    @Column(name = "fecha_inicio_propuesta")
    private LocalDate fechaInicioPropuesta;
    
    @Column(name = "beneficios", columnDefinition = "TEXT")
    private String beneficios;
    
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
        if (estadoOferta == null) {
            estadoOferta = EstadoOferta.PENDIENTE;
        }
        if (fechaEmision == null) {
            fechaEmision = LocalDate.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
    
    // Relaciones
    @ManyToOne
    @JoinColumn(name = "id_vacante", insertable = false, updatable = false)
    private Vacante vacante;
    
    // Métodos de negocio
    public void aceptar() {
        this.estadoOferta = EstadoOferta.ACEPTADA;
        this.fechaRespuesta = LocalDate.now();
    }
    
    public void rechazar() {
        this.estadoOferta = EstadoOferta.RECHAZADA;
        this.fechaRespuesta = LocalDate.now();
    }
    
    public void cancelar() {
        this.estadoOferta = EstadoOferta.CANCELADA;
    }
}

