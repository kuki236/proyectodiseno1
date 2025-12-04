package com.rrhh.incentivos.domain.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.math.BigDecimal;

@Entity
@DiscriminatorValue("2")
public class ReglaAtencion extends ReglaIncentivo {

    @Override
    public BigDecimal calcularBono(Meta meta) {
        return this.getValorCalculo();
    }
}