package com.rrhh.reclutamiento.controller;

import com.rrhh.reclutamiento.dto.PostulanteRevisionDTO;
import com.rrhh.reclutamiento.dto.ResumenProcesamientoCV;
import com.rrhh.reclutamiento.service.IRecepcionCVService;
import com.rrhh.shared.domain.model.Postulante;
import com.rrhh.shared.domain.model.Puesto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rrhh")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RecepcionCVController {

    private final IRecepcionCVService recepcionCVService;

    @GetMapping("/puestos")
    public ResponseEntity<List<Puesto>> listarPuestos() {
        List<Puesto> puestos = recepcionCVService.obtenerPuestosActivos();
        return ResponseEntity.ok(puestos);
    }

    @GetMapping("/postulantes-proceso/puesto/{idPuesto}/revision-cv")
    public ResponseEntity<List<PostulanteRevisionDTO>> listarPostulantesRevision(
            @PathVariable Integer idPuesto) {
        List<PostulanteRevisionDTO> postulantes = recepcionCVService
                .obtenerPostulantesRevisionPorPuesto(idPuesto);
        return ResponseEntity.ok(postulantes);
    }

    @PostMapping("/puestos/{idPuesto}/procesar-cv")
    public ResponseEntity<List<ResumenProcesamientoCV>> procesarCVs(@PathVariable Integer idPuesto) {
        List<ResumenProcesamientoCV> resumenes = recepcionCVService.procesarCVsPorPuesto(idPuesto);
        return ResponseEntity.ok(resumenes);
    }

    @GetMapping("/postulantes/{id}")
    public ResponseEntity<Postulante> obtenerPostulante(@PathVariable Integer id) {
        return recepcionCVService.obtenerPostulanteConCV(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
