package com.rrhh.incentivos.domain.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Entity
@Table(name = "bonos")
public class Bono {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_bono")
    private Integer idBono;

    @ManyToOne
    @JoinColumn(name = "id_empleado", nullable = false)
    private EmpleadoInc empleado;

    @ManyToOne
    @JoinColumn(name = "id_regla")
    private ReglaIncentivo regla;

    @ManyToOne
    @JoinColumn(name = "id_meta")
    private Meta meta;

    @Column(name = "periodo")
    private String periodo;

    @Column(name = "monto")
    private BigDecimal monto;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    private EstadoBono estado;

    @Column(name = "fecha_calculo")
    private LocalDate fechaCalculo;

    @Column(name = "fecha_pago")
    private LocalDate fechaPago;

    @OneToMany(mappedBy = "bono", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Evidencia> evidencias;
}