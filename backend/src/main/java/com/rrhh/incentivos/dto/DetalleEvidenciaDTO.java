package com.rrhh.incentivos.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DetalleEvidenciaDTO {
    private String tipoEvidencia; // VENTA o ATENCION
    private String resumen;       // Texto generado por obtenerResumen()
    
    // Campos específicos Venta
    private String idBoleta;
    private BigDecimal montoVendido;

    // Campos específicos Atención
    private String idTicket;
    private String satisfaccionCliente;
}