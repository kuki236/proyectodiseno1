CREATE TABLE `cvs` (
   `id_cv` int NOT NULL AUTO_INCREMENT,
   `id_postulante` int DEFAULT NULL,
   `nombre_archivo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
   `ruta_archivo` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
   `tipo_archivo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
   `tamanio_archivo` bigint NOT NULL,
   `fecha_carga` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   `estado` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'PENDIENTE',
   `fuente` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `procesado_por` int DEFAULT NULL,
   `fecha_procesamiento` timestamp NULL DEFAULT NULL,
   `observaciones` text COLLATE utf8mb4_unicode_ci,
   PRIMARY KEY (`id_cv`),
   KEY `idx_postulante` (`id_postulante`),
   KEY `idx_estado` (`estado`),
   KEY `idx_fecha_carga` (`fecha_carga`),
   CONSTRAINT `cvs_ibfk_1` FOREIGN KEY (`id_postulante`) REFERENCES `postulantes` (`id_postulante`) ON DELETE SET NULL
 ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `postulantes` (
   `id_postulante` int NOT NULL AUTO_INCREMENT,
   `nombres` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `apellido_paterno` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `apellido_materno` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `telefono` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `fecha_nacimiento` date DEFAULT NULL,
   `genero` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `estado_civil` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `estado_postulacion` enum('ACTIVO','DESCARTADO','CONTRATADO') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVO',
   `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   `fecha_ultima_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY (`id_postulante`),
   UNIQUE KEY `email` (`email`),
   KEY `idx_email` (`email`),
   KEY `idx_estado` (`estado_postulacion`),
   KEY `idx_nombres` (`nombres`,`apellido_paterno`)
 ) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `postulantes_proceso` (
   `id_postulante_proceso` int NOT NULL AUTO_INCREMENT,
   `id_postulante` int NOT NULL,
   `id_proceso_actual` int NOT NULL,
   `etapa_actual` enum('REVISION_CV','ENTREVISTA','PRUEBA','OFERTA','CONTRATACION') COLLATE utf8mb4_unicode_ci DEFAULT 'REVISION_CV',
   `calificacion` decimal(5,2) DEFAULT NULL,
   `estado` enum('ACTIVO','DESCARTADO','CONTRATADO') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVO',
   `fecha_vinculacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   `fecha_ultima_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   `motivo_rechazo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   PRIMARY KEY (`id_postulante_proceso`),
   UNIQUE KEY `unique_postulante_proceso` (`id_postulante`,`id_proceso_actual`),
   UNIQUE KEY `UKsfbwlt0bt813n2da07dslkedc` (`id_postulante`,`id_proceso_actual`),
   KEY `idx_proceso` (`id_proceso_actual`),
   KEY `idx_etapa` (`etapa_actual`),
   KEY `idx_estado` (`estado`),
   KEY `idx_proceso_etapa` (`id_proceso_actual`,`etapa_actual`),
   CONSTRAINT `postulantes_proceso_ibfk_1` FOREIGN KEY (`id_postulante`) REFERENCES `postulantes` (`id_postulante`) ON DELETE CASCADE,
   CONSTRAINT `postulantes_proceso_ibfk_2` FOREIGN KEY (`id_proceso_actual`) REFERENCES `procesos_seleccion` (`id_proceso`) ON DELETE CASCADE
 ) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `postulantes_habilidades` (
   `id_postulante_habilidad` int NOT NULL AUTO_INCREMENT,
   `id_postulante` int NOT NULL,
   `id_habilidad` int NOT NULL,
   `nivel_dominio` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`id_postulante_habilidad`),
   UNIQUE KEY `unique_postulante_habilidad` (`id_postulante`,`id_habilidad`),
   KEY `idx_postulante` (`id_postulante`),
   KEY `idx_habilidad` (`id_habilidad`),
   CONSTRAINT `postulantes_habilidades_ibfk_1` FOREIGN KEY (`id_postulante`) REFERENCES `postulantes` (`id_postulante`) ON DELETE CASCADE,
   CONSTRAINT `postulantes_habilidades_ibfk_2` FOREIGN KEY (`id_habilidad`) REFERENCES `habilidades` (`id_habilidad`) ON DELETE CASCADE
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `habilidades` (
   `id_habilidad` int NOT NULL AUTO_INCREMENT,
   `nombre_habilidad` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
   `tipo_habilidad` enum('TECNICA','BLANDA') COLLATE utf8mb4_unicode_ci NOT NULL,
   `descripcion` text COLLATE utf8mb4_unicode_ci,
   `categoria` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `activo` tinyint(1) DEFAULT '1',
   PRIMARY KEY (`id_habilidad`),
   UNIQUE KEY `unique_nombre_tipo` (`nombre_habilidad`,`tipo_habilidad`),
   KEY `idx_tipo` (`tipo_habilidad`),
   KEY `idx_nombre` (`nombre_habilidad`)
 ) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `procesos_seleccion` (
   `id_proceso` int NOT NULL AUTO_INCREMENT,
   `id_vacante` int NOT NULL,
   `id_puesto` int DEFAULT NULL,
   `nombre_proceso` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `fecha_inicio` date DEFAULT NULL,
   `etapa_actual` enum('REVISION_CV','ENTREVISTA','PRUEBA','OFERTA','CONTRATACION') COLLATE utf8mb4_unicode_ci DEFAULT 'REVISION_CV',
   `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY (`id_proceso`),
   UNIQUE KEY `id_vacante` (`id_vacante`),
   KEY `idx_etapa` (`etapa_actual`),
   KEY `idx_vacante` (`id_vacante`),
   KEY `fk_proceso_puesto` (`id_puesto`),
   CONSTRAINT `fk_proceso_puesto` FOREIGN KEY (`id_puesto`) REFERENCES `puestos` (`id_puesto`),
   CONSTRAINT `procesos_seleccion_ibfk_1` FOREIGN KEY (`id_vacante`) REFERENCES `vacantes` (`id_vacante`) ON DELETE CASCADE
 ) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `puestos` (
   `id_puesto` int NOT NULL AUTO_INCREMENT,
   `nombre_puesto` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
   `departamento` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
   `area` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
   `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `nivel_jerarquico` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `salario_minimo` double DEFAULT NULL,
   `salario_maximo` double DEFAULT NULL,
   `activo` int DEFAULT NULL,
   `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`id_puesto`),
   UNIQUE KEY `unique_puesto_depto` (`nombre_puesto`,`departamento`),
   KEY `idx_departamento` (`departamento`),
   KEY `idx_nombre` (`nombre_puesto`)
 ) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `vacantes` (
   `id_vacante` int NOT NULL AUTO_INCREMENT,
   `id_reclutador` int NOT NULL,
   `nombre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `requisitos` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `modalidad` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `rango_salarial` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `estado` enum('ABIERTA','CERRADA','PAUSADA') COLLATE utf8mb4_unicode_ci DEFAULT 'PAUSADA',
   `fecha_publicacion` date DEFAULT NULL,
   `fecha_cierre` date DEFAULT NULL,
   `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `departamento` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `prioridad` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `tipo_contrato` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
   `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY (`id_vacante`),
   KEY `id_reclutador` (`id_reclutador`),
   KEY `idx_estado` (`estado`),
   KEY `idx_departamento` (`departamento`),
   KEY `idx_prioridad` (`prioridad`),
   KEY `idx_fecha_publicacion` (`fecha_publicacion`),
   KEY `idx_vacante_estado_fecha` (`estado`,`fecha_publicacion`),
   CONSTRAINT `vacantes_ibfk_1` FOREIGN KEY (`id_reclutador`) REFERENCES `reclutadores` (`id_reclutador`)
 ) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
