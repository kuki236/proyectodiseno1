package com.rrhh.incentivos.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BonoResumenDTO {
    private Integer idBono;
    private String concepto;       
    private String fecha;          
    private String estado;         
    
    private BigDecimal monto;      
    private String descripcionPremio; 
    private String tipo;            
    
    private String evidenciaNombre; 
}