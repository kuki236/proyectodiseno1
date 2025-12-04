package com.rrhh.shared.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.rrhh.shared.domain.enums.EtapaProceso;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "procesos_seleccion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcesoSeleccion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_proceso")
    private Integer idProceso;
    
    @Column(name = "id_vacante", unique = true)
    private Integer idVacante;

    @Column(name = "id_puesto")
    private Integer idPuesto;
    
    @Column(name = "nombre_proceso", length = 200)
    private String nombreProceso;
    
    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "etapa_actual")
    private EtapaProceso etapaActual;
    
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
    
    // Relaciones
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_vacante", insertable = false, updatable = false)
    @JsonIgnore
    private Vacante vacante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_puesto", insertable = false, updatable = false)
    @JsonIgnore
    private Puesto puesto;
    
    @OneToMany(mappedBy = "procesoSeleccion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<PostulanteProceso> candidatos = new ArrayList<>();
    
    @OneToMany(mappedBy = "procesoSeleccion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Entrevista> entrevistas = new ArrayList<>();
    
    @OneToMany(mappedBy = "procesoSeleccion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Evaluacion> evaluaciones = new ArrayList<>();
    
    // Nota: Las ofertas se relacionan con ProcesoSeleccion indirectamente a través de Vacante
    // No hay relación directa en la base de datos (ofertas no tiene id_proceso)
    
    // Métodos de negocio
    public void iniciar() {
        this.fechaInicio = LocalDate.now();
        this.etapaActual = EtapaProceso.REVISION_CV;
    }
}

