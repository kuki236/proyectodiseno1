package com.rrhh.incentivos.pattern;

import com.rrhh.incentivos.domain.model.Evidencia;
import com.rrhh.incentivos.domain.model.EvidenciaAtencion;
import com.rrhh.incentivos.domain.model.Meta;
import com.rrhh.incentivos.domain.model.MetaAtencion;
import com.rrhh.incentivos.domain.model.ReglaAtencion;
import com.rrhh.incentivos.domain.model.ReglaIncentivo;
import org.springframework.stereotype.Component;

@Component("ATENCION")
public class FabricaAtencion implements FabricaIncentivos {

    @Override
    public ReglaIncentivo crearRegla() {
        ReglaAtencion regla = new ReglaAtencion();
        return regla;
    }

    @Override
    public Meta crearMeta() {
        MetaAtencion meta = new MetaAtencion();
        meta.setNombreMeta("Calidad de Atención");
        meta.setIdDepartamento("Servicio al Cliente");
        return meta;
    }

    @Override
    public Evidencia crearEvidencia() {
        return new EvidenciaAtencion();
    }
}