package com.rrhh.shared.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "habilidades_tecnicas")
@DiscriminatorValue("TECNICA")
@PrimaryKeyJoinColumn(name = "id_habilidad")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class HabilidadTecnica extends Habilidad {
    
    @Column(name = "tecnologia", length = 100)
    private String tecnologia;
    
    @Column(name = "nivel_dominio", length = 50)
    private String nivelDominio;
    
    @Column(name = "certificacion", length = 200)
    private String certificacion;
    
    @Override
    public String describirHabilidad() {
        return String.format("%s - Tecnología: %s, Nivel: %s", 
            getNombreHabilidad(), tecnologia, nivelDominio);
    }
}

