package com.rrhh.reclutamiento.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ResumenProcesamientoCV {
    Integer idPostulante;
    Integer idCV;
    int formacionesAgregadas;
    int experienciasAgregadas;
    int habilidadesAgregadas;
    String mensaje;
}
