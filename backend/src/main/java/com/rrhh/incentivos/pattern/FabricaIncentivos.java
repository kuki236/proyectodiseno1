package com.rrhh.incentivos.pattern;

import com.rrhh.incentivos.domain.model.Evidencia;
import com.rrhh.incentivos.domain.model.Meta;
import com.rrhh.incentivos.domain.model.ReglaIncentivo;


public interface FabricaIncentivos {
    
    ReglaIncentivo crearRegla();
    
    Meta crearMeta();
    
    Evidencia crearEvidencia();
}