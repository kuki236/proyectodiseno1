package com.rrhh.shared.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cv_datos_extraidos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CVDatosExtraidos {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_extraccion")
    private Integer idExtraccion;
    
    @Column(name = "id_cv", nullable = false)
    private Integer idCV;
    
    @Column(name = "nombres", length = 200)
    private String nombres;
    
    @Column(name = "apellidos", length = 200)
    private String apellidos;
    
    @Column(name = "email", length = 100)
    private String email;
    
    @Column(name = "telefono", length = 20)
    private String telefono;
    
    @Column(name = "direccion", columnDefinition = "TEXT")
    private String direccion;
    
    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;
    
    @Column(name = "nivel_educacion", length = 100)
    private String nivelEducacion;
    
    @Column(name = "institucion", length = 200)
    private String institucion;
    
    @Column(name = "carrera", length = 200)
    private String carrera;
    
    @Column(name = "anio_graduacion")
    private Integer anioGraduacion;
    
    @Column(name = "experiencia_anios")
    private Integer experienciaAnios;
    
    @Column(name = "habilidades_extraidas", columnDefinition = "TEXT")
    private String habilidadesExtraidas;
    
    @Column(name = "datos_json", columnDefinition = "TEXT")
    private String datosJson;
    
    @Column(name = "confianza_extraccion", precision = 5, scale = 2)
    private BigDecimal confianzaExtraccion;
    
    @Column(name = "fecha_extraccion", updatable = false)
    private LocalDateTime fechaExtraccion;
    
    @PrePersist
    protected void onCreate() {
        fechaExtraccion = LocalDateTime.now();
        if (confianzaExtraccion == null) {
            confianzaExtraccion = BigDecimal.ZERO;
        }
    }
    
    // Relaciones
    @OneToOne
    @JoinColumn(name = "id_cv", insertable = false, updatable = false)
    @JsonIgnore
    private CV cv;
}

