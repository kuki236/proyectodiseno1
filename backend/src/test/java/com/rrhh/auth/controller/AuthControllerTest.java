package com.rrhh.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rrhh.auth.dto.LoginRequest;
import com.rrhh.auth.dto.LoginResponse;
import com.rrhh.auth.service.IServicioAutenticacion;
import com.rrhh.shared.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "cors.allowed-origins=*",
    "cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS",
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IServicioAutenticacion servicioAutenticacion;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testLoginExitoso() throws Exception {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password123");

        LoginResponse response = new LoginResponse();
        response.setToken("test.token");
        response.setIdUsuario(1);
        response.setUsername("testuser");
        response.setNombreCompleto("Test User");
        response.setEmail("test@example.com");

        when(servicioAutenticacion.login(any(LoginRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("test.token"))
                .andExpect(jsonPath("$.idUsuario").value(1))
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    void testLoginCredencialesInvalidas() throws Exception {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("wrongpassword");

        when(servicioAutenticacion.login(any(LoginRequest.class)))
                .thenThrow(new BusinessException("CREDENCIALES_INVALIDAS", "Usuario o contraseña incorrectos"));

        // Act & Assert
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testValidarTokenValido() throws Exception {
        // Arrange
        String token = "valid.token";
        when(servicioAutenticacion.validarToken(token)).thenReturn(true);
        when(servicioAutenticacion.obtenerIdUsuarioDesdeToken(token)).thenReturn(1);

        // Act & Assert
        mockMvc.perform(get("/auth/validate")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.idUsuario").value(1));
    }

    @Test
    void testValidarTokenInvalido() throws Exception {
        // Arrange
        String token = "invalid.token";
        when(servicioAutenticacion.validarToken(token)).thenReturn(false);

        // Act & Assert
        mockMvc.perform(get("/auth/validate")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false));
    }

    @Test
    void testValidarTokenSinHeader() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/auth/validate"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.valid").value(false));
    }

    @Test
    void testLogout() throws Exception {
        // Arrange
        String token = "test.token";
        // No hay retorno para logout, solo verificar que no lance excepción

        // Act & Assert
        mockMvc.perform(post("/auth/logout")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Sesión cerrada exitosamente"));
    }
}

