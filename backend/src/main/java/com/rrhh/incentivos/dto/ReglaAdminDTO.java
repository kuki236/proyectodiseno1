package com.rrhh.incentivos.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ReglaAdminDTO {
    private Integer id;
    private String nombre;
    private String condicionLogica;  // Ej: "<> monto_venta > 5000"
    private String recompensa;       // Texto formateado: "$ 5%", "S/ 100", "Viaje Cancún"
    private String periodo;          // "Mensual"
    private boolean estado;          // Para el toggle switch (true/false)
    private String categoria;        // Para saber en qué pestaña ponerlo
}