package com.rrhh.shared.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.rrhh.shared.domain.enums.EstadoPostulante;
import com.rrhh.shared.domain.enums.EtapaProceso;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "postulantes_proceso")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"postulante", "procesoSeleccion"})
@NoArgsConstructor
@AllArgsConstructor
public class PostulanteProceso {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_postulante_proceso")
    @EqualsAndHashCode.Include
    private Integer idPostulanteProceso;
    
    @Column(name = "id_postulante")
    private Integer idPostulante;
    
    @Column(name = "id_proceso_actual")
    private Integer idProcesoActual;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "etapa_actual")
    private EtapaProceso etapaActual;
    
    @Column(name = "calificacion", precision = 5, scale = 2)
    private BigDecimal calificacion;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    private EstadoPostulante estado;
    
    @Column(name = "fecha_vinculacion", updatable = false)
    private LocalDateTime fechaVinculacion;
    
    @Column(name = "fecha_ultima_actualizacion")
    private LocalDateTime fechaUltimaActualizacion;
    
    @Column(name = "motivo_rechazo", columnDefinition = "TEXT")
    private String motivoRechazo;
    
    @PrePersist
    protected void onCreate() {
        fechaVinculacion = LocalDateTime.now();
        fechaUltimaActualizacion = LocalDateTime.now();
        if (etapaActual == null) {
            etapaActual = EtapaProceso.REVISION_CV;
        }
        if (estado == null) {
            estado = EstadoPostulante.ACTIVO;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaUltimaActualizacion = LocalDateTime.now();
    }
    
    // Relaciones
    @ManyToOne
    @JoinColumn(name = "id_postulante", insertable = false, updatable = false)
    @JsonIgnoreProperties({"experiencias", "habilidades", "cv", "procesos", "formacionesAcademicas"})
    private Postulante postulante;
    
    @ManyToOne
    @JoinColumn(name = "id_proceso_actual", insertable = false, updatable = false)
    private ProcesoSeleccion procesoSeleccion;
    
    // Métodos de negocio
    public void avanzarEtapa(EtapaProceso nuevaEtapa) {
        this.etapaActual = nuevaEtapa;
        this.fechaUltimaActualizacion = LocalDateTime.now();
    }
    
    public void actualizarEstado(EstadoPostulante nuevoEstado) {
        this.estado = nuevoEstado;
        this.fechaUltimaActualizacion = LocalDateTime.now();
    }
}

