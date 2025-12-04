package com.rrhh.incentivos.domain.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@DiscriminatorValue("VENTA")
public class EvidenciaVenta extends Evidencia {

    @Column(name = "venta_id_boleta")
    private String idBoleta;

    @Column(name = "venta_id_venta")
    private String idVenta;

    @Column(name = "venta_monto_vendido")
    private BigDecimal montoVendido;

    @Override
    public String obtenerResumen() {
        return "Venta #" + idVenta + " (Boleta: " + idBoleta + ") - Monto: " + montoVendido;
    }
}