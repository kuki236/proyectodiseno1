package com.rrhh.reclutamiento.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rrhh.reclutamiento.service.EstadisticasService;
import com.rrhh.reclutamiento.service.IServicioVacante;
import com.rrhh.shared.domain.model.Vacante;
import com.rrhh.shared.domain.enums.EstadoVacante;
import com.rrhh.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
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
class VacanteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IServicioVacante servicioVacante;

    @MockBean
    private EstadisticasService estadisticasService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testObtenerVacantes() throws Exception {
        // Arrange
        Vacante vacante1 = new Vacante();
        vacante1.setIdVacante(1);
        vacante1.setNombre("Vacante 1");
        vacante1.setEstado(EstadoVacante.ABIERTA);
        
        Vacante vacante2 = new Vacante();
        vacante2.setIdVacante(2);
        vacante2.setNombre("Vacante 2");
        vacante2.setEstado(EstadoVacante.ABIERTA);
        
        List<Vacante> vacantes = Arrays.asList(vacante1, vacante2);
        when(servicioVacante.buscarVacantesActivas()).thenReturn(vacantes);

        // Act & Assert
        mockMvc.perform(get("/vacantes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void testObtenerVacantePorId() throws Exception {
        // Arrange
        Vacante vacante = new Vacante();
        vacante.setIdVacante(1);
        vacante.setNombre("Desarrollador Java");
        vacante.setEstado(EstadoVacante.ABIERTA);
        
        when(servicioVacante.obtenerVacantePorId(1)).thenReturn(vacante);

        // Act & Assert
        mockMvc.perform(get("/vacantes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idVacante").value(1))
                .andExpect(jsonPath("$.nombre").value("Desarrollador Java"));
    }

    @Test
    void testObtenerVacantePorIdNoEncontrada() throws Exception {
        // Arrange
        when(servicioVacante.obtenerVacantePorId(999))
                .thenThrow(new ResourceNotFoundException("Vacante", 999));

        // Act & Assert
        mockMvc.perform(get("/vacantes/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testCrearVacante() throws Exception {
        // Arrange
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("nombre", "Nueva Vacante");
        requestData.put("descripcion", "Descripción de la vacante");
        requestData.put("requisitos", "Requisitos de la vacante");
        requestData.put("idReclutador", 1);

        Vacante vacanteCreada = new Vacante();
        vacanteCreada.setIdVacante(1);
        vacanteCreada.setNombre("Nueva Vacante");
        vacanteCreada.setEstado(EstadoVacante.PAUSADA);
        
        when(servicioVacante.crearVacante(any(Vacante.class))).thenReturn(vacanteCreada);

        // Act & Assert
        mockMvc.perform(post("/vacantes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestData)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idVacante").value(1))
                .andExpect(jsonPath("$.nombre").value("Nueva Vacante"));
    }

    @Test
    void testActualizarVacante() throws Exception {
        // Arrange
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("nombre", "Vacante Actualizada");
        requestData.put("descripcion", "Nueva descripción");

        Vacante vacanteExistente = new Vacante();
        vacanteExistente.setIdVacante(1);
        vacanteExistente.setEstado(EstadoVacante.PAUSADA);
        
        Vacante vacanteActualizada = new Vacante();
        vacanteActualizada.setIdVacante(1);
        vacanteActualizada.setNombre("Vacante Actualizada");
        
        when(servicioVacante.obtenerVacantePorId(1)).thenReturn(vacanteExistente);
        when(servicioVacante.actualizarVacante(anyInt(), any(Vacante.class))).thenReturn(vacanteActualizada);

        // Act & Assert
        mockMvc.perform(put("/vacantes/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestData)))
                .andExpect(status().isOk());
    }

    @Test
    void testEliminarVacante() throws Exception {
        // Arrange
        Vacante vacante = new Vacante();
        vacante.setIdVacante(1);
        vacante.setEstado(EstadoVacante.PAUSADA);
        
        when(servicioVacante.obtenerVacantePorId(1)).thenReturn(vacante);
        // eliminarVacante no retorna nada, solo verificar que no lance excepción

        // Act & Assert
        mockMvc.perform(delete("/vacantes/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void testPublicarVacante() throws Exception {
        // Arrange
        Vacante vacante = new Vacante();
        vacante.setIdVacante(1);
        vacante.setEstado(EstadoVacante.ABIERTA);
        
        when(servicioVacante.publicarVacante(1)).thenReturn(vacante);

        // Act & Assert
        mockMvc.perform(put("/vacantes/1/publicar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idVacante").value(1));
    }

    @Test
    void testCerrarVacante() throws Exception {
        // Arrange
        Vacante vacante = new Vacante();
        vacante.setIdVacante(1);
        vacante.setEstado(EstadoVacante.CERRADA);
        
        when(servicioVacante.cerrarVacante(1)).thenReturn(vacante);

        // Act & Assert
        mockMvc.perform(put("/vacantes/1/cerrar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idVacante").value(1));
    }

    @Test
    void testObtenerEstadisticas() throws Exception {
        // Arrange
        Map<String, Object> estadisticas = new HashMap<>();
        estadisticas.put("totalCandidatos", 10);
        estadisticas.put("candidatosSeleccionados", 3);
        estadisticas.put("tasaConversion", "30.00%");
        
        when(estadisticasService.obtenerEstadisticasVacante(1)).thenReturn(estadisticas);

        // Act & Assert
        mockMvc.perform(get("/vacantes/1/estadisticas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCandidatos").value(10))
                .andExpect(jsonPath("$.candidatosSeleccionados").value(3));
    }
}

