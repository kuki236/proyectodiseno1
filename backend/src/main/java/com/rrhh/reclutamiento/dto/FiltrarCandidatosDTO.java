package com.rrhh.reclutamiento.dto;

import com.rrhh.shared.domain.enums.EtapaProceso;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
public class FiltrarCandidatosDTO {
    private Integer idVacante;
    private EtapaProceso etapa;
    private Map<String, Object> criterios;
    private String nombre;
    private String email;
    private String puesto;
    private BigDecimal calificacionMinima;
}

