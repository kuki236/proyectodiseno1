package com.rrhh.vacaciones.model;

import lombok.Data;
import lombok.AllArgsConstructor;

/**
 * Clase que representa un documento adjunto.
 * Nota: En el script SQL actual, esto se persiste en la columna
 * 'archivo_adjunto' de la tabla 'solicitudes'.
 */
@Data
@AllArgsConstructor
public class Documento {
    private Integer idDocumento;
    private String tipoDocumento;
    private String rutaArchivo;
    private String descripcion;
}