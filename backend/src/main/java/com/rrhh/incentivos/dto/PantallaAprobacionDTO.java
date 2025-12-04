package com.rrhh.incentivos.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class PantallaAprobacionDTO {
    private BigDecimal totalBolsa;   
    private BigDecimal yaAprobado;      
    private BigDecimal porAprobar;     
    
    private List<BonoAprobacionDTO> bonos;
}