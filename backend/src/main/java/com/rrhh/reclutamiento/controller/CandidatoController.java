package com.rrhh.reclutamiento.controller;

import com.rrhh.shared.domain.model.CV;
import com.rrhh.shared.domain.model.Postulante;
import com.rrhh.reclutamiento.repository.PostulanteRepository;
import com.rrhh.shared.domain.enums.EstadoPostulante;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.InvalidMediaTypeException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/candidatos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CandidatoController {
    
    private final PostulanteRepository postulanteRepository;
    
    @GetMapping
    public ResponseEntity<List<Postulante>> obtenerCandidatos(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String puesto,
            @RequestParam(required = false) String search) {
        
        List<Postulante> candidatos;

        if (search != null && !search.isEmpty()) {
            candidatos = postulanteRepository.buscarPorTexto(search, EstadoPostulante.DESCARTADO);
        } else {
            candidatos = postulanteRepository.findByEstadoPostulacionNot(EstadoPostulante.DESCARTADO);
        }

        return ResponseEntity.ok(candidatos);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Postulante> obtenerCandidatoPorId(@PathVariable Integer id) {
        // Carga el postulante con su CV y datos extraídos mediante JOIN FETCH
        return postulanteRepository.findByIdWithCV(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> crearCandidato(@RequestBody Postulante postulante) {
        try {
            Optional<Postulante> existenteOpt = postulanteRepository.findByEmail(postulante.getEmail());

            if (existenteOpt.isPresent()) {
                Postulante existente = existenteOpt.get();
                existente.setNombres(postulante.getNombres());
                existente.setApellidoPaterno(postulante.getApellidoPaterno());
                existente.setApellidoMaterno(postulante.getApellidoMaterno());
                existente.setTelefono(postulante.getTelefono());
                existente.setDireccion(postulante.getDireccion());
                existente.setFechaNacimiento(postulante.getFechaNacimiento());
                existente.setGenero(postulante.getGenero());
                existente.setEstadoCivil(postulante.getEstadoCivil());

                Postulante actualizado = postulanteRepository.save(existente);
                return ResponseEntity.ok(actualizado);
            }

            Postulante nuevoPostulante = postulanteRepository.save(postulante);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPostulante);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "No se pudo registrar el postulante: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Postulante> actualizarCandidato(
            @PathVariable Integer id,
            @RequestBody Postulante postulante) {
        return postulanteRepository.findById(id)
            .map(existing -> {
                postulante.setIdPostulante(id);
                return ResponseEntity.ok(postulanteRepository.save(postulante));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}/habilidades")
    public ResponseEntity<?> obtenerHabilidades(@PathVariable Integer id) {
        return postulanteRepository.findByIdWithHabilidades(id)
            .map(postulante -> ResponseEntity.ok(postulante.getHabilidades()))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}/cv")
    public ResponseEntity<?> obtenerCV(@PathVariable Integer id) {
        return postulanteRepository.findById(id)
            .map(postulante -> ResponseEntity.ok(postulante.getCv()))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/cv/archivo")
    public ResponseEntity<Resource> obtenerArchivoCV(@PathVariable Integer id) {
        return postulanteRepository.findByIdWithCV(id)
            .map(postulante -> {
                CV cv = postulante.getCv();
                return resolverRecursoCV(cv)
                    .map(resuelto -> {
                        String nombreDescarga = resuelto.nombreArchivo() != null
                            ? resuelto.nombreArchivo()
                            : cv.getNombreArchivo();
                        MediaType contentType = determinarContentType(cv, resuelto.rutaArchivo(), nombreDescarga);
                        return ResponseEntity.ok()
                            .contentType(contentType)
                            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + nombreDescarga + "\"")
                            .body((Resource) resuelto.recurso());
                    })
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).<Resource>build());
            })
            .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).<Resource>build());
    }

    private MediaType determinarContentType(CV cv, Path rutaArchivo, String nombreFallback) {
        if (rutaArchivo != null) {
            try {
                String tipoDetectado = Files.probeContentType(rutaArchivo);
                if (tipoDetectado != null) {
                    return MediaType.parseMediaType(tipoDetectado);
                }
            } catch (IOException | InvalidMediaTypeException ignored) {
            }
        }

        if (cv.getTipoArchivo() != null) {
            try {
                return MediaType.parseMediaType(cv.getTipoArchivo());
            } catch (InvalidMediaTypeException ignored) {
            }
        }

        String nombreArchivo = cv.getNombreArchivo() != null
            ? cv.getNombreArchivo()
            : nombreFallback;
        if (nombreArchivo != null && nombreArchivo.contains(".")) {
            String extension = nombreArchivo.substring(nombreArchivo.lastIndexOf('.') + 1).toLowerCase();
            return switch (extension) {
                case "pdf" -> MediaType.APPLICATION_PDF;
                case "doc" -> MediaType.parseMediaType("application/msword");
                case "docx" -> MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
                default -> MediaType.APPLICATION_OCTET_STREAM;
            };
        }

        return MediaType.APPLICATION_OCTET_STREAM;
    }

    private record RecursoCV(ByteArrayResource recurso, String nombreArchivo, Path rutaArchivo) {}

    private Optional<RecursoCV> resolverRecursoCV(CV cv) {
        if (cv == null) {
            return Optional.empty();
        }

        List<Path> rutasCandidatas = new ArrayList<>();
        if (cv.getRutaArchivo() != null && !cv.getRutaArchivo().isBlank()) {
            rutasCandidatas.add(Paths.get(cv.getRutaArchivo()));
            String normalizada = cv.getRutaArchivo().replace("\\", java.io.File.separator);
            if (!normalizada.equals(cv.getRutaArchivo())) {
                rutasCandidatas.add(Paths.get(normalizada));
            }
        }

        for (Path ruta : rutasCandidatas) {
            if (Files.exists(ruta)) {
                try {
                    return Optional.of(new RecursoCV(
                        new ByteArrayResource(Files.readAllBytes(ruta)),
                        cv.getNombreArchivo(),
                        ruta
                    ));
                } catch (IOException ignored) {
                }
            }
        }

        List<String> nombresCandidatos = new ArrayList<>();
        if (cv.getNombreArchivo() != null && !cv.getNombreArchivo().isBlank()) {
            nombresCandidatos.add(cv.getNombreArchivo().trim());
        }
        if (cv.getRutaArchivo() != null && !cv.getRutaArchivo().isBlank()) {
            Path ruta = Paths.get(cv.getRutaArchivo().trim());
            if (ruta.getFileName() != null) {
                String nombreDesdeRuta = ruta.getFileName().toString();
                if (!nombresCandidatos.contains(nombreDesdeRuta)) {
                    nombresCandidatos.add(nombreDesdeRuta);
                }
            }
        }

        Optional<RecursoCV> recursoDesdeRepositorio = buscarEnRecursosLocales(cv, nombresCandidatos);
        if (recursoDesdeRepositorio.isPresent()) {
            return recursoDesdeRepositorio;
        }

        Optional<RecursoCV> recursoDesdeClasspathPorRuta = buscarEnClasspathPorRuta(cv);
        if (recursoDesdeClasspathPorRuta.isPresent()) {
            return recursoDesdeClasspathPorRuta;
        }

        Optional<RecursoCV> encontrado = buscarEnClasspath(nombresCandidatos);
        if (encontrado.isPresent()) {
            return encontrado;
        }

        // Si no hay un CV real disponible (incluidos los PDFs que coloques en
        // src/main/resources/cv), se usa el placeholder genérico.
        ClassPathResource placeholder = new ClassPathResource("cv/cv-placeholder.pdf");
        if (placeholder.exists()) {
            try {
                return Optional.of(new RecursoCV(
                    new ByteArrayResource(placeholder.getContentAsByteArray()),
                    placeholder.getFilename(),
                    null
                ));
            } catch (IOException ignored) {
            }
        }

        return Optional.empty();
    }

    private Optional<RecursoCV> buscarEnClasspathPorRuta(CV cv) {
        if (cv.getRutaArchivo() == null || cv.getRutaArchivo().isBlank()) {
            return Optional.empty();
        }

        String rutaNormalizada = cv.getRutaArchivo()
            .replace("\\", "/")
            .replaceFirst("^/+", "");

        List<String> candidatos = new ArrayList<>();
        candidatos.add(rutaNormalizada);

        if (rutaNormalizada.toLowerCase().startsWith("backend/")) {
            candidatos.add(rutaNormalizada.substring("backend/".length()));
        }

        int idx = rutaNormalizada.toLowerCase().indexOf("src/main/resources/");
        if (idx >= 0 && rutaNormalizada.length() > idx + "src/main/resources/".length()) {
            String relativo = rutaNormalizada.substring(idx + "src/main/resources/".length());
            candidatos.add(relativo);
        }

        for (String candidato : candidatos) {
            ClassPathResource recurso = new ClassPathResource(candidato);
            if (recurso.exists()) {
                try {
                    return Optional.of(new RecursoCV(
                        new ByteArrayResource(recurso.getContentAsByteArray()),
                        recurso.getFilename(),
                        null
                    ));
                } catch (IOException ignored) {
                }
            }
        }

        return Optional.empty();
    }

    private Optional<RecursoCV> buscarEnRecursosLocales(CV cv, List<String> nombresCandidatos) {
        if (nombresCandidatos == null || nombresCandidatos.isEmpty()) {
            return Optional.empty();
        }

        Set<String> nombresNormalizados = new HashSet<>();
        for (String nombre : nombresCandidatos) {
            if (nombre != null && !nombre.isBlank()) {
                nombresNormalizados.add(nombre.trim());
            }
        }

        List<Path> bases = new ArrayList<>();
        bases.add(Paths.get("src", "main", "resources", "cv"));
        bases.add(Paths.get("backend", "src", "main", "resources", "cv"));

        // Intentar reconstruir una ruta basada en la ubicación del repositorio en tiempo de desarrollo
        if (cv.getRutaArchivo() != null && !cv.getRutaArchivo().isBlank()) {
            String rutaNormalizada = cv.getRutaArchivo()
                .replace("\\", "/")
                .replace("..", "");
            int idx = rutaNormalizada.toLowerCase().indexOf("src/main/resources/cv/");
            if (idx >= 0 && rutaNormalizada.length() > idx) {
                String relativo = rutaNormalizada.substring(idx);
                bases.add(Paths.get(relativo).normalize());
            }
        }

        for (Path base : bases) {
            for (String nombre : nombresNormalizados) {
                Path rutaLocal = base.resolve(nombre).normalize();
                if (Files.exists(rutaLocal)) {
                    try {
                        return Optional.of(new RecursoCV(
                            new ByteArrayResource(Files.readAllBytes(rutaLocal)),
                            nombre,
                            rutaLocal
                        ));
                    } catch (IOException ignored) {
                    }
                }
            }
        }

        return Optional.empty();
    }

    private Optional<RecursoCV> buscarEnClasspath(List<String> nombres) {
        Set<String> nombresNormalizados = new HashSet<>();
        for (String nombre : nombres) {
            if (nombre != null && !nombre.isBlank()) {
                nombresNormalizados.add(nombre.trim().toLowerCase());
            }
        }

        if (nombresNormalizados.isEmpty()) {
            return Optional.empty();
        }

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        try {
            for (Resource recurso : resolver.getResources("classpath*:cv/*")) {
                if (recurso.exists() && recurso.isReadable() && recurso.getFilename() != null) {
                    String nombreArchivo = recurso.getFilename();
                    if (nombresNormalizados.contains(nombreArchivo.toLowerCase())) {
                        return Optional.of(new RecursoCV(
                            new ByteArrayResource(recurso.getContentAsByteArray()),
                            nombreArchivo,
                            null
                        ));
                    }
                }
            }
        } catch (IOException ignored) {
        }

        return Optional.empty();
    }
    
    @PostMapping("/buscar")
    public ResponseEntity<List<Postulante>> buscarCandidatos(@RequestBody Map<String, Object> criterios) {
        // Implementar lógica de búsqueda avanzada
        List<Postulante> candidatos = postulanteRepository.findAll();
        return ResponseEntity.ok(candidatos);
    }
}

