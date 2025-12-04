package com.rrhh.incentivos.pattern;

import com.rrhh.incentivos.domain.model.Evidencia;
import com.rrhh.incentivos.domain.model.EvidenciaVenta;
import com.rrhh.incentivos.domain.model.Meta;
import com.rrhh.incentivos.domain.model.MetaVenta;
import com.rrhh.incentivos.domain.model.ReglaIncentivo;
import com.rrhh.incentivos.domain.model.ReglaVentas;
import org.springframework.stereotype.Component;

@Component("VENTAS")
public class FabricaVentas implements FabricaIncentivos {

    @Override
    public ReglaIncentivo crearRegla() {
        ReglaVentas regla = new ReglaVentas();
        return regla;
    }

    @Override
    public Meta crearMeta() {
        MetaVenta meta = new MetaVenta();
        meta.setNombreMeta("Volumen de Ventas"); 
        meta.setIdDepartamento("Comercial");
        return meta;
    }

    @Override
    public Evidencia crearEvidencia() {
        return new EvidenciaVenta();
    }
}