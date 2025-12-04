package com.rrhh.reclutamiento.adapter.external;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.StreamSupport;

@Component
@RequiredArgsConstructor
@Slf4j
public class ApachePDFBoxAdaptee {

    private final ObjectMapper objectMapper;

    public ExternalProfile leerPerfilDesdeArchivo(Path ruta) {
        if (ruta == null) {
            log.warn("Ruta nula recibida para lectura de CV");
            return ExternalProfile.vacio();
        }

        List<Path> candidatos = construirCandidatos(ruta);
        String nombre = obtenerNombreArchivo(ruta);

        for (Path candidato : candidatos) {
            log.info("Leyendo CV desde {}", candidato);
            if (!Files.exists(candidato)) {
                log.debug("Ruta candidata no existe: {}", candidato);
                continue;
            }
            try {
                return leerSegunExtension(nombre, Files.newInputStream(candidato));
            } catch (IOException e) {
                log.error("No se pudo leer archivo {}: {}", candidato, e.getMessage(), e);
                return ExternalProfile.vacio();
            }
        }

        String classpathRuta = extraerRutaClasspath(ruta.toString());
        if (classpathRuta != null) {
            ClassPathResource resource = new ClassPathResource(classpathRuta);
            if (resource.exists()) {
                log.info("Leyendo CV desde classpath: {}", classpathRuta);
                try {
                    return leerSegunExtension(nombre, resource.getInputStream());
                } catch (IOException e) {
                    log.error("No se pudo leer recurso en classpath {}: {}", classpathRuta, e.getMessage(), e);
                }
            } else {
                log.debug("Recurso en classpath no encontrado: {}", classpathRuta);
            }
        }

        log.warn("Archivo {} no encontrado en rutas candidatas ni en classpath", ruta);
        return ExternalProfile.vacio();
    }

    private String obtenerNombreArchivo(Path ruta) {
        String normalizado = ruta.toString().replace("\\", "/");
        int idx = normalizado.lastIndexOf('/');
        String nombre = idx != -1 ? normalizado.substring(idx + 1) : normalizado;
        return nombre.toLowerCase();
    }

    private List<Path> construirCandidatos(Path ruta) {
        String normalizado = ruta.toString().replace("\\", "/");
        List<Path> candidatos = new ArrayList<>();

        Path directo = toAbsolute(normalizado);
        candidatos.add(directo);

        int idxBackend = normalizado.indexOf("backend/");
        if (idxBackend != -1) {
            String sinBackend = normalizado.substring(idxBackend + "backend/".length());
            candidatos.add(toAbsolute(sinBackend));
        }

        int idxResources = normalizado.indexOf("src/main/resources/");
        if (idxResources != -1) {
            String desdeResources = normalizado.substring(idxResources);
            candidatos.add(toAbsolute(desdeResources));
        }

        return candidatos;
    }

    private Path toAbsolute(String ruta) {
        Path path = Path.of(ruta).normalize();
        if (path.isAbsolute()) {
            return path;
        }
        return Path.of("").toAbsolutePath().resolve(path).normalize();
    }

    private String extraerRutaClasspath(String rutaOriginal) {
        String normalizado = rutaOriginal.replace("\\", "/");

        int idxResources = normalizado.indexOf("src/main/resources/");
        if (idxResources != -1) {
            return normalizado.substring(idxResources + "src/main/resources/".length());
        }

        int idxCv = normalizado.indexOf("cv/");
        if (idxCv != -1) {
            return normalizado.substring(idxCv);
        }

        return null;
    }

    private ExternalProfile leerSegunExtension(String nombreArchivo, java.io.InputStream inputStream) throws IOException {
        if (nombreArchivo.endsWith(".json")) {
            return leerDesdeJson(inputStream);
        }
        if (nombreArchivo.endsWith(".pdf")) {
            return leerDesdePdf(inputStream, nombreArchivo);
        }
        log.warn("Extensión de archivo no soportada para {}", nombreArchivo);
        return ExternalProfile.vacio();
    }

    private ExternalProfile leerDesdeJson(java.io.InputStream inputStream) throws IOException {
        JsonNode root = objectMapper.readTree(inputStream);
        return new ExternalProfile(
                toList(root.path("formacion")),
                toList(root.path("experiencias")),
                extraerHabilidades(root.path("habilidades"))
        );
    }

    private ExternalProfile leerDesdePdf(java.io.InputStream inputStream, String nombreArchivo) throws IOException {
        String texto = extraerTextoPlano(inputStream);
        if (texto.isBlank()) {
            log.warn("No se pudo extraer texto del PDF {} (contenido vacío)", nombreArchivo);
            return ExternalProfile.vacio();
        }

        List<JsonNode> formaciones = parsearFormaciones(texto);
        List<JsonNode> experiencias = parsearExperiencias(texto);
        List<String> habilidades = parsearHabilidades(texto);

        log.info("PDF {} parseado: formaciones {}, experiencias {}, habilidades {}", nombreArchivo, formaciones.size(), experiencias.size(), habilidades.size());

        return new ExternalProfile(formaciones, experiencias, habilidades);
    }

    private List<JsonNode> toList(JsonNode node) {
        if (node != null && node.isArray()) {
            return StreamSupport.stream(node.spliterator(), false).toList();
        }
        return Collections.emptyList();
    }

    private List<String> extraerHabilidades(JsonNode habilidadesNode) {
        if (habilidadesNode != null && habilidadesNode.isArray()) {
            return StreamSupport.stream(habilidadesNode.spliterator(), false)
                    .map(JsonNode::asText)
                    .filter(s -> s != null && !s.isBlank())
                    .toList();
        }
        return Collections.emptyList();
    }

    private String extraerTextoPlano(java.io.InputStream inputStream) throws IOException {
        try (PDDocument document = PDDocument.load(inputStream)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String texto = stripper.getText(document);
            String normalizado = Normalizer.normalize(texto, Normalizer.Form.NFC);
            log.debug("Texto extraído del PDF ({} caracteres)", normalizado.length());
            return normalizado;
        }
    }

    private List<JsonNode> parsearExperiencias(String texto) {
        List<JsonNode> experiencias = new ArrayList<>();
        String seccion = extraerSeccion(texto, "Experiencia Laboral", "Habilidades");

        if (!seccion.isBlank()) {
            log.debug("Sección de experiencia localizada, iniciando parseo específico");
            experiencias.addAll(parsearExperienciasDesdeLineas(seccion.split("\\R")));
        }

        if (experiencias.isEmpty()) {
            log.debug("No se detectó sección específica; se parseará todo el documento línea por línea");
            experiencias.addAll(parsearExperienciasDesdeLineas(texto.split("\\R")));
        }

        log.debug("Experiencias encontradas: {}", experiencias.size());
        return experiencias;
    }

    private List<JsonNode> parsearExperienciasDesdeLineas(String[] lineas) {
        List<JsonNode> experiencias = new ArrayList<>();
        String cargoActual = null;
        String empresaActual = null;
        LocalDate inicio = null;
        LocalDate fin = null;
        List<String> funciones = new ArrayList<>();

        Pattern cabecera = Pattern.compile("^(?<cargo>.+?)\\s+[–-]\\s+(?<empresa>.+)$");
        Pattern rangoAnios = Pattern.compile("(?<inicio>\\d{4})\\s*[–-]\\s*(?<fin>\\d{4}|Presente|Actual)", Pattern.CASE_INSENSITIVE);

        for (int i = 0; i < lineas.length; i++) {
            String linea = lineas[i].trim();
            if (linea.isBlank()) {
                continue;
            }

            Matcher cabeceraMatcher = cabecera.matcher(linea);
            if (cabeceraMatcher.matches()) {
                if (cargoActual != null) {
                    experiencias.add(crearExperiencia(cargoActual, empresaActual, inicio, fin, funciones));
                    funciones = new ArrayList<>();
                }
                cargoActual = cabeceraMatcher.group("cargo").trim();
                empresaActual = cabeceraMatcher.group("empresa").trim();

                Matcher rangoEnMismaLinea = rangoAnios.matcher(empresaActual);
                if (rangoEnMismaLinea.find()) {
                    empresaActual = empresaActual.replace(rangoEnMismaLinea.group(), "").trim();
                    inicio = parsearAnio(rangoEnMismaLinea.group("inicio"));
                    fin = parsearAnio(rangoEnMismaLinea.group("fin"));
                    continue;
                }

                if (i + 1 < lineas.length) {
                    Matcher rangoMatcher = rangoAnios.matcher(lineas[i + 1]);
                    if (rangoMatcher.find()) {
                        inicio = parsearAnio(rangoMatcher.group("inicio"));
                        fin = parsearAnio(rangoMatcher.group("fin"));
                        i++;
                        continue;
                    }
                }
                inicio = null;
                fin = null;
                continue;
            }

            if (linea.startsWith("-")) {
                funciones.add(linea.substring(1).trim());
            }
        }

        if (cargoActual != null) {
            experiencias.add(crearExperiencia(cargoActual, empresaActual, inicio, fin, funciones));
        }
        return experiencias;
    }

    private LocalDate parsearAnio(String valor) {
        try {
            int year = Integer.parseInt(valor);
            return LocalDate.of(year, 1, 1);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private JsonNode crearExperiencia(String cargo, String empresa, LocalDate inicio, LocalDate fin, List<String> funciones) {
        var node = objectMapper.createObjectNode();
        node.put("empresa", empresa != null ? empresa : "Empresa no indicada");
        node.put("cargo", cargo != null ? cargo : "Cargo no indicado");
        node.put("funciones", String.join("; ", funciones));
        node.put("inicio", inicio != null ? inicio.toString() : null);
        node.put("fin", fin != null ? fin.toString() : null);
        return node;
    }

    private List<String> parsearHabilidades(String texto) {
        List<String> habilidades = new ArrayList<>();
        habilidades.addAll(extraerHabilidadesDesdeSeccion(texto, "Habilidades Técnicas"));
        habilidades.addAll(extraerHabilidadesDesdeSeccion(texto, "Habilidades Blandas"));

        if (habilidades.isEmpty()) {
            habilidades.addAll(extraerHabilidadesDesdeSeccion(texto, "Habilidades"));
        }

        return habilidades;
    }

    private List<JsonNode> parsearFormaciones(String texto) {
        List<JsonNode> formaciones = new ArrayList<>();

        String seccion = extraerSeccion(texto, "Formación Profesional", "Perfil", "Experiencia", "Habilidades");
        if (seccion.isBlank()) {
            seccion = extraerSeccion(texto, "Formación Académica", "Perfil", "Experiencia", "Habilidades");
        }
        if (seccion.isBlank()) {
            seccion = extraerSeccion(texto, "Educación", "Perfil", "Experiencia", "Habilidades");
        }

        if (seccion.isBlank()) {
            log.debug("No se encontraron secciones de formación específicas; se intentará parsear todo el texto");
            seccion = texto;
        }

        String[] lineas = seccion.split("\\R");
        Pattern cabecera = Pattern.compile("^(?<grado>.+?)\\s+[–-]\\s+(?<institucion>.+)$");
        Pattern rangoAnios = Pattern.compile("(?<inicio>\\d{4})\\s*[–-]\\s*(?<fin>\\d{4}|Presente|Actual)", Pattern.CASE_INSENSITIVE);

        String gradoActual = null;
        String institucionActual = null;
        LocalDate inicio = null;
        LocalDate fin = null;
        List<String> detalles = new ArrayList<>();

        for (int i = 0; i < lineas.length; i++) {
            String linea = lineas[i].trim();
            if (linea.isBlank()) {
                continue;
            }

            Matcher cabeceraMatcher = cabecera.matcher(linea);
            if (cabeceraMatcher.matches()) {
                if (gradoActual != null) {
                    formaciones.add(crearFormacion(gradoActual, institucionActual, inicio, fin, detalles));
                    detalles = new ArrayList<>();
                }
                gradoActual = cabeceraMatcher.group("grado").trim();
                institucionActual = cabeceraMatcher.group("institucion").trim();
                inicio = null;
                fin = null;

                if (i + 1 < lineas.length) {
                    Matcher rangoMatcher = rangoAnios.matcher(lineas[i + 1].trim());
                    if (rangoMatcher.find()) {
                        inicio = parsearAnio(rangoMatcher.group("inicio"));
                        fin = parsearAnio(rangoMatcher.group("fin"));
                        i++;
                    }
                }
                continue;
            }

            Matcher rangoEnLinea = rangoAnios.matcher(linea);
            if (rangoEnLinea.find()) {
                inicio = parsearAnio(rangoEnLinea.group("inicio"));
                fin = parsearAnio(rangoEnLinea.group("fin"));
                continue;
            }

            detalles.add(linea);
        }

        if (gradoActual != null) {
            formaciones.add(crearFormacion(gradoActual, institucionActual, inicio, fin, detalles));
        }

        log.debug("Formaciones encontradas: {}", formaciones.size());
        return formaciones;
    }

    private JsonNode crearFormacion(String grado, String institucion, LocalDate inicio, LocalDate fin, List<String> detalles) {
        var node = objectMapper.createObjectNode();
        node.put("nivel", inferirNivel(grado));
        node.put("situacion", fin != null ? "CONCLUIDO" : "EN_CURSO");
        node.put("carrera", grado != null ? grado : "Carrera no indicada");
        node.put("institucion", institucion != null ? institucion : "Institución no identificada");
        node.put("inicio", inicio != null ? inicio.toString() : null);
        node.put("fin", fin != null ? fin.toString() : null);
        node.put("cursos", String.join("; ", detalles));
        node.put("observaciones", (String) null);
        return node;
    }

    private String inferirNivel(String grado) {
        if (grado == null) {
            return "No especificado";
        }
        String lower = grado.toLowerCase();
        if (lower.contains("técnic") || lower.contains("tecnic")) {
            return "TECNICO";
        }
        if (lower.contains("bachiller")) {
            return "BACHILLER";
        }
        if (lower.contains("licenc")) {
            return "LICENCIADO";
        }
        if (lower.contains("maestr") || lower.contains("master")) {
            return "MAESTRIA";
        }
        if (lower.contains("doctor") || lower.contains("phd")) {
            return "DOCTORADO";
        }
        if (lower.contains("ingenier") || lower.contains("universit")) {
            return "UNIVERSITARIO";
        }
        return "No especificado";
    }

    private List<String> extraerHabilidadesDesdeSeccion(String texto, String tituloSeccion) {
        String seccion = extraerSeccion(texto, tituloSeccion, "Habilidades", "Perfil", "Experiencia Laboral");
        if (seccion.isBlank()) {
            log.debug("Sección {} no encontrada en el documento", tituloSeccion);
            return Collections.emptyList();
        }

        List<String> habilidades = new ArrayList<>();
        for (String linea : seccion.split("\\R")) {
            String limpia = linea
                    .replace("•", "-")
                    .replace("–", "-")
                    .replace("—", "-")
                    .replace("·", "-")
                    .trim();

            if (limpia.startsWith("-")) {
                String habilidad = limpia.substring(1).trim();
                if (!habilidad.isBlank()) {
                    habilidades.add(habilidad);
                }
            } else if (!limpia.isBlank() && !limpia.equalsIgnoreCase(tituloSeccion)) {
                habilidades.add(limpia);
            }
        }
        return habilidades;
    }

    private String extraerSeccion(String texto, String inicioClave, String... finPosibles) {
        String normalizado = texto.replace("\r", "");
        String normalizadoLower = normalizado.toLowerCase();
        String inicioClaveLower = inicioClave.toLowerCase();

        int inicio = normalizadoLower.indexOf(inicioClaveLower);
        if (inicio == -1) {
            return "";
        }

        int fin = normalizado.length();
        for (String finClave : finPosibles) {
            String finClaveLower = finClave.toLowerCase();
            int posibleFin = normalizadoLower.indexOf(finClaveLower, inicio + inicioClaveLower.length());
            if (posibleFin != -1) {
                fin = Math.min(fin, posibleFin);
            }
        }

        if (fin <= inicio) {
            return "";
        }
        return normalizado.substring(inicio + inicioClave.length(), fin).trim();
    }

    public record ExternalProfile(List<JsonNode> formacion, List<JsonNode> experiencias, List<String> habilidades) {
        public static ExternalProfile vacio() {
            return new ExternalProfile(Collections.emptyList(), Collections.emptyList(), Collections.emptyList());
        }
    }
}
