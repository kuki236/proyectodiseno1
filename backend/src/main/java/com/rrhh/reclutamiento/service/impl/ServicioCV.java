package com.rrhh.reclutamiento.service.impl;

import com.rrhh.reclutamiento.dto.CVGoogleDriveDTO;
import com.rrhh.reclutamiento.repository.CVRepository;
import com.rrhh.reclutamiento.repository.PostulanteRepository;
import com.rrhh.reclutamiento.service.ICVService;
import com.rrhh.reclutamiento.service.IServicioReclutamiento;
import com.rrhh.shared.exception.BusinessException;
import com.rrhh.shared.domain.model.CV;
import com.rrhh.shared.domain.model.Postulante;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ServicioCV implements ICVService {

    private static final String RUTA_BASE_CV = "backend/src/main/resources/cv/";
    private static final String PREFIJO_NOMBRE = "CV_";
    private static final String EXTENSION_PDF = ".pdf";

    private final PostulanteRepository postulanteRepository;
    private final CVRepository cvRepository;
    private final IServicioReclutamiento servicioReclutamiento;

    @Override
    @Transactional
    public CV registrarDesdeGoogleDrive(CVGoogleDriveDTO dto) {
        if (dto.getIdPostulante() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El identificador del postulante es obligatorio");
        }
        if (dto.getEnlaceGoogleDrive() == null || dto.getEnlaceGoogleDrive().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El enlace de Google Drive es obligatorio");
        }

        Postulante postulante = postulanteRepository.findById(dto.getIdPostulante())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Postulante no encontrado"));

        CV cv = postulante.getCv();
        if (cv == null) {
            cv = new CV();
        }

        cv.setIdPostulante(postulante.getIdPostulante());
        cv.setNombreArchivo(generarNombreArchivo(postulante));
        cv.setRutaArchivo(RUTA_BASE_CV + cv.getNombreArchivo());
        cv.setTipoArchivo("application/pdf");
        cv.setTamanioArchivo(0L);
        cv.setEstado("PENDIENTE");
        cv.setFuente(dto.getFuente() != null ? dto.getFuente() : "PORTAL");
        cv.setObservaciones("CV descargado desde Google Drive: " + dto.getEnlaceGoogleDrive());
        cv.setProcesadoPor(null);
        cv.setFechaProcesamiento(null);

        CV guardado = cvRepository.save(cv);
        postulante.setCv(guardado);

        if (dto.getIdVacante() != null) {
            try {
                servicioReclutamiento.vincularCandidatoVacante(postulante.getIdPostulante(), dto.getIdVacante());
            } catch (BusinessException ex) {
                if (!"CANDIDATO_YA_VINCULADO".equals(ex.getCode())) {
                    throw ex;
                }
            }
        }
        return guardado;
    }

    private String generarNombreArchivo(Postulante postulante) {
        String nombreCompleto = (postulante.getNombres() + " "
            + postulante.getApellidoPaterno()
            + (postulante.getApellidoMaterno() != null ? " " + postulante.getApellidoMaterno() : ""))
            .trim();

        String nombreNormalizado = nombreCompleto
            .replaceAll("\\s+", "_")
            .replaceAll("[^A-Za-z0-9_-]", "");

        return PREFIJO_NOMBRE + nombreNormalizado + EXTENSION_PDF;
    }
}
