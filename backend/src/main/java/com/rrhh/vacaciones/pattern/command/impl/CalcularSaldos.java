package com.rrhh.vacaciones.pattern.command.impl;

import com.rrhh.vacaciones.dto.ReporteSaldoDTO;
import com.rrhh.vacaciones.model.SaldoVacaciones;
import com.rrhh.vacaciones.model.Trabajador;
import com.rrhh.vacaciones.pattern.command.ComandoGenerarReporte;
import com.rrhh.vacaciones.repository.ISaldoVacacionesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CalcularSaldos implements ComandoGenerarReporte<ReporteSaldoDTO> {

    private final ISaldoVacacionesRepository saldoRepository;
    // Ya no necesitamos IEmpleadoResumenRepository, lo quitamos.

    @Override
    public List<ReporteSaldoDTO> ejecutar() {
        // 1. Obtenemos los saldos (Datos básicos)
        List<SaldoVacaciones> saldos = saldoRepository.findAllCurrentYear();

        // 2. Obtenemos los datos organizacionales (Departamento/Area) vía SQL Nativo
        List<Object[]> datosOrg = saldoRepository.obtenerDatosOrganizacionales();

        // 3. Convertimos la lista de objetos a un Mapa para búsqueda rápida
        // Key: ID Empleado (Integer) -> Value: Array con [Departamento, Area]
        Map<Integer, String[]> mapaOrg = new HashMap<>();
        for (Object[] fila : datosOrg) {
            Integer id = ((Number) fila[0]).intValue();
            String depto = (String) fila[1];
            String area = (String) fila[2];
            mapaOrg.put(id, new String[]{depto, area});
        }

        // 4. Cruzamos la información
        return saldos.stream().map(s -> {
            Trabajador t = s.getEmpleado();

            // Construcción del nombre
            String paterno = t.getApellidoPaterno() != null ? t.getApellidoPaterno() : "";
            String materno = t.getApellidoMaterno() != null ? " " + t.getApellidoMaterno() : "";
            String nombreCompleto = t.getNombres() + " " + paterno + materno;

            // Buscamos departamento y área en el mapa que creamos
            String[] orgData = mapaOrg.get(t.getIdEmpleado());

            String departamento = (orgData != null) ? orgData[0] : "Sin Departamento";
            String area = (orgData != null) ? orgData[1] : "General";

            return new ReporteSaldoDTO(
                    t.getIdEmpleado(),
                    nombreCompleto.trim(),
                    departamento, // Agrupador
                    area,         // Detalle
                    s.getDiasAsignados(),
                    s.getDiasTomados(),
                    s.getDiasPendientes()
            );
        }).collect(Collectors.toList());
    }
}