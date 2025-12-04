package com.rrhh.vacaciones.pattern.command.impl;

import com.rrhh.vacaciones.model.SaldoVacaciones;
import com.rrhh.vacaciones.model.Trabajador;
import com.rrhh.vacaciones.pattern.command.ComandoGestionarSaldo; // <--- Importar interfaz
import com.rrhh.vacaciones.repository.ISaldoVacacionesRepository;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Component
@Scope("prototype")
@RequiredArgsConstructor
public class AsignarSaldo implements ComandoGestionarSaldo { // <--- Implementar interfaz

    private final ISaldoVacacionesRepository saldoRepository;

    @Setter
    private Integer idEmpleado;
    @Setter
    private Integer anio;
    @Setter
    private Integer diasAsignados;

    @Override // <--- Agregar anotación
    @Transactional
    public void ejecutar() {
        // ... (Tu lógica existente se mantiene igual) ...
        // 1. Buscamos si ya existe saldo para ese empleado y año
        Optional<SaldoVacaciones> existente = saldoRepository.findByEmpleadoIdEmpleadoAndAnio(idEmpleado, anio);

        SaldoVacaciones saldo;
        if (existente.isPresent()) {
            saldo = existente.get();
            saldo.setDiasAsignados(diasAsignados);
        } else {
            saldo = new SaldoVacaciones();
            saldo.setAnio(anio);
            saldo.setDiasAsignados(diasAsignados);
            saldo.setDiasTomados(0);
            saldo.setDiasVencidos(0);

            Trabajador t = new Trabajador();
            t.setIdEmpleado(idEmpleado);
            saldo.setEmpleado(t);
        }

        saldoRepository.save(saldo);
    }
}