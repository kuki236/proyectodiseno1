package com.rrhh.reclutamiento.dto;

import lombok.Data;

@Data
public class CVGoogleDriveDTO {
    private Integer idPostulante;
    private Integer idVacante;
    private String enlaceGoogleDrive;
    private String fuente;
}
