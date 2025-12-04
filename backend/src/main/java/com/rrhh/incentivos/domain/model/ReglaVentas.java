package com.rrhh.incentivos.domain.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.math.BigDecimal;

@Entity
@DiscriminatorValue("1") 
public class ReglaVentas extends ReglaIncentivo {

    @Override
    public BigDecimal calcularBono(Meta meta) {
        if ("PORCENTAJE".equalsIgnoreCase(this.getTipoValor())) {
            return meta.getValorObjetivo().multiply(this.getValorCalculo().divide(BigDecimal.valueOf(100)));
        }
        return this.getValorCalculo(); 
    }
}