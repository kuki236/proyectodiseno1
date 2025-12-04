package com.rrhh.incentivos.domain.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "evidencias_incentivos")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo_evidencia", discriminatorType = DiscriminatorType.STRING)
public abstract class Evidencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evidencia")
    private Integer idEvidencia;

    @ManyToOne
    @JoinColumn(name = "id_bono")
    private Bono bono;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    @Column(name = "tipo_evidencia", insertable = false, updatable = false)
    @Enumerated(EnumType.STRING)
    private TipoEvidencia tipoEvidencia;

    // Método abstracto del diagrama
    public abstract String obtenerResumen();
}