package com.rrhh.shared.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "formacion_academica")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormacionAcademica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_formacion")
    private Integer idFormacion;

    @Column(name = "id_postulante", nullable = false)
    private Integer idPostulante;

    @Column(name = "nivel_estudios", nullable = false, length = 100)
    private String nivelEstudios;

    @Column(name = "situacion", nullable = false, length = 100)
    private String situacion;

    @Column(name = "carrera", length = 200)
    private String carrera;

    @Column(name = "institucion", nullable = false, length = 200)
    private String institucion;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "cursos_relevantes", columnDefinition = "TEXT")
    private String cursosRelevantes;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_postulante", insertable = false, updatable = false)
    @JsonIgnoreProperties({"experiencias", "habilidades", "cv", "procesos", "formacionesAcademicas"})
    private Postulante postulante;
}
