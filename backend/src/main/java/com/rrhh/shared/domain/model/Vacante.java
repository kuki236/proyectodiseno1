package com.rrhh.shared.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.rrhh.shared.domain.enums.EstadoVacante;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vacantes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vacante {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_vacante")
    private Integer idVacante;
    
    @Column(name = "id_reclutador")
    private Integer idReclutador;
    
    @Column(name = "nombre", nullable = false, length = 200)
    private String nombre;
    
    @Column(name = "requisitos", columnDefinition = "TEXT")
    private String requisitos;
    
    @Column(name = "modalidad", length = 50)
    private String modalidad;
    
    @Column(name = "rango_salarial", length = 100)
    private String rangoSalarial;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    private EstadoVacante estado;
    
    @Column(name = "fecha_publicacion")
    private LocalDate fechaPublicacion;
    
    @Column(name = "fecha_cierre")
    private LocalDate fechaCierre;
    
    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(name = "departamento", length = 100)
    private String departamento;
    
    @Column(name = "prioridad", length = 50)
    private String prioridad;
    
    @Column(name = "tipo_contrato", length = 50)
    private String tipoContrato;
    
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
        if (estado == null) {
            estado = EstadoVacante.PAUSADA;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
    
    // Relaciones
    // Nota: PostulanteProceso se relaciona con Vacante indirectamente a través de ProcesoSeleccion
    // No hay relación directa en la base de datos (postulantes_proceso no tiene id_vacante)
    
    @OneToOne(mappedBy = "vacante", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private ProcesoSeleccion procesoSeleccion;
    
    // Métodos de negocio
    public void publicar() {
        this.estado = EstadoVacante.ABIERTA;
        this.fechaPublicacion = LocalDate.now();
    }
    
    public void cerrar() {
        this.estado = EstadoVacante.CERRADA;
        this.fechaCierre = LocalDate.now();
    }
}

