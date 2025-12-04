package com.rrhh.auth.controller;

import com.rrhh.auth.dto.LoginRequest;
import com.rrhh.auth.dto.LoginResponse;
import com.rrhh.auth.service.IServicioAutenticacion;
import com.rrhh.shared.exception.BusinessException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class AuthController {
    
    private final IServicioAutenticacion servicioAutenticacion;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = servicioAutenticacion.login(request);
            return ResponseEntity.ok(response);
        } catch (BusinessException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getCode());
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        } catch (Exception e) {
            log.error("Error inesperado en login", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "ERROR_LOGIN");
            error.put("message", "Error al iniciar sesión");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestHeader(value = "Authorization", required = false) String token) {
        if (token != null && token.startsWith("Bearer ")) {
            servicioAutenticacion.logout(token.substring(7));
        }
        Map<String, String> response = new HashMap<>();
        response.put("message", "Sesión cerrada exitosamente");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestHeader(value = "Authorization", required = false) String token) {
        Map<String, Object> response = new HashMap<>();
        
        if (token == null || !token.startsWith("Bearer ")) {
            response.put("valid", false);
            response.put("message", "Token no proporcionado");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        String tokenValue = token.substring(7);
        boolean isValid = servicioAutenticacion.validarToken(tokenValue);
        
        response.put("valid", isValid);
        if (isValid) {
            Integer idUsuario = servicioAutenticacion.obtenerIdUsuarioDesdeToken(tokenValue);
            response.put("idUsuario", idUsuario);
        }
        
        return ResponseEntity.ok(response);
    }
}

