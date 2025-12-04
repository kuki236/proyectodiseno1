package com.rrhh.incentivos.domain.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@DiscriminatorValue("VENTA") 
public class MetaVenta extends Meta {

    @Override
    public boolean verificarCumplimiento() {
        return this.getValorActual().compareTo(this.getValorObjetivo()) >= 0;
    }
}