package com.rrhh.incentivos.domain.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "tipos_incentivos")
public class TipoIncentivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_incentivo")
    private Integer idTipoIncentivo;

    @Column(name = "nombre")
    private String nombre; 

 
}