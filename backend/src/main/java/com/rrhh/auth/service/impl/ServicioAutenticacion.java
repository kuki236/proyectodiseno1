package com.rrhh.auth.service.impl;

import com.rrhh.shared.domain.model.Reclutador;
import com.rrhh.shared.domain.model.Usuario;
import com.rrhh.auth.dto.LoginRequest;
import com.rrhh.auth.dto.LoginResponse;
import com.rrhh.shared.exception.BusinessException;
import com.rrhh.auth.repository.ReclutadorRepository;
import com.rrhh.auth.repository.UsuarioRepository;
import com.rrhh.auth.service.IServicioAutenticacion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServicioAutenticacion implements IServicioAutenticacion {

    private final UsuarioRepository usuarioRepository;
    private final ReclutadorRepository reclutadorRepository;
    // Inyectamos DataSource para poder ejecutar la consulta SQL manual
    private final DataSource dataSource; 
    
    // En producción, usar JWT o Spring Security
    // Por ahora, usamos un token simple basado en UUID

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        log.info("Intento de login para usuario: {}", request.getUsername());

        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException("CREDENCIALES_INVALIDAS",
                        "Usuario o contraseña incorrectos"));

        // Verificar si la cuenta está bloqueada
        if (Boolean.TRUE.equals(usuario.getCuentaBloqueada())) {
            throw new BusinessException("CUENTA_BLOQUEADA",
                    "La cuenta está bloqueada. Contacte al administrador.");
        }

        // Verificar si el usuario está activo
        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new BusinessException("USUARIO_INACTIVO",
                    "El usuario está inactivo. Contacte al administrador.");
        }

        // Verificar contraseña (hash simple - en producción usar BCrypt)
        String passwordHash = hashPassword(request.getPassword());
        
        if (!passwordHash.equals(usuario.getPasswordHash())) {
            log.warn("Contraseña incorrecta para usuario: {}", request.getUsername());
            // Incrementar intentos fallidos
            usuario.setIntentosFallidos(usuario.getIntentosFallidos() + 1);
            if (usuario.getIntentosFallidos() >= 5) {
                usuario.setCuentaBloqueada(true);
                usuarioRepository.save(usuario);
                throw new BusinessException("CUENTA_BLOQUEADA",
                        "Demasiados intentos fallidos. La cuenta ha sido bloqueada.");
            }
            usuarioRepository.save(usuario);
            throw new BusinessException("CREDENCIALES_INVALIDAS",
                    "Usuario o contraseña incorrectos");
        }

        // Login exitoso
        usuario.setIntentosFallidos(0);
        usuario.setFechaUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);

        // Generar token simple (en producción usar JWT)
        String token = generarToken(usuario.getIdUsuario());
        
        // Buscar reclutador asociado (solo para referencia de ID si es necesario)
        Reclutador reclutador = reclutadorRepository.findByIdUsuario(usuario.getIdUsuario())
            .orElse(null);
        
        // --- CAMBIO: OBTENER ROL REAL DESDE BD ---
        String rolUsuario = obtenerRolUsuario(usuario.getIdUsuario());
        
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setIdUsuario(usuario.getIdUsuario());
        response.setUsername(usuario.getUsername());
        response.setNombreCompleto(usuario.getNombreCompleto());
        response.setEmail(usuario.getEmail());
        response.setIdReclutador(reclutador != null ? reclutador.getIdReclutador() : null);
        
        // Asignamos el rol obtenido por SQL
        response.setTipoUsuario(rolUsuario);
        
        log.info("Login exitoso para usuario: {} con rol: {}", usuario.getUsername(), rolUsuario);
        return response;
    }
    
    /**
     * Método para obtener el rol mediante JDBC puro
     */
    private String obtenerRolUsuario(Integer idUsuario) {
        // Consultar el rol del usuario desde la base de datos
        String sql = "SELECT r.nombre_rol FROM roles r " +
                     "INNER JOIN usuarios_roles ur ON r.id_rol = ur.id_rol " +
                     "WHERE ur.id_usuario = ? AND r.activo = TRUE"; // Asumiendo que 'activo' es booleano en BD
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, idUsuario);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("nombre_rol");
                }
            }
        } catch (Exception e) {
            log.error("Error al obtener rol del usuario con ID: " + idUsuario, e);
        }
        
        // Rol por defecto si falla la consulta o no tiene rol asignado
        return "USUARIO"; 
    }

    @Override
    public void logout(String token) {
        // En producción, invalidar el token en una blacklist
        log.info("Logout para token: {}", token);
    }

    @Override
    public boolean validarToken(String token) {
        // En producción, validar JWT
        // Por ahora, solo verificamos que el token tenga el formato correcto
        try {
            String[] parts = token.split("\\.");
            if (parts.length == 2) {
                String payload = new String(Base64.getDecoder().decode(parts[1]));
                return payload.contains("idUsuario");
            }
        } catch (Exception e) {
            log.error("Error al validar token", e);
        }
        return false;
    }

    @Override
    public Integer obtenerIdUsuarioDesdeToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length == 2) {
                String payload = new String(Base64.getDecoder().decode(parts[1]));

                String claveBusqueda = "\"idUsuario\":";

                if (payload.contains(claveBusqueda)) {

                    String idStr = payload.substring(payload.indexOf(claveBusqueda) + claveBusqueda.length());

                    idStr = idStr.split("[,}]")[0].trim();
                    return Integer.parseInt(idStr);
                }
            }
        } catch (Exception e) {
            log.error("Error al extraer idUsuario del token", e);
        }
        return null;
    }

    private String hashPassword(String password) {
        try {
            // Limpiar la contraseña (eliminar espacios al inicio y final)
            String cleanPassword = password != null ? password.trim() : "";
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(cleanPassword.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error al hashear contraseña", e);
        }
    }

    private String generarToken(Integer idUsuario) {
        // Token simple: header.payload
        // En producción usar JWT
        String header = Base64.getEncoder().encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes());
        String payload = Base64.getEncoder().encodeToString(
                String.format("{\"idUsuario\":%d,\"exp\":%d}", idUsuario,
                        System.currentTimeMillis() + 86400000).getBytes()
        );
        return header + "." + payload;
    }
}