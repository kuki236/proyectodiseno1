package com.rrhh.shared.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "habilidades_blandas")
@DiscriminatorValue("BLANDA")
@PrimaryKeyJoinColumn(name = "id_habilidad")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class HabilidadBlanda extends Habilidad {
    
    @Column(name = "tipo_interaccion", length = 100)
    private String tipoInteraccion;
    
    @Column(name = "descripcion_habilidad", columnDefinition = "TEXT")
    private String descripcionHabilidad;
    
    @Override
    public String describirHabilidad() {
        return String.format("%s - Tipo: %s", 
            getNombreHabilidad(), tipoInteraccion);
    }
}

