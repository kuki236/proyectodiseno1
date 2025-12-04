package com.rrhh.reclutamiento.controller;

import com.rrhh.shared.domain.enums.EstadoVacante;
import com.rrhh.shared.domain.enums.EtapaProceso;
import com.rrhh.shared.domain.model.Vacante;
import com.rrhh.reclutamiento.service.IServicioVacante;
import com.rrhh.reclutamiento.service.EstadisticasService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/vacantes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class VacanteController {
    
    private final IServicioVacante servicioVacante;
    private final EstadisticasService estadisticasService;
    
    @GetMapping
    public ResponseEntity<List<Vacante>> obtenerVacantes(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String departamento,
            @RequestParam(required = false) String prioridad,
            @RequestParam(required = false) String etapa) {

        if (estado != null && estado.equals("ABIERTA")) {
            if (etapa != null) {
                try {
                    EtapaProceso etapaEnum = EtapaProceso.valueOf(etapa);
                    return ResponseEntity.ok(
                        servicioVacante.buscarVacantesPorEstadoYEtapa(
                            EstadoVacante.ABIERTA,
                            etapaEnum
                        )
                    );
                } catch (IllegalArgumentException e) {
                    log.warn("Etapa de proceso inválida recibida: {}", etapa);
                }
            }
            return ResponseEntity.ok(servicioVacante.buscarVacantesActivas());
        }
        
        List<Vacante> vacantes = servicioVacante.buscarVacantesActivas();
        return ResponseEntity.ok(vacantes);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Vacante> obtenerVacantePorId(@PathVariable Integer id) {
        try {
            Vacante vacante = servicioVacante.obtenerVacantePorId(id);
            return ResponseEntity.ok(vacante);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<Vacante> crearVacante(@RequestBody Map<String, Object> requestData) {
        log.info("Recibiendo solicitud para crear vacante: {}", requestData);
        
        // Convertir el Map a objeto Vacante
        Vacante vacante = new Vacante();
        
        // Asignar campos del request (el frontend envía camelCase)
        if (requestData.containsKey("nombre")) {
            vacante.setNombre((String) requestData.get("nombre"));
        }
        if (requestData.containsKey("descripcion")) {
            vacante.setDescripcion((String) requestData.get("descripcion"));
        }
        if (requestData.containsKey("requisitos")) {
            vacante.setRequisitos((String) requestData.get("requisitos"));
        }
        if (requestData.containsKey("modalidad")) {
            vacante.setModalidad((String) requestData.get("modalidad"));
        }
        if (requestData.containsKey("rangoSalarial")) {
            vacante.setRangoSalarial((String) requestData.get("rangoSalarial"));
        }
        if (requestData.containsKey("departamento")) {
            vacante.setDepartamento((String) requestData.get("departamento"));
        }
        if (requestData.containsKey("prioridad")) {
            vacante.setPrioridad((String) requestData.get("prioridad"));
        }
        if (requestData.containsKey("tipoContrato")) {
            vacante.setTipoContrato((String) requestData.get("tipoContrato"));
        }
        
        // Asignar valores por defecto
        vacante.setEstado(EstadoVacante.PAUSADA);
        
        // TODO: Obtener idReclutador del token de autenticación
        // Por ahora, usar un valor por defecto o del request
        if (requestData.containsKey("idReclutador")) {
            vacante.setIdReclutador((Integer) requestData.get("idReclutador"));
        } else {
            vacante.setIdReclutador(1); // Valor por defecto temporal
        }
        
        Vacante vacanteCreada = servicioVacante.crearVacante(vacante);
        return ResponseEntity.status(HttpStatus.CREATED).body(vacanteCreada);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Vacante> actualizarVacante(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> requestData) {
        log.info("Actualizando vacante {}: {}", id, requestData);
        
        Vacante vacante = servicioVacante.obtenerVacantePorId(id);
        
        if (requestData.containsKey("nombre")) {
            vacante.setNombre((String) requestData.get("nombre"));
        }
        if (requestData.containsKey("descripcion")) {
            vacante.setDescripcion((String) requestData.get("descripcion"));
        }
        if (requestData.containsKey("requisitos")) {
            vacante.setRequisitos((String) requestData.get("requisitos"));
        }
        if (requestData.containsKey("modalidad")) {
            vacante.setModalidad((String) requestData.get("modalidad"));
        }
        if (requestData.containsKey("rangoSalarial")) {
            vacante.setRangoSalarial((String) requestData.get("rangoSalarial"));
        }
        if (requestData.containsKey("departamento")) {
            vacante.setDepartamento((String) requestData.get("departamento"));
        }
        if (requestData.containsKey("prioridad")) {
            vacante.setPrioridad((String) requestData.get("prioridad"));
        }
        if (requestData.containsKey("tipoContrato")) {
            vacante.setTipoContrato((String) requestData.get("tipoContrato"));
        }
        
        Vacante vacanteActualizada = servicioVacante.actualizarVacante(id, vacante);
        return ResponseEntity.ok(vacanteActualizada);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarVacante(@PathVariable Integer id) {
        servicioVacante.eliminarVacante(id);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{id}/publicar")
    public ResponseEntity<Vacante> publicarVacante(@PathVariable Integer id) {
        Vacante vacante = servicioVacante.publicarVacante(id);
        return ResponseEntity.ok(vacante);
    }
    
    @PutMapping("/{id}/cerrar")
    public ResponseEntity<Vacante> cerrarVacante(@PathVariable Integer id) {
        Vacante vacante = servicioVacante.cerrarVacante(id);
        return ResponseEntity.ok(vacante);
    }
    
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Vacante> actualizarEstado(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {
        String nuevoEstado = request.get("estado");
        EstadoVacante estado = EstadoVacante.valueOf(nuevoEstado);
        Vacante vacante = servicioVacante.actualizarEstado(id, estado);
        return ResponseEntity.ok(vacante);
    }
    
    @GetMapping("/{id}/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas(@PathVariable Integer id) {
        Map<String, Object> estadisticas = estadisticasService.obtenerEstadisticasVacante(id);
        return ResponseEntity.ok(estadisticas);
    }
}

