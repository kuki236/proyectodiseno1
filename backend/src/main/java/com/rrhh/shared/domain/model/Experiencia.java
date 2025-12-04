package com.rrhh.shared.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "experiencias")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Experiencia {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_experiencia")
    private Integer idExperiencia;
    
    @Column(name = "id_postulante")
    private Integer idPostulante;
    
    @Column(name = "empresa", length = 200)
    private String empresa;
    
    @Column(name = "cargo", length = 200)
    private String cargo;

    @Column(name = "funciones_principales", columnDefinition = "TEXT")
    private String funcionesPrincipales;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "referencia_contacto", length = 200)
    private String referenciaContacto;

    @Column(name = "telefono_referencia", length = 20)
    private String telefonoReferencia;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
    
    // Relaciones
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_postulante", insertable = false, updatable = false)
    @JsonIgnoreProperties(value = {"experiencias", "habilidades", "cv", "procesos"}, allowSetters = true)
    private Postulante postulante;

    public String describirExperiencia() {
        return String.format("%s en %s (%s - %s)",
            cargo, empresa, fechaInicio, fechaFin != null ? fechaFin : "Actual");
    }
}

