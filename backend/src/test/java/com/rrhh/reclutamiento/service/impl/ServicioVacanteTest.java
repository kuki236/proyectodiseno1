package com.rrhh.reclutamiento.service.impl;

import com.rrhh.reclutamiento.repository.VacanteRepository;
import com.rrhh.shared.domain.model.Vacante;
import com.rrhh.shared.domain.enums.EstadoVacante;
import com.rrhh.shared.exception.BusinessException;
import com.rrhh.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServicioVacanteTest {

    @Mock
    private VacanteRepository vacanteRepository;

    @InjectMocks
    private ServicioVacante servicioVacante;

    private Vacante vacante;

    @BeforeEach
    void setUp() {
        vacante = new Vacante();
        vacante.setIdVacante(1);
        vacante.setNombre("Desarrollador Java");
        vacante.setDescripcion("Desarrollador Java Senior");
        vacante.setRequisitos("Java, Spring Boot, MySQL");
        vacante.setEstado(EstadoVacante.PAUSADA);
        vacante.setIdReclutador(1);
    }

    @Test
    void testCrearVacanteExitoso() {
        // Arrange
        when(vacanteRepository.save(any(Vacante.class))).thenReturn(vacante);

        // Act
        Vacante resultado = servicioVacante.crearVacante(vacante);

        // Assert
        assertNotNull(resultado);
        assertEquals(EstadoVacante.PAUSADA, resultado.getEstado());
        verify(vacanteRepository, times(1)).save(any(Vacante.class));
    }

    @Test
    void testCrearVacanteSinNombre() {
        // Arrange
        vacante.setNombre(null);

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            servicioVacante.crearVacante(vacante);
        });

        assertEquals("NOMBRE_REQUERIDO", exception.getCode());
        verify(vacanteRepository, never()).save(any(Vacante.class));
    }

    @Test
    void testCrearVacanteSinDescripcion() {
        // Arrange
        vacante.setDescripcion(null);

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            servicioVacante.crearVacante(vacante);
        });

        assertEquals("DESCRIPCION_REQUERIDA", exception.getCode());
        verify(vacanteRepository, never()).save(any(Vacante.class));
    }

    @Test
    void testPublicarVacanteExitoso() {
        // Arrange
        vacante.setEstado(EstadoVacante.PAUSADA);
        when(vacanteRepository.findById(1)).thenReturn(Optional.of(vacante));
        when(vacanteRepository.save(any(Vacante.class))).thenReturn(vacante);

        // Act
        Vacante resultado = servicioVacante.publicarVacante(1);

        // Assert
        assertNotNull(resultado);
        verify(vacanteRepository, times(1)).findById(1);
        verify(vacanteRepository, times(1)).save(any(Vacante.class));
    }

    @Test
    void testPublicarVacanteNoEncontrada() {
        // Arrange
        when(vacanteRepository.findById(1)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            servicioVacante.publicarVacante(1);
        });

        assertNotNull(exception);
        verify(vacanteRepository, never()).save(any(Vacante.class));
    }

    @Test
    void testPublicarVacanteYaPublicada() {
        // Arrange
        vacante.setEstado(EstadoVacante.ABIERTA);
        when(vacanteRepository.findById(1)).thenReturn(Optional.of(vacante));

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            servicioVacante.publicarVacante(1);
        });

        assertEquals("VACANTE_YA_PUBLICADA", exception.getCode());
        verify(vacanteRepository, never()).save(any(Vacante.class));
    }

    @Test
    void testPublicarVacanteSinRequisitos() {
        // Arrange
        vacante.setRequisitos(null);
        when(vacanteRepository.findById(1)).thenReturn(Optional.of(vacante));

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            servicioVacante.publicarVacante(1);
        });

        assertEquals("REQUISITOS_REQUERIDOS", exception.getCode());
        verify(vacanteRepository, never()).save(any(Vacante.class));
    }

    @Test
    void testCerrarVacanteExitoso() {
        // Arrange
        vacante.setEstado(EstadoVacante.ABIERTA);
        when(vacanteRepository.findById(1)).thenReturn(Optional.of(vacante));
        when(vacanteRepository.save(any(Vacante.class))).thenReturn(vacante);

        // Act
        Vacante resultado = servicioVacante.cerrarVacante(1);

        // Assert
        assertNotNull(resultado);
        verify(vacanteRepository, times(1)).findById(1);
        verify(vacanteRepository, times(1)).save(any(Vacante.class));
    }

    @Test
    void testCerrarVacanteYaCerrada() {
        // Arrange
        vacante.setEstado(EstadoVacante.CERRADA);
        when(vacanteRepository.findById(1)).thenReturn(Optional.of(vacante));

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            servicioVacante.cerrarVacante(1);
        });

        assertEquals("VACANTE_YA_CERRADA", exception.getCode());
        verify(vacanteRepository, never()).save(any(Vacante.class));
    }

    @Test
    void testBuscarVacantesActivas() {
        // Arrange
        Vacante vacante1 = new Vacante();
        vacante1.setEstado(EstadoVacante.ABIERTA);
        Vacante vacante2 = new Vacante();
        vacante2.setEstado(EstadoVacante.ABIERTA);
        List<Vacante> vacantes = Arrays.asList(vacante1, vacante2);
        
        when(vacanteRepository.findByEstado(EstadoVacante.ABIERTA)).thenReturn(vacantes);

        // Act
        List<Vacante> resultado = servicioVacante.buscarVacantesActivas();

        // Assert
        assertNotNull(resultado);
        assertEquals(2, resultado.size());
        verify(vacanteRepository, times(1)).findByEstado(EstadoVacante.ABIERTA);
    }

    @Test
    void testActualizarVacanteExitoso() {
        // Arrange
        Vacante vacanteActualizada = new Vacante();
        vacanteActualizada.setNombre("Nuevo Nombre");
        vacanteActualizada.setDescripcion("Nueva Descripción");
        
        when(vacanteRepository.findById(1)).thenReturn(Optional.of(vacante));
        when(vacanteRepository.save(any(Vacante.class))).thenReturn(vacante);

        // Act
        Vacante resultado = servicioVacante.actualizarVacante(1, vacanteActualizada);

        // Assert
        assertNotNull(resultado);
        verify(vacanteRepository, times(1)).findById(1);
        verify(vacanteRepository, times(1)).save(any(Vacante.class));
    }

    @Test
    void testActualizarVacanteCerrada() {
        // Arrange
        vacante.setEstado(EstadoVacante.CERRADA);
        Vacante vacanteActualizada = new Vacante();
        
        when(vacanteRepository.findById(1)).thenReturn(Optional.of(vacante));

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            servicioVacante.actualizarVacante(1, vacanteActualizada);
        });

        assertEquals("VACANTE_CERRADA", exception.getCode());
        verify(vacanteRepository, never()).save(any(Vacante.class));
    }

    @Test
    void testObtenerVacantePorId() {
        // Arrange
        when(vacanteRepository.findById(1)).thenReturn(Optional.of(vacante));

        // Act
        Vacante resultado = servicioVacante.obtenerVacantePorId(1);

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.getIdVacante());
        verify(vacanteRepository, times(1)).findById(1);
    }

    @Test
    void testObtenerVacantePorIdNoEncontrada() {
        // Arrange
        when(vacanteRepository.findById(1)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            servicioVacante.obtenerVacantePorId(1);
        });

        assertNotNull(exception);
    }

    @Test
    void testEliminarVacanteExitoso() {
        // Arrange
        vacante.setEstado(EstadoVacante.PAUSADA);
        when(vacanteRepository.findById(1)).thenReturn(Optional.of(vacante));
        doNothing().when(vacanteRepository).deleteById(1);

        // Act
        servicioVacante.eliminarVacante(1);

        // Assert
        verify(vacanteRepository, times(1)).findById(1);
        verify(vacanteRepository, times(1)).deleteById(1);
    }

    @Test
    void testEliminarVacanteAbierta() {
        // Arrange
        vacante.setEstado(EstadoVacante.ABIERTA);
        when(vacanteRepository.findById(1)).thenReturn(Optional.of(vacante));

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            servicioVacante.eliminarVacante(1);
        });

        assertEquals("VACANTE_ABIERTA", exception.getCode());
        verify(vacanteRepository, never()).deleteById(anyInt());
    }

    @Test
    void testActualizarEstado() {
        // Arrange
        when(vacanteRepository.findById(1)).thenReturn(Optional.of(vacante));
        when(vacanteRepository.save(any(Vacante.class))).thenReturn(vacante);

        // Act
        Vacante resultado = servicioVacante.actualizarEstado(1, EstadoVacante.ABIERTA);

        // Assert
        assertNotNull(resultado);
        verify(vacanteRepository, times(1)).findById(1);
        verify(vacanteRepository, times(1)).save(any(Vacante.class));
    }
}

