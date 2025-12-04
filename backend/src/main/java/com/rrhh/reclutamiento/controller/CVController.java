package com.rrhh.reclutamiento.controller;

import com.rrhh.reclutamiento.dto.CVGoogleDriveDTO;
import com.rrhh.reclutamiento.service.ICVService;
import com.rrhh.shared.domain.model.CV;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cvs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CVController {

    private final ICVService cvService;

    @PostMapping("/google-drive")
    public ResponseEntity<CV> registrarDesdeGoogleDrive(@RequestBody CVGoogleDriveDTO dto) {
        CV cv = cvService.registrarDesdeGoogleDrive(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(cv);
    }
}
