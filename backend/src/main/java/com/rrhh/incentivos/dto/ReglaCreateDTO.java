package com.rrhh.incentivos.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ReglaCreateDTO {
    private String nombre;
    private String frecuencia;    
    private String descripcion;
    private String categoria;     

    private String metrica;       
    private String operador;     
    private BigDecimal valorObjetivo; 


    private String tipoRecompensa; 
    
    private BigDecimal monto;     
    private String tipoCalculo;   

    private String descripcionRegalo; 
}