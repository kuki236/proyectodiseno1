package com.rrhh.incentivos.domain.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@DiscriminatorValue("ATENCION")
public class EvidenciaAtencion extends Evidencia {

    @Column(name = "atencion_id_ticket")
    private String idTicket;

    @Column(name = "atencion_id_asignacion")
    private String idAsignacion;

    @Column(name = "atencion_estado_ticket")
    private String estadoTicket;

    @Column(name = "atencion_categoria")
    private String categoriaTicket;

    @Column(name = "atencion_impacto")
    private String nivelImpacto;
    
    @Column(name = "atencion_problematica")
    private String problematica;

    @Override
    public String obtenerResumen() {
        return "Ticket #" + idTicket + " [" + categoriaTicket + "] - Estado: " + estadoTicket;
    }
}