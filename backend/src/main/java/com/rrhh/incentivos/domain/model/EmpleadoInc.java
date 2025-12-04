package com.rrhh.incentivos.domain.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

import com.rrhh.shared.domain.model.Puesto;
import com.rrhh.shared.domain.model.Usuario;

@Data
@Entity
@Table(name = "empleados")
public class EmpleadoInc {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empleado")
    private Integer idEmpleado;

    @Column(name = "codigo_empleado", unique = true)
    private String codigoEmpleado;

    @Column(name = "nombres")
    private String nombres;

    @Column(name = "apellido_paterno")
    private String apellidoPaterno;
    
    @Column(name = "apellido_materno")
    private String apellidoMaterno;

    @Column(name = "documento_identidad")
    private String dni;

    @Column(name = "email_corporativo")
    private String emailCorporativo;
    
    @Column(name = "estado")
    private String estado; 

    @OneToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @OneToMany(mappedBy = "empleado", fetch = FetchType.EAGER)
    private List<EmpleadoPuestoInc> asignacionesPuesto;

    public Puesto getPuesto() {
        if (asignacionesPuesto == null || asignacionesPuesto.isEmpty()) {
            return null;
        }
        return asignacionesPuesto.stream()
                .filter(ep -> Boolean.TRUE.equals(ep.getActivo()))
                .map(EmpleadoPuestoInc::getPuesto)
                .findFirst()
                .orElse(null);
    }

    public String getNombreCompleto() {
        return nombres + " " + apellidoPaterno + (apellidoMaterno != null ? " " + apellidoMaterno : "");
    }
}