package com.rrhh.vacaciones.controller;

import com.rrhh.vacaciones.model.EmpleadoResumen;
import com.rrhh.vacaciones.repository.IEmpleadoResumenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/empleados")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmpleadoController {

    private final IEmpleadoResumenRepository empleadoRepository;

    @GetMapping
    public ResponseEntity<List<EmpleadoResumen>> listarEmpleados() {
        return ResponseEntity.ok(empleadoRepository.findAll());
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<EmpleadoResumen>> buscarEmpleados(@RequestParam String q) {
        return ResponseEntity.ok(empleadoRepository.findByNombreCompletoContainingIgnoreCase(q));
    }
}