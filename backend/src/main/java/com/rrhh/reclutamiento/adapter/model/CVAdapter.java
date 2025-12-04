package com.rrhh.reclutamiento.adapter.model;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

public record CVAdapter(List<ParsedEducation> formaciones,
                        List<ParsedExperience> experiencias,
                        List<String> habilidades) {

    public CVAdapter {
        formaciones = formaciones != null ? formaciones : Collections.emptyList();
        experiencias = experiencias != null ? experiencias : Collections.emptyList();
        habilidades = habilidades != null ? habilidades : Collections.emptyList();
    }

    public static CVAdapter vacio() {
        return new CVAdapter(Collections.emptyList(), Collections.emptyList(), Collections.emptyList());
    }

    public record ParsedEducation(String nivelEstudios,
                                  String situacion,
                                  String carrera,
                                  String institucion,
                                  LocalDate fechaInicio,
                                  LocalDate fechaFin,
                                  String cursos,
                                  String observaciones) {
    }

    public record ParsedExperience(String empresa,
                                   String cargo,
                                   String funciones,
                                   LocalDate fechaInicio,
                                   LocalDate fechaFin,
                                   String referencia,
                                   String telefonoReferencia) {
    }
}
