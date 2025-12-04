package com.rrhh.reclutamiento.adapter;

import com.fasterxml.jackson.databind.JsonNode;
import com.rrhh.reclutamiento.adapter.external.ApachePDFBoxAdaptee;
import com.rrhh.reclutamiento.adapter.model.CVAdapter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CargaApachePDFBoxAdapter implements CargaCV {

    private final ApachePDFBoxAdaptee externalTool;

    @Override
    public CVAdapter extraerDatos(com.rrhh.shared.domain.model.CV cv) {
        if (cv == null || cv.getRutaArchivo() == null || cv.getRutaArchivo().isBlank()) {
            log.warn("CV sin ruta de archivo; se devuelve respuesta vacía");
            return CVAdapter.vacio();
        }

        ApachePDFBoxAdaptee.ExternalProfile perfil;
        try {
            perfil = externalTool.leerPerfilDesdeArchivo(Paths.get(cv.getRutaArchivo()));
        } catch (Exception e) {
            log.error("Error leyendo CV {}: {}", cv.getRutaArchivo(), e.getMessage(), e);
            return CVAdapter.vacio();
        }

        log.debug("Perfil extraído: formaciones {}, experiencias {}, habilidades {}", perfil.formacion().size(), perfil.experiencias().size(), perfil.habilidades().size());

        List<CVAdapter.ParsedEducation> formaciones = new ArrayList<>();
        for (JsonNode node : perfil.formacion()) {
            formaciones.add(new CVAdapter.ParsedEducation(
                    node.path("nivel").asText("No especificado"),
                    node.path("situacion").asText("EN_CURSO"),
                    node.path("carrera").asText(null),
                    node.path("institucion").asText("Institución no identificada"),
                    parseFecha(node.path("inicio").asText(null)),
                    parseFecha(node.path("fin").asText(null)),
                    node.path("cursos").asText(null),
                    node.path("observaciones").asText(null)
            ));
        }

        List<CVAdapter.ParsedExperience> experiencias = new ArrayList<>();
        for (JsonNode node : perfil.experiencias()) {
            experiencias.add(new CVAdapter.ParsedExperience(
                    node.path("empresa").asText("Empresa no indicada"),
                    node.path("cargo").asText("Cargo no indicado"),
                    node.path("funciones").asText(null),
                    parseFecha(node.path("inicio").asText(null)),
                    parseFecha(node.path("fin").asText(null)),
                    node.path("referencia").asText(null),
                    node.path("telefonoReferencia").asText(null)
            ));
        }

        log.info("Datos parseados desde CV {}: formaciones {}, experiencias {}, habilidades {}", cv.getRutaArchivo(), formaciones.size(), experiencias.size(), perfil.habilidades().size());

        return new CVAdapter(formaciones, experiencias, perfil.habilidades());
    }

    private LocalDate parseFecha(String fecha) {
        if (fecha == null || fecha.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(fecha);
        } catch (DateTimeParseException e) {
            return null;
        }
    }
}
