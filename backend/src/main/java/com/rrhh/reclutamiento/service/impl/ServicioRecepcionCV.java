package com.rrhh.reclutamiento.service.impl;

import com.rrhh.reclutamiento.adapter.CargaCV;
import com.rrhh.reclutamiento.adapter.model.CVAdapter;
import com.rrhh.reclutamiento.dto.PostulanteRevisionDTO;
import com.rrhh.reclutamiento.dto.ResumenProcesamientoCV;
import com.rrhh.reclutamiento.repository.*;
import com.rrhh.reclutamiento.service.IRecepcionCVService;
import com.rrhh.shared.domain.enums.EtapaProceso;
import com.rrhh.shared.domain.enums.EstadoPostulante;
import com.rrhh.shared.domain.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServicioRecepcionCV implements IRecepcionCVService {

    private final PuestoRepository puestoRepository;
    private final PostulanteProcesoRepository postulanteProcesoRepository;
    private final PostulanteRepository postulanteRepository;
    private final FormacionAcademicaRepository formacionAcademicaRepository;
    private final ExperienciaRepository experienciaRepository;
    private final HabilidadRepository habilidadRepository;
    private final PostulanteHabilidadRepository postulanteHabilidadRepository;
    private final CargaCV cargaCv;

    @Override
    @Transactional(readOnly = true)
    public List<Puesto> obtenerPuestosActivos() {
        return puestoRepository.findActivosOrdenados();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostulanteRevisionDTO> obtenerPostulantesRevisionPorPuesto(Integer idPuesto) {
        List<PostulanteProceso> postulantesProceso = postulanteProcesoRepository
                .findByPuestoYEtapa(idPuesto, EtapaProceso.REVISION_CV, EstadoPostulante.DESCARTADO);

        return postulantesProceso.stream()
                .map(pp -> mapearAPostulanteRevision(pp.getPostulante()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Postulante> obtenerPostulanteConCV(Integer idPostulante) {
        return postulanteRepository.findByIdWithCV(idPostulante)
                .or(() -> postulanteRepository.findById(idPostulante));
    }

    @Override
    @Transactional
    public List<ResumenProcesamientoCV> procesarCVsPorPuesto(Integer idPuesto) {
        log.info("Iniciando procesamiento de CVs para el puesto {}", idPuesto);
        List<PostulanteProceso> postulantesProceso = postulanteProcesoRepository
                .findByPuestoYEtapa(idPuesto, EtapaProceso.REVISION_CV, EstadoPostulante.DESCARTADO);

        List<ResumenProcesamientoCV> resumenes = new ArrayList<>();

        for (PostulanteProceso postulanteProceso : postulantesProceso) {
            Integer idPostulante = postulanteProceso.getPostulante().getIdPostulante();
            log.debug("Evaluando postulante {} en etapa REVISION_CV", idPostulante);

            if (tieneInformacionRegistrada(idPostulante)) {
                log.info("Omitiendo postulante {}: ya tiene registros en formación, experiencia o habilidades", idPostulante);
                resumenes.add(ResumenProcesamientoCV.builder()
                        .idPostulante(idPostulante)
                        .formacionesAgregadas(0)
                        .experienciasAgregadas(0)
                        .habilidadesAgregadas(0)
                        .mensaje("Postulante ya procesado previamente; se omite")
                        .build());
                continue;
            }

            Optional<Postulante> postulanteOpt = postulanteRepository.findByIdWithDetalles(idPostulante)
                    .or(() -> postulanteRepository.findById(idPostulante));

            if (postulanteOpt.isEmpty() || postulanteOpt.get().getCv() == null) {
                log.warn("Postulante {} sin CV asociado; no se procesa", idPostulante);
                resumenes.add(ResumenProcesamientoCV.builder()
                        .idPostulante(idPostulante)
                        .formacionesAgregadas(0)
                        .experienciasAgregadas(0)
                        .habilidadesAgregadas(0)
                        .mensaje("Postulante sin CV asociado")
                        .build());
                continue;
            }

            Postulante postulante = postulanteOpt.get();
            com.rrhh.shared.domain.model.CV cv = postulante.getCv();

            log.info("Extrayendo información del CV {} para postulante {}", cv.getIdCV(), postulante.getIdPostulante());
            CVAdapter datos = cargaCv.extraerDatos(cv);
            int nuevasFormaciones = registrarFormaciones(postulante, datos.formaciones());
            int nuevasExperiencias = registrarExperiencias(postulante, datos.experiencias());
            int nuevasHabilidades = registrarHabilidades(postulante, datos.habilidades());

            log.info("Postulante {} procesado: formaciones {}, experiencias {}, habilidades {}", postulante.getIdPostulante(), nuevasFormaciones, nuevasExperiencias, nuevasHabilidades);

            resumenes.add(ResumenProcesamientoCV.builder()
                    .idPostulante(postulante.getIdPostulante())
                    .idCV(cv.getIdCV())
                    .formacionesAgregadas(nuevasFormaciones)
                    .experienciasAgregadas(nuevasExperiencias)
                    .habilidadesAgregadas(nuevasHabilidades)
                    .mensaje("Procesamiento completado")
                    .build());
        }

        return resumenes;
    }

    private boolean tieneInformacionRegistrada(Integer idPostulante) {
        boolean tieneFormacion = formacionAcademicaRepository.existsByIdPostulante(idPostulante);
        boolean tieneExperiencia = experienciaRepository.existsByIdPostulante(idPostulante);
        boolean tieneHabilidades = postulanteHabilidadRepository.existsByIdPostulante(idPostulante);

        log.debug("Postulante {} - formacion: {}, experiencia: {}, habilidades: {}", idPostulante, tieneFormacion, tieneExperiencia, tieneHabilidades);

        return tieneFormacion || tieneExperiencia || tieneHabilidades;
    }

    private int registrarFormaciones(Postulante postulante, List<CVAdapter.ParsedEducation> formaciones) {
        int nuevas = 0;
        for (CVAdapter.ParsedEducation formacion : formaciones) {
            String institucion = formacion.institucion() != null ? formacion.institucion() : "Institución no identificada";
            String carrera = formacion.carrera();
            String nivel = formacion.nivelEstudios() != null ? formacion.nivelEstudios() : "No especificado";
            String situacion = formacion.situacion() != null ? formacion.situacion() : "EN_CURSO";
            LocalDate inicio = formacion.fechaInicio() != null ? formacion.fechaInicio() : LocalDate.now();

            boolean existe = formacionAcademicaRepository.existsByIdPostulanteAndInstitucionAndCarreraAndNivelEstudiosAndSituacion(
                    postulante.getIdPostulante(), institucion, carrera, nivel, situacion
            );

            if (existe) {
                continue;
            }

            FormacionAcademica nuevaFormacion = new FormacionAcademica();
            nuevaFormacion.setIdPostulante(postulante.getIdPostulante());
            nuevaFormacion.setInstitucion(institucion);
            nuevaFormacion.setCarrera(carrera);
            nuevaFormacion.setNivelEstudios(nivel);
            nuevaFormacion.setSituacion(situacion);
            nuevaFormacion.setFechaInicio(inicio);
            nuevaFormacion.setFechaFin(formacion.fechaFin());
            nuevaFormacion.setCursosRelevantes(formacion.cursos());
            nuevaFormacion.setObservaciones(formacion.observaciones());
            nuevaFormacion.setFechaCreacion(LocalDateTime.now());

            formacionAcademicaRepository.save(nuevaFormacion);
            nuevas++;
        }
        return nuevas;
    }

    private int registrarExperiencias(Postulante postulante, List<CVAdapter.ParsedExperience> experiencias) {
        int nuevas = 0;
        for (CVAdapter.ParsedExperience experiencia : experiencias) {
            String empresa = experiencia.empresa() != null ? experiencia.empresa() : "Empresa no indicada";
            String cargo = experiencia.cargo() != null ? experiencia.cargo() : "Cargo no indicado";
            LocalDate inicio = experiencia.fechaInicio() != null ? experiencia.fechaInicio() : LocalDate.now();

            boolean existe = experienciaRepository.existsByIdPostulanteAndEmpresaAndCargoAndFechaInicio(
                    postulante.getIdPostulante(), empresa, cargo, inicio
            );

            if (existe) {
                continue;
            }

            Experiencia nuevaExperiencia = new Experiencia();
            nuevaExperiencia.setIdPostulante(postulante.getIdPostulante());
            nuevaExperiencia.setEmpresa(empresa);
            nuevaExperiencia.setCargo(cargo);
            nuevaExperiencia.setFuncionesPrincipales(experiencia.funciones());
            nuevaExperiencia.setFechaInicio(inicio);
            nuevaExperiencia.setFechaFin(experiencia.fechaFin());
            nuevaExperiencia.setReferenciaContacto(experiencia.referencia());
            nuevaExperiencia.setTelefonoReferencia(experiencia.telefonoReferencia());
            nuevaExperiencia.setFechaCreacion(LocalDateTime.now());

            experienciaRepository.save(nuevaExperiencia);
            nuevas++;
        }
        return nuevas;
    }

    private int registrarHabilidades(Postulante postulante, List<String> habilidades) {
        int nuevas = 0;
        Set<Integer> agregadasEnLote = new HashSet<>();
        for (String habilidadLibre : habilidades) {
            if (habilidadLibre == null || habilidadLibre.isBlank()) {
                continue;
            }

            String nivelDetectado = detectarNivelHabilidad(habilidadLibre);
            String habilidadLimpia = limpiarHabilidad(habilidadLibre);

            for (String nombreNormalizado : normalizarHabilidades(habilidadLimpia)) {
                Optional<Habilidad> habilidad = habilidadRepository.findByNombreIgnoreCase(nombreNormalizado);
                if (habilidad.isEmpty()) {
                    continue;
                }

                int idHabilidad = habilidad.get().getIdHabilidad();
                if (agregadasEnLote.contains(idHabilidad)) {
                    continue;
                }

                boolean existe = postulanteHabilidadRepository.existsByIdPostulanteAndIdHabilidad(
                        postulante.getIdPostulante(), idHabilidad
                );

                if (existe) {
                    continue;
                }

                PostulanteHabilidad postulanteHabilidad = new PostulanteHabilidad();
                postulanteHabilidad.setIdPostulante(postulante.getIdPostulante());
                postulanteHabilidad.setIdHabilidad(idHabilidad);
                postulanteHabilidad.setNivelDominio(nivelDetectado);
                postulanteHabilidad.setFechaRegistro(LocalDate.now());

                postulanteHabilidadRepository.save(postulanteHabilidad);
                agregadasEnLote.add(idHabilidad);
                nuevas++;
            }
        }
        return nuevas;
    }

    private String limpiarHabilidad(String habilidadLibre) {
        String texto = habilidadLibre.replaceAll("\\((?i)[^)]*(basico|básico|intermedio|avanzado|experto|junior|jr|senior|sr)[^)]*\\)", "");
        texto = texto.replaceAll("(?i)\\b(nivel\\s+)?(basico|básico|intermedio|avanzado|experto|junior|jr|senior|sr)\\b", "");
        texto = texto.replaceAll("[-–—]\s*$", "");
        return texto.replaceAll("\\s{2,}", " ").trim();
    }

    private String detectarNivelHabilidad(String habilidadLibre) {
        if (habilidadLibre == null) {
            return null;
        }
        String sinAcentos = Normalizer.normalize(habilidadLibre, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        String lower = sinAcentos.toLowerCase();

        if (lower.contains("basico")) {
            return "BASICO";
        }
        if (lower.contains("intermedio")) {
            return "INTERMEDIO";
        }
        if (lower.contains("avanzado")) {
            return "AVANZADO";
        }
        if (lower.contains("experto")) {
            return "EXPERTO";
        }
        if (Pattern.compile("\\b(junior|jr)\\b", Pattern.CASE_INSENSITIVE).matcher(lower).find()) {
            return "JUNIOR";
        }
        if (Pattern.compile("\\b(senior|sr)\\b", Pattern.CASE_INSENSITIVE).matcher(lower).find()) {
            return "SENIOR";
        }
        return null;
    }

    private Set<String> normalizarHabilidades(String habilidadLibre) {
        String base = habilidadLibre.trim();
        if (base.isBlank()) {
            return Set.of();
        }
        String lower = base.toLowerCase();

        Set<String> posibles = new LinkedHashSet<>();
        posibles.add(base);

        if (lower.contains("crm")) {
            posibles.add("Manejo de CRM");
        }
        if (lower.contains("excel")) {
            posibles.add("Excel Avanzado");
        }
        if (lower.contains("microsoft office") || (lower.contains("excel") && lower.contains("word"))) {
            posibles.add("Microsoft Office");
        }
        if (lower.contains("venta")) {
            posibles.add("Ventas");
        }
        if (lower.contains("cliente")) {
            posibles.add("Atención al Cliente");
        }
        if (lower.contains("comunic")) {
            posibles.add("Comunicación");
        }
        if (lower.contains("herramienta") && lower.contains("gest")) {
            posibles.add("Manejo de Herramientas de Gestión");
        }
        if (lower.contains("reporte")) {
            posibles.add("Gestión Documentaria");
        }
        if (lower.contains("equipo")) {
            posibles.add("Trabajo en equipo");
        }
        if (lower.contains("proactiv")) {
            posibles.add("Proactividad");
        }
        if (lower.contains("resoluci") && lower.contains("proble")) {
            posibles.add("Resolución de problemas");
        }
        if (lower.contains("organiz")) {
            posibles.add("Organización");
        }
        if (lower.contains("responsab")) {
            posibles.add("Responsabilidad");
        }

        return posibles;
    }

    private PostulanteRevisionDTO mapearAPostulanteRevision(Postulante postulante) {
        Integer edad = null;
        if (postulante.getFechaNacimiento() != null) {
            edad = java.time.Period.between(postulante.getFechaNacimiento(), java.time.LocalDate.now()).getYears();
        }

        return PostulanteRevisionDTO.builder()
                .idPostulante(postulante.getIdPostulante())
                .nombres(postulante.getNombres())
                .apellidoPaterno(postulante.getApellidoPaterno())
                .apellidoMaterno(postulante.getApellidoMaterno())
                .telefono(postulante.getTelefono())
                .email(postulante.getEmail())
                .edad(edad)
                .genero(postulante.getGenero())
                .estadoCivil(postulante.getEstadoCivil())
                .fechaNacimiento(postulante.getFechaNacimiento() != null
                        ? postulante.getFechaNacimiento().toString()
                        : null)
                .direccion(postulante.getDireccion())
                .build();
    }
}
