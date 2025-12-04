package com.rrhh.incentivos.domain.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "reglas_incentivos")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "id_tipo_incentivo", discriminatorType = DiscriminatorType.STRING)
public abstract class ReglaIncentivo { // <-- Abstracta

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_regla")
    private Integer idRegla;

    @Column(name = "nombre_regla")
    private String nombreRegla;

    @Column(name = "condicion")
    private String condicion;

    @Column(name = "valor_calculo")
    private BigDecimal valorCalculo;

    @Column(name = "tipo_valor")
    private String tipoValor;

    @Column(name = "periodo_aplicacion")
    private String periodo;

    @Column(name = "activo")
    private Boolean activo;


    @Column(name = "descripcion_recompensa")
    private String descripcionRecompensa;

    // Método abstracto del diagrama (IBonificable)
    public abstract BigDecimal calcularBono(Meta meta);
}