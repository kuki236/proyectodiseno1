package com.rrhh.shared.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "cvs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CV {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cv")
    private Integer idCV;
    
    @Column(name = "id_postulante")
    private Integer idPostulante;
    
    @Column(name = "nombre_archivo", nullable = false, length = 255)
    private String nombreArchivo;
    
    @Column(name = "ruta_archivo", nullable = false, length = 500)
    private String rutaArchivo;
    
    @Column(name = "tipo_archivo", nullable = false, length = 50)
    private String tipoArchivo;
    
    @Column(name = "tamanio_archivo", nullable = false)
    private Long tamanioArchivo;
    
    @Column(name = "fecha_carga", updatable = false)
    private LocalDateTime fechaCarga;
    
    @Column(name = "estado", length = 50)
    private String estado;
    
    @Column(name = "fuente", length = 100)
    private String fuente;
    
    // Campo de compatibilidad con datos existentes
    // El procesamiento de CVs es responsabilidad del módulo de recepción
    @Column(name = "procesado_por")
    private Integer procesadoPor;
    
    @Column(name = "fecha_procesamiento")
    private LocalDateTime fechaProcesamiento;
    
    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;
    
    @PrePersist
    protected void onCreate() {
        fechaCarga = LocalDateTime.now();
        if (estado == null) {
            estado = "PENDIENTE";
        }
    }
    
    // Relaciones
    @ManyToOne
    @JoinColumn(name = "id_postulante", insertable = false, updatable = false)
    @JsonIgnore
    private Postulante postulante;
    
    @OneToOne(mappedBy = "cv", fetch = FetchType.LAZY)
    private CVDatosExtraidos datosExtraidos;
    
    public boolean validarFormato() {
        if (nombreArchivo == null) return false;
        String extension = nombreArchivo.substring(nombreArchivo.lastIndexOf(".") + 1).toLowerCase();
        return extension.equals("pdf") || extension.equals("doc") || extension.equals("docx");
    }
}

