package com.rrhh.incentivos.service;

import com.rrhh.incentivos.domain.model.*; 
import com.rrhh.incentivos.dto.*;
import com.rrhh.incentivos.pattern.FabricaIncentivos; 
import com.rrhh.incentivos.repository.*;
import com.rrhh.shared.domain.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory; // Import necesario para logging

@Service
@RequiredArgsConstructor
public class IncentivoService implements IIncentivoService {

    private static final Logger log = LoggerFactory.getLogger(IncentivoService.class); // Declaración del Logger

    private final BonoRepository bonoRepository;
    private final MetaRepository metaRepository;
    private final EmpleadoRepository empleadoRepository;
    private final ReglaIncentivoRepository reglaIncentivoRepository;
    
    private final Map<String, FabricaIncentivos> fabricas;

    // =========================================================================
    //                            MÓDULO EMPLEADO (Implementación de Interfaz)
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public List<BonoResumenDTO> obtenerBonosPorEmpleado(Integer idEmpleado) {
        List<Bono> bonos = bonoRepository.findByEmpleadoIdEmpleado(idEmpleado);
        return bonos.stream().map(this::mapToResumenDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DetalleEvidenciaDTO obtenerDetalleBono(Integer idBono) {
        Bono bono = bonoRepository.findById(idBono)
                .orElseThrow(() -> new RuntimeException("Bono no encontrado"));

        DetalleEvidenciaDTO dto = new DetalleEvidenciaDTO();
        
        if (bono.getEvidencias() != null && !bono.getEvidencias().isEmpty()) {
            Evidencia evidencia = bono.getEvidencias().get(0);
            
            dto.setResumen(evidencia.obtenerResumen());
            
            if (evidencia instanceof EvidenciaVenta) {
                dto.setTipoEvidencia("VENTA");
                EvidenciaVenta venta = (EvidenciaVenta) evidencia;
                dto.setIdBoleta(venta.getIdBoleta());
                dto.setMontoVendido(venta.getMontoVendido());
            } else if (evidencia instanceof EvidenciaAtencion) {
                dto.setTipoEvidencia("ATENCION");
                EvidenciaAtencion atencion = (EvidenciaAtencion) evidencia;
                dto.setIdTicket(atencion.getIdTicket());
                dto.setSatisfaccionCliente(atencion.getEstadoTicket()); 
            }
        } else {
            dto.setResumen("Sin evidencia adjunta");
        }

        return dto;
    }
    
    @Override
    @Transactional(readOnly = true)
    public DashboardEmpleadoDTO obtenerDashboardEmpleado(Integer idEmpleado, String periodo) {
        DashboardEmpleadoDTO dto = new DashboardEmpleadoDTO();
        
        EmpleadoInc empleado = empleadoRepository.findById(idEmpleado)
            .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
        
        String area = "General";
        if (empleado.getPuesto() != null) {
            area = empleado.getPuesto().getDepartamento();
        }
        dto.setSaludo("Hola, " + empleado.getNombres() + " (" + area + ")");
        dto.setPeriodo(periodo);

        List<Bono> bonosPeriodo = bonoRepository.findByEmpleadoIdEmpleadoAndPeriodo(idEmpleado, periodo);
        BigDecimal totalAcumulado = bonosPeriodo.stream()
            .map(Bono::getMonto)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        dto.setMontoAcumulado(totalAcumulado);
        dto.setEstadoCierre("Pendiente de Cierre");
        
        if (totalAcumulado.compareTo(new BigDecimal("1000")) > 0) {
            dto.setMensajeMotivacional("¡Excelente ritmo! Estás entre los mejores del equipo.");
        } else {
            dto.setMensajeMotivacional("Sigue esforzándote para alcanzar tus metas del mes.");
        }

        List<Meta> metas = metaRepository.findByEmpleadoIdEmpleadoAndPeriodo(idEmpleado, periodo)
                                        .map(List::of)
                                        .orElse(new ArrayList<>());
        
        List<DashboardEmpleadoDTO.MetaProgresoItem> itemsMeta = new ArrayList<>();
        for (Meta m : metas) {
            DashboardEmpleadoDTO.MetaProgresoItem item = new DashboardEmpleadoDTO.MetaProgresoItem();
            item.setTitulo(m.getNombreMeta() != null ? m.getNombreMeta() : "Meta Asignada");
            
            double actual = m.getValorActual() != null ? m.getValorActual().doubleValue() : 0.0;
            double objetivo = m.getValorObjetivo() != null ? m.getValorObjetivo().doubleValue() : 0.0;
            int porcentaje = (objetivo > 0) ? (int)((actual / objetivo) * 100) : 0;
            
            item.setPorcentaje(Math.min(porcentaje, 100));
            item.setSubtitulo("Has logrado " + m.getValorActual() + " de " + m.getValorObjetivo());
            
            if (porcentaje >= 100) {
                item.setMensajeEstado("¡Meta cumplida! Bono asegurado.");
                item.setColorEstado("success");
            } else {
                BigDecimal faltante = m.getValorObjetivo().subtract(m.getValorActual());
                item.setMensajeEstado("¡Faltan " + faltante + " para cumplir la meta!");
                item.setColorEstado("primary");
            }
            itemsMeta.add(item);
        }
        dto.setMisMetas(itemsMeta);

        List<Bono> ultimosBonos = bonoRepository.findTop5ByEmpleadoIdEmpleadoOrderByFechaCalculoDesc(idEmpleado);
        List<DashboardEmpleadoDTO.LogroItem> itemsLogro = ultimosBonos.stream().map(b -> {
            DashboardEmpleadoDTO.LogroItem item = new DashboardEmpleadoDTO.LogroItem();
            String concepto = (b.getRegla() != null) ? b.getRegla().getNombreRegla() : "Bono Extra";
            item.setTitulo("Te ganaste el bono '" + concepto + "'");
            item.setFecha(b.getFechaCalculo() != null ? b.getFechaCalculo().toString() : ""); 
            item.setIcono("TROFEO");
            return item;
        }).collect(Collectors.toList());
        dto.setUltimosLogros(itemsLogro);

        return dto;
    }

    // =========================================================================
    //                            MÓDULO ADMIN
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public DashboardAdminDTO obtenerDatosDashboard(String periodo) {
        log.debug("Iniciando carga de Dashboard Admin para el periodo: {}", periodo); // LOG 1: Trazabilidad
        DashboardAdminDTO dto = new DashboardAdminDTO();

        BigDecimal total = bonoRepository.sumMontoTotalPorPeriodo(periodo);
        dto.setTotalPagar(total != null ? total : BigDecimal.ZERO);
        dto.setPendientesRevision(bonoRepository.countByEstado(EstadoBono.PENDIENTE));
        
        // ... (rest of method logic) ...

        long metasCumplidas = metaRepository.countMetasCumplidas(periodo);
        long totalMetas = metaRepository.countByPeriodo(periodo);
        
        if (totalMetas > 0) {
            double porcentaje = (double) metasCumplidas / totalMetas * 100;
            dto.setPorcentajeMetasCumplidas(Math.round(porcentaje * 100.0) / 100.0);
        } else {
            dto.setPorcentajeMetasCumplidas(0.0);
        }

        dto.setEmpleadosActivos(empleadoRepository.countByEstado("ACTIVO"));

        dto.setEvolucionSemestral(java.util.Arrays.asList(
            new BigDecimal("38000"), new BigDecimal("41000"), new BigDecimal("39500"),
            new BigDecimal("42000"), new BigDecimal("44000"), total != null ? total : BigDecimal.ZERO
        ));

        Map<String, BigDecimal> presupuesto = new HashMap<>();
        presupuesto.put("Ventas", new BigDecimal("25000"));
        presupuesto.put("Atención al Cliente", new BigDecimal("15000"));
        presupuesto.put("Recursos Humanos", new BigDecimal("5280"));
        
        dto.setPresupuestoPorArea(presupuesto);

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReglaAdminDTO> listarReglasPorCategoria(String categoria) {
        List<ReglaIncentivo> todas = reglaIncentivoRepository.findAll();
        
        return todas.stream()
            .filter(r -> {
                if ("VENTAS".equalsIgnoreCase(categoria)) return r instanceof ReglaVentas;
                if ("ATENCION".equalsIgnoreCase(categoria)) return r instanceof ReglaAtencion; 
                return true;
            })
            .map(this::mapToReglaAdminDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void crearNuevaRegla(ReglaCreateDTO dto) {
        FabricaIncentivos fabrica = fabricas.get(dto.getCategoria());
        if (fabrica == null) {
            fabrica = fabricas.get("VENTAS");
        }

        ReglaIncentivo regla = fabrica.crearRegla();

        regla.setNombreRegla(dto.getNombre());
        regla.setPeriodo(dto.getFrecuencia());
        regla.setActivo(true); 

        String condicionLogica = dto.getMetrica() + " " + dto.getOperador() + " " + dto.getValorObjetivo();
        regla.setCondicion(condicionLogica);

        if ("ESPECIE".equalsIgnoreCase(dto.getTipoRecompensa())) {
            regla.setTipoValor("ESPECIE");
            regla.setDescripcionRecompensa(dto.getDescripcionRegalo());
            regla.setValorCalculo(BigDecimal.ZERO);
        } else {
            if ("PORCENTAJE".equalsIgnoreCase(dto.getTipoCalculo())) {
                regla.setTipoValor("PORCENTAJE");
            } else {
                regla.setTipoValor("FIJO");
            }
            regla.setValorCalculo(dto.getMonto());
            regla.setDescripcionRecompensa(null);
        }
        
        try {
            reglaIncentivoRepository.save(regla);
            log.info("Regla CREADA. ID: {}, Nombre: {}, Categoría: {}", 
                regla.getIdRegla(), 
                dto.getNombre(), 
                dto.getCategoria()
            ); // LOG 2: Trazabilidad de creación
        } catch (Exception e) {
            log.error("Error CRÍTICO al guardar la Regla {}: {}", dto.getNombre(), e.getMessage(), e); // LOG 3: Error
            throw new RuntimeException("Error al guardar la regla.");
        }
    }

    @Override
    @Transactional
    public void cambiarEstadoRegla(Integer idRegla, boolean nuevoEstado) {
        ReglaIncentivo regla = reglaIncentivoRepository.findById(idRegla)
            .orElseThrow(() -> new RuntimeException("Regla no encontrada"));
        regla.setActivo(nuevoEstado);
        reglaIncentivoRepository.save(regla);
        log.info("Regla #{} actualizada. Estado: {}", idRegla, nuevoEstado ? "ACTIVO" : "INACTIVO"); // LOG 4: Trazabilidad
    }
    
    @Override
    @Transactional
    public void eliminarRegla(Integer idRegla) {
        try {
            reglaIncentivoRepository.deleteById(idRegla);
            log.warn("Regla #{} ELIMINADA del sistema.", idRegla); // LOG: Advertencia por eliminación
        } catch (Exception e) {
            log.error("Error eliminando regla #{}!", idRegla, e);
            throw new RuntimeException("Fallo al eliminar la regla.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ResumenMetasDTO obtenerResumenMetas(String departamento, String periodo) {
        ResumenMetasDTO resumen = new ResumenMetasDTO();

        String nombreDptoBd = departamento;
        if ("VENTAS".equalsIgnoreCase(departamento)) {
            nombreDptoBd = "Comercial";
        } else if ("ATENCION".equalsIgnoreCase(departamento) || "ATENCIÓN".equalsIgnoreCase(departamento)) {
            nombreDptoBd = "Servicio al Cliente";
        }

        List<Meta> metasIndividuales = metaRepository.findMetasIndividuales(nombreDptoBd, periodo);
        
        BigDecimal sumaAsignada = BigDecimal.ZERO;
        BigDecimal sumaAvance = BigDecimal.ZERO;
        List<MetaEmpleadoDTO> listaDTOs = new ArrayList<>();

        for (Meta metaIndiv : metasIndividuales) {
            MetaEmpleadoDTO dto = new MetaEmpleadoDTO();
            EmpleadoInc emp = metaIndiv.getEmpleado();
            
            dto.setIdMeta(metaIndiv.getIdMeta());
            dto.setIdEmpleado(emp.getIdEmpleado());
            dto.setNombreEmpleado(emp.getNombreCompleto());
            dto.setCargo(emp.getPuesto() != null ? emp.getPuesto().getNombrePuesto() : "N/A");
            dto.setAvatar(emp.getNombres().substring(0,1) + emp.getApellidoPaterno().substring(0,1));
            
            dto.setMetaObjetivo(metaIndiv.getValorObjetivo());
            dto.setAvanceActual(metaIndiv.getValorActual());
            
            if (metaIndiv.getValorObjetivo() != null && metaIndiv.getValorObjetivo().compareTo(BigDecimal.ZERO) > 0) {
                double pct = metaIndiv.getValorActual().doubleValue() / metaIndiv.getValorObjetivo().doubleValue() * 100;
                dto.setPorcentajeAvance(Math.min(pct, 100.0));
            } else {
                dto.setPorcentajeAvance(0.0);
            }
            
            dto.setEstado(dto.getPorcentajeAvance() >= 100 ? "Cumplida" : "En Curso");

            sumaAsignada = sumaAsignada.add(metaIndiv.getValorObjetivo());
            sumaAvance = sumaAvance.add(metaIndiv.getValorActual());
            
            listaDTOs.add(dto);
        }

        resumen.setEmpleados(listaDTOs);
        resumen.setSumaAsignada(sumaAsignada);

        Meta metaGlobal = metaRepository.findMetaGlobal(nombreDptoBd, periodo).orElse(null);
        if (metaGlobal != null) {
            resumen.setMetaGlobalObjetivo(metaGlobal.getValorObjetivo());
        } else {
            resumen.setMetaGlobalObjetivo(sumaAsignada); 
        }

        if (resumen.getMetaGlobalObjetivo().compareTo(BigDecimal.ZERO) > 0) {
            double pctEquipo = sumaAvance.doubleValue() / resumen.getMetaGlobalObjetivo().doubleValue() * 100;
            resumen.setPorcentajeAvanceEquipo(Math.round(pctEquipo * 10.0) / 10.0);
        } else {
            resumen.setPorcentajeAvanceEquipo(0.0);
        }

        return resumen;
    }

    @Override
    @Transactional
    public void asignarMetaEmpleado(MetaAsignacionDTO dto) {
        EmpleadoInc empleado = empleadoRepository.findById(dto.getIdEmpleado())
            .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        Meta meta = metaRepository.findByEmpleadoIdEmpleadoAndPeriodo(dto.getIdEmpleado(), dto.getPeriodo())
            .orElse(null);

        if (meta == null) {
            String deptoKey = "VENTAS"; 
            if (empleado.getPuesto() != null) {
                String dpto = empleado.getPuesto().getDepartamento();
                if (dpto != null && (dpto.toUpperCase().contains("ATENCION") || dpto.toUpperCase().contains("CLIENTE"))) {
                    deptoKey = "ATENCION";
                }
            }
            
            FabricaIncentivos fabrica = fabricas.get(deptoKey);
            if (fabrica == null) fabrica = fabricas.get("VENTAS");

            meta = fabrica.crearMeta(); 

            meta.setEmpleado(empleado);
            meta.setPeriodo(dto.getPeriodo());
            meta.setValorActual(BigDecimal.ZERO);
            meta.setFechaInicio(java.time.LocalDate.now());
            meta.setFechaFin(java.time.LocalDate.now().plusMonths(1));
            
            if (empleado.getPuesto() != null) {
                meta.setIdDepartamento(empleado.getPuesto().getDepartamento());
            }
        }

        meta.setNombreMeta(dto.getTipoMeta()); 
        meta.setValorObjetivo(dto.getValorObjetivo());

        metaRepository.save(meta);
        log.info("Meta asignada/actualizada. Empleado ID: {}, Meta ID: {}, Objetivo: {}", empleado.getIdEmpleado(), meta.getIdMeta(), dto.getValorObjetivo());
    }

    @Override
    @Transactional(readOnly = true)
    public PantallaAprobacionDTO obtenerDataAprobaciones(String periodo) {
        PantallaAprobacionDTO data = new PantallaAprobacionDTO();

        BigDecimal total = bonoRepository.sumTotalPeriodo(periodo);
        BigDecimal aprobados = bonoRepository.sumMontoPorPeriodoYEstado(periodo, EstadoBono.APROBADO);
        BigDecimal pendientes = bonoRepository.sumMontoPorPeriodoYEstado(periodo, EstadoBono.PENDIENTE);

        data.setTotalBolsa(total != null ? total : BigDecimal.ZERO);
        data.setYaAprobado(aprobados != null ? aprobados : BigDecimal.ZERO);
        data.setPorAprobar(pendientes != null ? pendientes : BigDecimal.ZERO);

        List<Bono> listaBonos = bonoRepository.findPendientesPorPeriodo(periodo);
        
        List<BonoAprobacionDTO> filas = listaBonos.stream()
            .map(this::mapToBonoAprobacionDTO)
            .collect(Collectors.toList());
            
        data.setBonos(filas);

        return data;
    }

    @Override
    @Transactional
    public void aprobarBono(Integer idBono) {
        Bono bono = bonoRepository.findById(idBono)
            .orElseThrow(() -> new RuntimeException("Bono no encontrado"));
        bono.setEstado(EstadoBono.APROBADO);
        bonoRepository.save(bono);
        log.info("Bono #{} APROBADO por Admin. Monto: {}", idBono, bono.getMonto()); // LOG 5: Aprobación
    }

    @Override
    @Transactional
    public void rechazarBono(Integer idBono) {
        Bono bono = bonoRepository.findById(idBono)
            .orElseThrow(() -> new RuntimeException("Bono no encontrado"));
        bono.setEstado(EstadoBono.RECHAZADO);
        bonoRepository.save(bono);
        log.warn("Bono #{} RECHAZADO por Admin. Monto: {}", idBono, bono.getMonto()); // LOG 6: Rechazo
    }

    @Override
    @Transactional
    public void aprobarMasivo(List<Integer> idsBonos) {
        List<Bono> bonos = bonoRepository.findAllById(idsBonos);
        bonos.forEach(b -> b.setEstado(EstadoBono.APROBADO));
        bonoRepository.saveAll(bonos);
        log.info("Aprobación MASIVA exitosa. {} bonos procesados.", idsBonos.size()); // LOG 7: Aprobación masiva
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteIncentivosDTO generarReporteAnual(String anio) {
        log.debug("Iniciando generación de Reporte Anual para el año {}", anio); // LOG 8: Trazabilidad
        ReporteIncentivosDTO reporte = new ReporteIncentivosDTO();
        
        List<Bono> bonosAnio = bonoRepository.findByAnio(anio);

        List<String> meses = java.util.Arrays.asList("Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic");
        List<BigDecimal> dataVentas = new ArrayList<>();
        List<BigDecimal> dataAtencion = new ArrayList<>();

        for (int i = 0; i < 12; i++) {
            dataVentas.add(BigDecimal.ZERO);
            dataAtencion.add(BigDecimal.ZERO);
        }

        for (Bono b : bonosAnio) {
            int indiceMes = obtenerIndiceMes(b.getPeriodo());
            if (indiceMes >= 1 && indiceMes <= 12) {
                
                boolean esVenta = false;
                if (b.getRegla() != null && b.getRegla() instanceof ReglaVentas) {
                    esVenta = true;
                }
                
                if (esVenta) {
                    dataVentas.set(indiceMes - 1, dataVentas.get(indiceMes - 1).add(b.getMonto()));
                } else {
                    dataAtencion.set(indiceMes - 1, dataAtencion.get(indiceMes - 1).add(b.getMonto()));
                }
            }
        }

        reporte.setEtiquetasMeses(meses);
        reporte.setDataVentas(dataVentas);
        reporte.setDataAtencion(dataAtencion);

        Map<String, List<Bono>> bonosPorPeriodo = bonosAnio.stream()
            .collect(Collectors.groupingBy(Bono::getPeriodo));

        List<ReporteIncentivosDTO.FilaReporteDTO> filas = new ArrayList<>();

        bonosPorPeriodo.forEach((periodo, listaBonos) -> {
            ReporteIncentivosDTO.FilaReporteDTO fila = new ReporteIncentivosDTO.FilaReporteDTO();
            
            // Conversión de YYYY-MM a "Mes YYYY" para el Frontend
            fila.setPeriodo(
                (obtenerNombreMes(obtenerIndiceMes(periodo))) + " " + periodo.substring(0, 4)
            );
            fila.setConcepto("Nómina Incentivos");
            
            long numBeneficiarios = listaBonos.stream()
                .map(b -> b.getEmpleado().getIdEmpleado())
                .distinct()
                .count();
            fila.setNumBeneficiarios((int) numBeneficiarios);

            BigDecimal total = listaBonos.stream()
                .map(Bono::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            fila.setMontoTotal(total);

            boolean hayPendientes = listaBonos.stream()
                .anyMatch(b -> "PENDIENTE".equals(b.getEstado().toString()));
            fila.setEstadoPago(hayPendientes ? "Pendiente" : "Pagado");

            filas.add(fila);
        });

        // Ordenar del más reciente al más antiguo
        filas.sort((f1, f2) -> {
            String p1 = f1.getPeriodo().substring(f1.getPeriodo().length() - 4) + "-" + String.format("%02d", obtenerIndiceMes(f1.getPeriodo().substring(0, 3)));
            String p2 = f2.getPeriodo().substring(f2.getPeriodo().length() - 4) + "-" + String.format("%02d", obtenerIndiceMes(f2.getPeriodo().substring(0, 3)));
            return p2.compareTo(p1);
        });
        
        reporte.setTablaDetalle(filas);
        log.info("Reporte Anual para {} generado. Contiene {} períodos consolidados.", anio, filas.size()); // LOG 9: Trazabilidad de finalización
        return reporte;
    }

    // =========================================================================
    //                        MÉTODO PARA EL MODAL DE REPORTE
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public List<BonoDetalleNominaDTO> obtenerDetalleNominaPorPeriodo(String periodo) {
        List<Bono> bonos = bonoRepository.findByPeriodo(periodo);
        log.debug("Consulta de detalle de nómina para periodo {}: {} bonos encontrados.", periodo, bonos.size()); // LOG 10: Trazabilidad de detalle

        return bonos.stream()
            .map(this::mapToBonoDetalleNominaDTO)
            .collect(Collectors.toList());
    }

    // =========================================================================
    //                            MAPPERS / HELPERS
    // =========================================================================
    
    private BonoDetalleNominaDTO mapToBonoDetalleNominaDTO(Bono bono) {
        BonoDetalleNominaDTO dto = new BonoDetalleNominaDTO();
        dto.setIdBono(bono.getIdBono());
        dto.setMonto(bono.getMonto());
        dto.setEstado(bono.getEstado().toString());

        if (bono.getFechaCalculo() != null) {
            dto.setFechaCalculo(bono.getFechaCalculo().atStartOfDay()); 
        } else {
            dto.setFechaCalculo(null);
        }

        if (bono.getEmpleado() != null) {
            dto.setNombreEmpleado(bono.getEmpleado().getNombreCompleto());
            Puesto puesto = bono.getEmpleado().getPuesto();
            dto.setDepartamento(puesto != null ? puesto.getDepartamento() : "N/A");
        } else {
            dto.setNombreEmpleado("N/A");
            dto.setDepartamento("N/A");
        }

        if (bono.getRegla() != null) {
            dto.setConcepto(bono.getRegla().getNombreRegla());
        } else if (bono.getMeta() != null) {
            dto.setConcepto("Bono Meta: " + bono.getMeta().getNombreMeta());
        } else {
            dto.setConcepto("Bono Manual");
        }
        
        if (bono.getEvidencias() != null && !bono.getEvidencias().isEmpty()) {
            dto.setEvidenciaResumen(bono.getEvidencias().get(0).obtenerResumen());
        } else {
            dto.setEvidenciaResumen("Sin evidencia");
        }

        return dto;
    }

    private BonoResumenDTO mapToResumenDTO(Bono bono) {
        BonoResumenDTO dto = new BonoResumenDTO();
        dto.setIdBono(bono.getIdBono());
        
        if (bono.getRegla() != null) {
            dto.setConcepto(bono.getRegla().getNombreRegla());
        } else if (bono.getMeta() != null) {
            String nombreMeta = bono.getMeta().getNombreMeta();
            dto.setConcepto("Bono Meta: " + (nombreMeta != null ? nombreMeta : "General"));
        } else {
            dto.setConcepto("Bono Manual");
        }

        dto.setFecha(bono.getFechaCalculo() != null ? bono.getFechaCalculo().toString() : "N/A");
        dto.setEstado(bono.getEstado() != null ? bono.getEstado().toString() : "PENDIENTE");

        if (bono.getRegla() != null && "ESPECIE".equalsIgnoreCase(bono.getRegla().getTipoValor())) {
            dto.setTipo("ESPECIE");
            dto.setDescripcionPremio(bono.getRegla().getDescripcionRecompensa());
            dto.setMonto(BigDecimal.ZERO);
        } else {
            dto.setTipo("DINERO");
            dto.setMonto(bono.getMonto());
            dto.setDescripcionPremio(null);
        }
        
        if (bono.getEvidencias() != null && !bono.getEvidencias().isEmpty()) {
            dto.setEvidenciaNombre(bono.getEvidencias().get(0).obtenerResumen());
        } else {
            dto.setEvidenciaNombre("Ver Detalle");
        }
        
        return dto;
    }

    private ReglaAdminDTO mapToReglaAdminDTO(ReglaIncentivo entity) {
        ReglaAdminDTO dto = new ReglaAdminDTO();
        dto.setId(entity.getIdRegla());
        dto.setNombre(entity.getNombreRegla());
        dto.setCondicionLogica(entity.getCondicion());
        dto.setPeriodo(entity.getPeriodo());
        dto.setEstado(entity.getActivo());
        
        if (entity instanceof ReglaVentas) {
            dto.setCategoria("VENTAS");
        } else if (entity instanceof ReglaAtencion) { 
            dto.setCategoria("ATENCION");
        } else {
            dto.setCategoria("GENERAL");
        }

        if (entity.getDescripcionRecompensa() != null && !entity.getDescripcionRecompensa().isEmpty()) {
            dto.setRecompensa("🎁 " + entity.getDescripcionRecompensa());
        } else if ("PORCENTAJE".equals(entity.getTipoValor())) {
            dto.setRecompensa("$ " + entity.getValorCalculo() + "%");
        } else {
            dto.setRecompensa("S/ " + entity.getValorCalculo());
        }

        return dto;
    }

    private BonoAprobacionDTO mapToBonoAprobacionDTO(Bono bono) {
        BonoAprobacionDTO dto = new BonoAprobacionDTO();
        dto.setIdBono(bono.getIdBono());
        dto.setMonto(bono.getMonto());
        dto.setEstado(bono.getEstado().toString());

        dto.setAlertaMonto(bono.getMonto().compareTo(new BigDecimal("10000")) > 0);

        if (bono.getEmpleado() != null) {
            dto.setNombreEmpleado(bono.getEmpleado().getNombreCompleto());
            Puesto puesto = bono.getEmpleado().getPuesto();
            dto.setDepartamento(puesto != null ? puesto.getDepartamento() : "Sin Asignar");
        }

        if (bono.getRegla() != null) {
            dto.setConcepto(bono.getRegla().getNombreRegla());
            dto.setCodigoRef("Regla #" + bono.getRegla().getIdRegla());
        } else if (bono.getMeta() != null) {
            String nombreMeta = bono.getMeta().getNombreMeta();
            dto.setConcepto("Bono por Meta: " + (nombreMeta != null ? nombreMeta : "General"));
            dto.setCodigoRef("Meta #" + bono.getMeta().getIdMeta());
        } else {
            dto.setConcepto("Bono Manual");
            dto.setCodigoRef("N/A");
        }

        if (bono.getEvidencias() != null && !bono.getEvidencias().isEmpty()) {
            dto.setEvidencia(bono.getEvidencias().get(0).obtenerResumen());
        } else {
            dto.setEvidencia("Sin evidencia");
        }

        return dto;
    }

    /**
     * Extrae el mes de la cadena de período (espera YYYY-MM o Mes YYYY) y devuelve el índice (1-12).
     */
    private int obtenerIndiceMes(String periodo) {
        try {
            if (periodo.contains("-")) {
                // Formato YYYY-MM
                String[] parts = periodo.split("-");
                return Integer.parseInt(parts[1]); 
            }
            // Formato Mes YYYY
            String mesNombre = periodo.substring(0, 3);
             switch (mesNombre) {
                case "Ene": return 1;
                case "Feb": return 2;
                case "Mar": return 3;
                case "Abr": return 4;
                case "May": return 5;
                case "Jun": return 6;
                case "Jul": return 7;
                case "Ago": return 8;
                case "Sep": return 9;
                case "Oct": return 10;
                case "Nov": return 11;
                case "Dic": return 12;
                default: return 0;
            }
        } catch (Exception e) {
            return 0;
        }
    }
    
   
    private String obtenerNombreMes(int indice) {
        String[] nombres = {"Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"};
        if (indice >= 1 && indice <= 12) {
            return nombres[indice - 1];
        }
        return "N/A";
    }
}