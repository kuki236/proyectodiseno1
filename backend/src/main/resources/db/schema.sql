-- =====================================================
-- SISTEMA DE RECURSOS HUMANOS - SCRIPT SQL COMPLETO
-- Base de datos: MySQL 8.0+
-- =====================================================

-- Crear base de datos (si no existe)
-- En Railway, la base de datos "railway" ya existe, así que solo la usamos
-- Para desarrollo local, crea rrhh_db si no existe
CREATE DATABASE IF NOT EXISTS railway CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE railway;

-- =====================================================
-- 1. TABLAS DE USUARIOS Y AUTENTICACIÓN
-- =====================================================

-- Tabla de usuarios del sistema
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(200) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultimo_acceso TIMESTAMP NULL,
    intentos_fallidos INT DEFAULT 0,
    cuenta_bloqueada BOOLEAN DEFAULT FALSE,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de roles del sistema
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de permisos
CREATE TABLE permisos (
    id_permiso INT AUTO_INCREMENT PRIMARY KEY,
    nombre_permiso VARCHAR(100) UNIQUE NOT NULL,
    descripcion VARCHAR(255),
    modulo VARCHAR(50) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Relación usuarios-roles
CREATE TABLE usuarios_roles (
    id_usuario INT NOT NULL,
    id_rol INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario, id_rol),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE CASCADE,
    INDEX idx_usuario (id_usuario),
    INDEX idx_rol (id_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Relación roles-permisos
CREATE TABLE roles_permisos (
    id_rol INT NOT NULL,
    id_permiso INT NOT NULL,
    PRIMARY KEY (id_rol, id_permiso),
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE CASCADE,
    FOREIGN KEY (id_permiso) REFERENCES permisos(id_permiso) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. MÓDULO: RECEPCIÓN DE CVs
-- =====================================================

-- Tabla de CVs recibidos
CREATE TABLE cvs (
    id_cv INT AUTO_INCREMENT PRIMARY KEY,
    id_postulante INT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_archivo VARCHAR(50) NOT NULL,
    tamanio_archivo BIGINT NOT NULL,
    fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'PENDIENTE', -- PENDIENTE, PROCESADO, ERROR
    fuente VARCHAR(100), -- CARPETA_COMPARTIDA, EMAIL, PORTAL, OTRO
    procesado_por INT NULL,
    fecha_procesamiento TIMESTAMP NULL,
    observaciones TEXT,
    FOREIGN KEY (id_postulante) REFERENCES postulantes(id_postulante) ON DELETE SET NULL,
    INDEX idx_postulante (id_postulante),
    INDEX idx_estado (estado),
    INDEX idx_fecha_carga (fecha_carga)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de extracción de datos de CVs
CREATE TABLE cv_datos_extraidos (
    id_extraccion INT AUTO_INCREMENT PRIMARY KEY,
    id_cv INT NOT NULL,
    nombres VARCHAR(200),
    apellidos VARCHAR(200),
    email VARCHAR(100),
    telefono VARCHAR(20),
    direccion TEXT,
    fecha_nacimiento DATE,
    nivel_educacion VARCHAR(100),
    institucion VARCHAR(200),
    carrera VARCHAR(200),
    anio_graduacion INT,
    experiencia_anios INT,
    habilidades_extraidas TEXT, -- JSON o texto separado por comas
    datos_json TEXT, -- Datos completos en JSON
    confianza_extraccion DECIMAL(5,2) DEFAULT 0.00,
    fecha_extraccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cv) REFERENCES cvs(id_cv) ON DELETE CASCADE,
    INDEX idx_cv (id_cv),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. MÓDULO: RECLUTAMIENTO DE PERSONAL
-- =====================================================

-- Tabla de reclutadores
CREATE TABLE reclutadores (
    id_reclutador INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NULL,
    nombre VARCHAR(200) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    departamento VARCHAR(100),
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de postulantes/candidatos
CREATE TABLE postulantes (
    id_postulante INT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    telefono VARCHAR(20),
    direccion TEXT,
    email VARCHAR(100) UNIQUE NOT NULL,
    fecha_nacimiento DATE,
    genero VARCHAR(20),
    estado_civil VARCHAR(50),
    estado_postulacion ENUM('ACTIVO', 'DESCARTADO', 'CONTRATADO') DEFAULT 'ACTIVO',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_estado (estado_postulacion),
    INDEX idx_nombres (nombres, apellido_paterno)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de vacantes
CREATE TABLE vacantes (
    id_vacante INT AUTO_INCREMENT PRIMARY KEY,
    id_reclutador INT NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    requisitos TEXT NOT NULL,
    modalidad VARCHAR(50) NOT NULL, -- PRESENCIAL, REMOTO, HIBRIDO
    rango_salarial VARCHAR(100),
    estado ENUM('ABIERTA', 'CERRADA', 'PAUSADA') DEFAULT 'PAUSADA',
    fecha_publicacion DATE NULL,
    fecha_cierre DATE NULL,
    descripcion TEXT NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    prioridad VARCHAR(50) NOT NULL, -- ALTA, MEDIA, BAJA, CRITICA
    tipo_contrato VARCHAR(50) NOT NULL, -- PRACTICAS, POR_HORAS, JORNADA_COMPLETA, MEDIO_TIEMPO
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_reclutador) REFERENCES reclutadores(id_reclutador),
    INDEX idx_estado (estado),
    INDEX idx_departamento (departamento),
    INDEX idx_prioridad (prioridad),
    INDEX idx_fecha_publicacion (fecha_publicacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de procesos de selección
CREATE TABLE procesos_seleccion (
    id_proceso INT AUTO_INCREMENT PRIMARY KEY,
    id_vacante INT UNIQUE NOT NULL,
    nombre_proceso VARCHAR(200) NOT NULL,
    fecha_inicio DATE,
    etapa_actual ENUM('REVISION_CV', 'ENTREVISTA', 'PRUEBA', 'OFERTA', 'CONTRATACION') DEFAULT 'REVISION_CV',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_vacante) REFERENCES vacantes(id_vacante) ON DELETE CASCADE,
    INDEX idx_etapa (etapa_actual),
    INDEX idx_vacante (id_vacante)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de postulantes en proceso
CREATE TABLE postulantes_proceso (
    id_postulante_proceso INT AUTO_INCREMENT PRIMARY KEY,
    id_postulante INT NOT NULL,
    id_proceso_actual INT NOT NULL,
    etapa_actual ENUM('REVISION_CV', 'ENTREVISTA', 'PRUEBA', 'OFERTA', 'CONTRATACION') DEFAULT 'REVISION_CV',
    calificacion DECIMAL(5,2) NULL,
    estado ENUM('ACTIVO', 'DESCARTADO', 'CONTRATADO') DEFAULT 'ACTIVO',
    fecha_vinculacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    motivo_rechazo TEXT NULL,
    FOREIGN KEY (id_postulante) REFERENCES postulantes(id_postulante) ON DELETE CASCADE,
    FOREIGN KEY (id_proceso_actual) REFERENCES procesos_seleccion(id_proceso) ON DELETE CASCADE,
    UNIQUE KEY unique_postulante_proceso (id_postulante, id_proceso_actual),
    INDEX idx_proceso (id_proceso_actual),
    INDEX idx_etapa (etapa_actual),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de entrevistas
CREATE TABLE entrevistas (
    id_entrevista INT AUTO_INCREMENT PRIMARY KEY,
    id_candidato INT NOT NULL,
    id_proceso INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    lugar VARCHAR(255) NOT NULL,
    entrevistador VARCHAR(200) NOT NULL,
    estado VARCHAR(50) DEFAULT 'PENDIENTE', -- PENDIENTE, COMPLETADA, CANCELADA, REPROGRAMADA
    observaciones TEXT,
    calificacion DECIMAL(5,2) NULL,
    tipo_entrevista VARCHAR(50), -- TECNICA, COMPORTAMENTAL, FINAL
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_candidato) REFERENCES postulantes(id_postulante) ON DELETE CASCADE,
    FOREIGN KEY (id_proceso) REFERENCES procesos_seleccion(id_proceso) ON DELETE CASCADE,
    INDEX idx_candidato (id_candidato),
    INDEX idx_proceso (id_proceso),
    INDEX idx_fecha (fecha),
    INDEX idx_estado (estado),
    INDEX idx_entrevistador (entrevistador)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de evaluaciones
CREATE TABLE evaluaciones (
    id_evaluacion INT AUTO_INCREMENT PRIMARY KEY,
    id_proceso INT NOT NULL,
    id_candidato INT NOT NULL,
    fecha DATE NOT NULL,
    puntuacion DECIMAL(5,2) NOT NULL,
    comentarios TEXT,
    estado VARCHAR(50) DEFAULT 'PENDIENTE', -- PENDIENTE, COMPLETADA
    tipo_evaluacion VARCHAR(50) NOT NULL, -- TECNICA, PSICOLOGICA, COMPORTAMENTAL
    evaluador VARCHAR(200),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_proceso) REFERENCES procesos_seleccion(id_proceso) ON DELETE CASCADE,
    FOREIGN KEY (id_candidato) REFERENCES postulantes(id_postulante) ON DELETE CASCADE,
    INDEX idx_proceso (id_proceso),
    INDEX idx_candidato (id_candidato),
    INDEX idx_tipo (tipo_evaluacion),
    INDEX idx_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de ofertas laborales
CREATE TABLE ofertas (
    id_oferta INT AUTO_INCREMENT PRIMARY KEY,
    id_vacante INT NOT NULL,
    id_candidato INT NOT NULL,
    salario_ofrecido DECIMAL(10,2) NOT NULL,
    condiciones TEXT NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_respuesta DATE NULL,
    estado_oferta ENUM('PENDIENTE', 'ACEPTADA', 'RECHAZADA', 'CANCELADA') DEFAULT 'PENDIENTE',
    motivo_rechazo TEXT NULL,
    fecha_inicio_propuesta DATE,
    beneficios TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_vacante) REFERENCES vacantes(id_vacante) ON DELETE CASCADE,
    FOREIGN KEY (id_candidato) REFERENCES postulantes(id_postulante) ON DELETE CASCADE,
    INDEX idx_vacante (id_vacante),
    INDEX idx_candidato (id_candidato),
    INDEX idx_estado (estado_oferta),
    INDEX idx_fecha_emision (fecha_emision)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de habilidades (abstracta)
CREATE TABLE habilidades (
    id_habilidad INT AUTO_INCREMENT PRIMARY KEY,
    nombre_habilidad VARCHAR(200) NOT NULL,
    tipo_habilidad ENUM('TECNICA', 'BLANDA') NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE KEY unique_nombre_tipo (nombre_habilidad, tipo_habilidad),
    INDEX idx_tipo (tipo_habilidad),
    INDEX idx_nombre (nombre_habilidad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de habilidades técnicas (extiende habilidades)
CREATE TABLE habilidades_tecnicas (
    id_habilidad INT PRIMARY KEY,
    tecnologia VARCHAR(100),
    nivel_dominio VARCHAR(50),
    certificacion VARCHAR(200),
    FOREIGN KEY (id_habilidad) REFERENCES habilidades(id_habilidad) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de habilidades blandas (extiende habilidades)
CREATE TABLE habilidades_blandas (
    id_habilidad INT PRIMARY KEY,
    tipo_interaccion VARCHAR(100),
    descripcion_habilidad TEXT,
    FOREIGN KEY (id_habilidad) REFERENCES habilidades(id_habilidad) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de habilidades de postulantes
CREATE TABLE postulantes_habilidades (
    id_postulante_habilidad INT AUTO_INCREMENT PRIMARY KEY,
    id_postulante INT NOT NULL,
    id_habilidad INT NOT NULL,
    nivel_dominio VARCHAR(50),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_postulante) REFERENCES postulantes(id_postulante) ON DELETE CASCADE,
    FOREIGN KEY (id_habilidad) REFERENCES habilidades(id_habilidad) ON DELETE CASCADE,
    UNIQUE KEY unique_postulante_habilidad (id_postulante, id_habilidad),
    INDEX idx_postulante (id_postulante),
    INDEX idx_habilidad (id_habilidad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de experiencias laborales
CREATE TABLE experiencias (
    id_experiencia INT AUTO_INCREMENT PRIMARY KEY,
    id_postulante INT NOT NULL,
    empresa VARCHAR(200) NOT NULL,
    cargo VARCHAR(200) NOT NULL,
    funciones_principales TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE DEFAULT NULL,
    referencia_contacto VARCHAR(200) DEFAULT NULL,
    telefono_referencia VARCHAR(20) DEFAULT NULL,
    fecha_creacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_postulante) REFERENCES postulantes(id_postulante) ON DELETE CASCADE,
    INDEX idx_postulante (id_postulante),
    INDEX idx_empresa (empresa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de formación académica
CREATE TABLE formacion_academica (
    id_formacion INT NOT NULL AUTO_INCREMENT,
    id_postulante INT NOT NULL,
    nivel_estudios VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
    situacion VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
    carrera VARCHAR(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    institucion VARCHAR(200) COLLATE utf8mb4_unicode_ci NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE DEFAULT NULL,
    cursos_relevantes TEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    observaciones TEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    fecha_creacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_formacion),
    KEY idx_formacion_postulante (id_postulante),
    CONSTRAINT fk_formacion_postulante FOREIGN KEY (id_postulante)
        REFERENCES postulantes (id_postulante) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de certificaciones
CREATE TABLE certificaciones (
    id_certificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_postulante INT NULL,
    id_empleado INT NULL,
    nombre_certificacion VARCHAR(200) NOT NULL,
    institucion_emisora VARCHAR(200),
    fecha_emision DATE,
    fecha_vencimiento DATE NULL,
    numero_certificado VARCHAR(100),
    url_verificacion VARCHAR(500),
    archivo_adjunto VARCHAR(500),
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_postulante) REFERENCES postulantes(id_postulante) ON DELETE CASCADE,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    INDEX idx_postulante (id_postulante),
    INDEX idx_empleado (id_empleado),
    INDEX idx_nombre (nombre_certificacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. MÓDULO: GESTIÓN DE EMPLEADOS
-- =====================================================

-- Tabla de empleados
CREATE TABLE empleados (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NULL,
    id_postulante INT NULL, -- Si fue contratado desde postulante
    codigo_empleado VARCHAR(50) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    documento_identidad VARCHAR(20) UNIQUE NOT NULL,
    tipo_documento VARCHAR(20) DEFAULT 'DNI',
    fecha_nacimiento DATE,
    genero VARCHAR(20),
    estado_civil VARCHAR(50),
    nacionalidad VARCHAR(50) DEFAULT 'Peruana',
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL,
    email_corporativo VARCHAR(100) UNIQUE,
    fecha_ingreso DATE NOT NULL,
    fecha_cese DATE NULL,
    estado ENUM('ACTIVO', 'INACTIVO', 'LICENCIA', 'SUSPENDIDO') DEFAULT 'ACTIVO',
    tipo_contrato VARCHAR(50) NOT NULL,
    modalidad_trabajo VARCHAR(50) NOT NULL, -- PRESENCIAL, REMOTO, HIBRIDO
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    FOREIGN KEY (id_postulante) REFERENCES postulantes(id_postulante) ON DELETE SET NULL,
    INDEX idx_codigo (codigo_empleado),
    INDEX idx_documento (documento_identidad),
    INDEX idx_email (email),
    INDEX idx_estado (estado),
    INDEX idx_fecha_ingreso (fecha_ingreso)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de puestos de trabajo
CREATE TABLE puestos (
    id_puesto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_puesto VARCHAR(200) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    area VARCHAR(100),
    descripcion TEXT,
    nivel_jerarquico VARCHAR(50), -- JUNIOR, SEMI_SENIOR, SENIOR, LIDER, GERENTE
    salario_minimo DECIMAL(10,2),
    salario_maximo DECIMAL(10,2),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_puesto_depto (nombre_puesto, departamento),
    INDEX idx_departamento (departamento),
    INDEX idx_nombre (nombre_puesto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de asignación de puestos a empleados
CREATE TABLE empleados_puestos (
    id_empleado_puesto INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    id_puesto INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NULL,
    salario DECIMAL(10,2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    motivo_cambio TEXT,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    FOREIGN KEY (id_puesto) REFERENCES puestos(id_puesto),
    INDEX idx_empleado (id_empleado),
    INDEX idx_puesto (id_puesto),
    INDEX idx_fecha_inicio (fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de documentos laborales
CREATE TABLE documentos_laborales (
    id_documento INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    tipo_documento VARCHAR(100) NOT NULL, -- CONTRATO, CV, DNI, CERTIFICADO_MEDICO, etc.
    nombre_documento VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    fecha_emision DATE,
    fecha_vencimiento DATE NULL,
    estado VARCHAR(50) DEFAULT 'VIGENTE', -- VIGENTE, VENCIDO, RENOVADO
    observaciones TEXT,
    subido_por INT NULL,
    fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    FOREIGN KEY (subido_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    INDEX idx_empleado (id_empleado),
    INDEX idx_tipo (tipo_documento),
    INDEX idx_estado (estado),
    INDEX idx_fecha_vencimiento (fecha_vencimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de información de contacto de emergencia
CREATE TABLE contactos_emergencia (
    id_contacto INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    nombre_completo VARCHAR(200) NOT NULL,
    parentesco VARCHAR(50) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    telefono_alternativo VARCHAR(20),
    direccion TEXT,
    es_contacto_principal BOOLEAN DEFAULT FALSE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    INDEX idx_empleado (id_empleado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de información bancaria
CREATE TABLE informacion_bancaria (
    id_info_bancaria INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    banco VARCHAR(100) NOT NULL,
    tipo_cuenta VARCHAR(50) NOT NULL, -- AHORROS, CORRIENTE
    numero_cuenta VARCHAR(50) NOT NULL,
    cci VARCHAR(50),
    moneda VARCHAR(10) DEFAULT 'PEN',
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    UNIQUE KEY unique_empleado_activo (id_empleado, activo),
    INDEX idx_empleado (id_empleado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de historial de cambios de empleado
CREATE TABLE historial_empleados (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    tipo_cambio VARCHAR(100) NOT NULL, -- PUESTO, SALARIO, DEPARTAMENTO, ESTADO, etc.
    valor_anterior TEXT,
    valor_nuevo TEXT,
    motivo TEXT,
    realizado_por INT NULL,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    FOREIGN KEY (realizado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    INDEX idx_empleado (id_empleado),
    INDEX idx_tipo (tipo_cambio),
    INDEX idx_fecha (fecha_cambio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. MÓDULO: CONTROL DE ASISTENCIA
-- =====================================================

-- Tabla de horarios de trabajo
CREATE TABLE horarios (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_horario VARCHAR(100) NOT NULL,
    departamento VARCHAR(100),
    hora_entrada TIME NOT NULL,
    hora_salida TIME NOT NULL,
    dias_semana VARCHAR(20) NOT NULL, -- LUNES-VIERNES, LUNES-SABADO, etc.
    tolerancia_entrada INT DEFAULT 15, -- minutos
    horas_jornada DECIMAL(4,2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_departamento (departamento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de asignación de horarios a empleados
CREATE TABLE empleados_horarios (
    id_empleado_horario INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    id_horario INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    FOREIGN KEY (id_horario) REFERENCES horarios(id_horario),
    INDEX idx_empleado (id_empleado),
    INDEX idx_horario (id_horario),
    INDEX idx_fecha_inicio (fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de registros de asistencia
CREATE TABLE registros_asistencia (
    id_registro INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    fecha DATE NOT NULL,
    hora_entrada TIME NULL,
    hora_salida TIME NULL,
    tipo_registro VARCHAR(50) DEFAULT 'NORMAL', -- NORMAL, TARDANZA, FALTA, HORAS_EXTRA
    estado VARCHAR(50) DEFAULT 'PENDIENTE', -- PENDIENTE, VALIDADO, CORREGIDO
    minutos_tardanza INT DEFAULT 0,
    minutos_extra INT DEFAULT 0,
    observaciones TEXT,
    registrado_por INT NULL, -- Usuario que registró (si es manual)
    metodo_registro VARCHAR(50) DEFAULT 'AUTOMATICO', -- AUTOMATICO, MANUAL, BIOMETRICO
    ip_registro VARCHAR(50),
    dispositivo VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    FOREIGN KEY (registrado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    UNIQUE KEY unique_empleado_fecha (id_empleado, fecha),
    INDEX idx_empleado (id_empleado),
    INDEX idx_fecha (fecha),
    INDEX idx_estado (estado),
    INDEX idx_tipo (tipo_registro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de ausencias
CREATE TABLE ausencias (
    id_ausencia INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    fecha DATE NOT NULL,
    tipo_ausencia VARCHAR(50) NOT NULL, -- FALTA, PERMISO, VACACION, LICENCIA_MEDICA, etc.
    justificada BOOLEAN DEFAULT FALSE,
    motivo TEXT,
    archivo_justificacion VARCHAR(500),
    aprobada_por INT NULL,
    fecha_aprobacion TIMESTAMP NULL,
    estado VARCHAR(50) DEFAULT 'PENDIENTE', -- PENDIENTE, APROBADA, RECHAZADA
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    FOREIGN KEY (aprobada_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    INDEX idx_empleado (id_empleado),
    INDEX idx_fecha (fecha),
    INDEX idx_tipo (tipo_ausencia),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de horas extras
CREATE TABLE horas_extras (
    id_hora_extra INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    horas_trabajadas DECIMAL(4,2) NOT NULL,
    tipo_hora_extra VARCHAR(50) DEFAULT 'NORMAL', -- NORMAL, NOCTURNA, FERIADO
    motivo TEXT,
    aprobada_por INT NULL,
    fecha_aprobacion TIMESTAMP NULL,
    estado VARCHAR(50) DEFAULT 'PENDIENTE', -- PENDIENTE, APROBADA, RECHAZADA, PAGADA
    pago_calculado DECIMAL(10,2) NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    FOREIGN KEY (aprobada_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    INDEX idx_empleado (id_empleado),
    INDEX idx_fecha (fecha),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de correcciones de asistencia
CREATE TABLE correcciones_asistencia (
    id_correccion INT AUTO_INCREMENT PRIMARY KEY,
    id_registro INT NULL,
    id_empleado INT NOT NULL,
    fecha DATE NOT NULL,
    tipo_correccion VARCHAR(50) NOT NULL, -- ENTRADA, SALIDA, AMBAS
    hora_anterior TIME,
    hora_corregida TIME NOT NULL,
    motivo TEXT NOT NULL,
    corregida_por INT NOT NULL,
    aprobada_por INT NULL,
    fecha_aprobacion TIMESTAMP NULL,
    estado VARCHAR(50) DEFAULT 'PENDIENTE', -- PENDIENTE, APROBADA, RECHAZADA
    fecha_correccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_registro) REFERENCES registros_asistencia(id_registro) ON DELETE SET NULL,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    FOREIGN KEY (corregida_por) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (aprobada_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    INDEX idx_empleado (id_empleado),
    INDEX idx_fecha (fecha),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de reportes de asistencia
CREATE TABLE reportes_asistencia (
    id_reporte INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NULL, -- NULL si es reporte general
    periodo_inicio DATE NOT NULL,
    periodo_fin DATE NOT NULL,
    tipo_reporte VARCHAR(50) NOT NULL, -- MENSUAL, QUINCENAL, SEMANAL, PERSONAL
    total_dias_trabajados INT DEFAULT 0,
    total_horas_trabajadas DECIMAL(6,2) DEFAULT 0,
    total_tardanzas INT DEFAULT 0,
    total_faltas INT DEFAULT 0,
    total_horas_extra DECIMAL(6,2) DEFAULT 0,
    generado_por INT NULL,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE SET NULL,
    FOREIGN KEY (generado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    INDEX idx_empleado (id_empleado),
    INDEX idx_periodo (periodo_inicio, periodo_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. MÓDULO: GESTIÓN DE VACACIONES Y PERMISOS
-- =====================================================

-- Tabla de tipos de solicitud
CREATE TABLE tipos_solicitud (
    id_tipo_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    requiere_aprobacion BOOLEAN DEFAULT TRUE,
    dias_maximos INT NULL,
    requiere_justificacion BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_nombre (nombre),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de solicitudes (vacaciones, permisos, licencias)
CREATE TABLE solicitudes (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    id_tipo_solicitud INT NOT NULL,
    fecha_solicitud DATE NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dias_solicitados INT NOT NULL,
    motivo TEXT,
    estado ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA') DEFAULT 'PENDIENTE',
    aprobada_por INT NULL,
    fecha_aprobacion TIMESTAMP NULL,
    motivo_rechazo TEXT NULL,
    archivo_adjunto VARCHAR(500),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    FOREIGN KEY (id_tipo_solicitud) REFERENCES tipos_solicitud(id_tipo_solicitud),
    FOREIGN KEY (aprobada_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    INDEX idx_empleado (id_empleado),
    INDEX idx_tipo (id_tipo_solicitud),
    INDEX idx_estado (estado),
    INDEX idx_fecha_solicitud (fecha_solicitud),
    INDEX idx_fecha_inicio (fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de saldo de vacaciones
CREATE TABLE saldos_vacaciones (
    id_saldo INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    anio INT NOT NULL,
    dias_asignados INT NOT NULL DEFAULT 30,
    dias_tomados INT DEFAULT 0,
    dias_pendientes INT GENERATED ALWAYS AS (dias_asignados - dias_tomados) STORED,
    dias_vencidos INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    UNIQUE KEY unique_empleado_anio (id_empleado, anio),
    INDEX idx_empleado (id_empleado),
    INDEX idx_anio (anio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de historial de vacaciones
CREATE TABLE historial_vacaciones (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    id_solicitud INT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dias_tomados INT NOT NULL,
    anio INT NOT NULL,
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    FOREIGN KEY (id_solicitud) REFERENCES solicitudes(id_solicitud) ON DELETE SET NULL,
    INDEX idx_empleado (id_empleado),
    INDEX idx_anio (anio),
    INDEX idx_fecha_inicio (fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de políticas de vacaciones
CREATE TABLE politicas_vacaciones (
    id_politica INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    dias_por_anio INT NOT NULL DEFAULT 30,
    dias_minimos_continuos INT DEFAULT 5,
    dias_maximos_continuos INT DEFAULT 15,
    antiguedad_minima_meses INT DEFAULT 12,
    permite_acumulacion BOOLEAN DEFAULT TRUE,
    anios_acumulacion_max INT DEFAULT 2,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. MÓDULO: INCENTIVOS Y RECONOCIMIENTOS
-- =====================================================

-- Tabla de tipos de incentivos
CREATE TABLE tipos_incentivos (
    id_tipo_incentivo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo_calculo VARCHAR(50) NOT NULL, -- FIJO, PORCENTAJE, VARIABLE
    categoria VARCHAR(50), -- BONO, COMISION, PREMIO, RECONOCIMIENTO
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_nombre (nombre),
    INDEX idx_activo (activo),
    INDEX idx_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de reglas de incentivos
CREATE TABLE reglas_incentivos (
    id_regla INT AUTO_INCREMENT PRIMARY KEY,
    id_tipo_incentivo INT NOT NULL,
    nombre_regla VARCHAR(200) NOT NULL,
    descripcion TEXT,
    condicion TEXT NOT NULL, -- JSON o expresión lógica
    valor_calculo DECIMAL(10,2) NOT NULL,
    tipo_valor VARCHAR(50), -- MONTO_FIJO, PORCENTAJE_SALARIO, PORCENTAJE_META
    periodo_aplicacion VARCHAR(50) DEFAULT 'MENSUAL', -- MENSUAL, TRIMESTRAL, ANUAL
    activo BOOLEAN DEFAULT TRUE,
    fecha_inicio DATE,
    fecha_fin DATE NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tipo_incentivo) REFERENCES tipos_incentivos(id_tipo_incentivo),
    INDEX idx_tipo (id_tipo_incentivo),
    INDEX idx_activo (activo),
    INDEX idx_periodo (periodo_aplicacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de metas
CREATE TABLE metas (
    id_meta INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NULL, -- NULL si es meta de departamento
    id_departamento VARCHAR(100) NULL,
    nombre_meta VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo_meta VARCHAR(50) NOT NULL, -- VENTAS, PRODUCTIVIDAD, CALIDAD, ASISTENCIA
    valor_objetivo DECIMAL(10,2) NOT NULL,
    valor_actual DECIMAL(10,2) DEFAULT 0,
    unidad_medida VARCHAR(50), -- UNIDADES, PORCENTAJE, MONTO
    periodo VARCHAR(50) DEFAULT 'MENSUAL', -- MENSUAL, TRIMESTRAL, ANUAL
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(50) DEFAULT 'ACTIVA', -- ACTIVA, CUMPLIDA, NO_CUMPLIDA, CANCELADA
    incentivo_asociado DECIMAL(10,2) NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    INDEX idx_empleado (id_empleado),
    INDEX idx_departamento (id_departamento),
    INDEX idx_estado (estado),
    INDEX idx_periodo (periodo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de incentivos asignados
CREATE TABLE incentivos (
    id_incentivo INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    id_tipo_incentivo INT NOT NULL,
    id_regla INT NULL,
    id_meta INT NULL,
    periodo VARCHAR(50) NOT NULL, -- 2024-01, 2024-Q1, 2024
    monto DECIMAL(10,2) NOT NULL,
    motivo TEXT,
    estado VARCHAR(50) DEFAULT 'PENDIENTE', -- PENDIENTE, APROBADO, PAGADO, CANCELADO
    fecha_calculo DATE NOT NULL,
    fecha_pago DATE NULL,
    aprobado_por INT NULL,
    fecha_aprobacion TIMESTAMP NULL,
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    FOREIGN KEY (id_tipo_incentivo) REFERENCES tipos_incentivos(id_tipo_incentivo),
    FOREIGN KEY (id_regla) REFERENCES reglas_incentivos(id_regla) ON DELETE SET NULL,
    FOREIGN KEY (id_meta) REFERENCES metas(id_meta) ON DELETE SET NULL,
    FOREIGN KEY (aprobado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    INDEX idx_empleado (id_empleado),
    INDEX idx_periodo (periodo),
    INDEX idx_estado (estado),
    INDEX idx_fecha_calculo (fecha_calculo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de reconocimientos
CREATE TABLE reconocimientos (
    id_reconocimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    tipo_reconocimiento VARCHAR(100) NOT NULL, -- EMPLEADO_MES, LOGRO, ANIVERSARIO, etc.
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_reconocimiento DATE NOT NULL,
    otorgado_por INT NOT NULL,
    valor_monetario DECIMAL(10,2) NULL,
    puntos INT DEFAULT 0,
    visible_publico BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    FOREIGN KEY (otorgado_por) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
    INDEX idx_empleado (id_empleado),
    INDEX idx_tipo (tipo_reconocimiento),
    INDEX idx_fecha (fecha_reconocimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de logros y badges
CREATE TABLE logros (
    id_logro INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    nombre_logro VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100), -- VENTAS, ASISTENCIA, CALIDAD, INNOVACION
    fecha_logro DATE NOT NULL,
    puntos INT DEFAULT 0,
    icono VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    INDEX idx_empleado (id_empleado),
    INDEX idx_categoria (categoria),
    INDEX idx_fecha (fecha_logro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de acumulación de puntos
CREATE TABLE puntos_empleados (
    id_puntos INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    puntos_totales INT DEFAULT 0,
    puntos_disponibles INT DEFAULT 0,
    puntos_canjeados INT DEFAULT 0,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    UNIQUE KEY unique_empleado (id_empleado),
    INDEX idx_puntos (puntos_totales)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de historial de puntos
CREATE TABLE historial_puntos (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    puntos INT NOT NULL,
    tipo_movimiento VARCHAR(50) NOT NULL, -- GANADO, CANJEADO, EXPIRADO
    origen VARCHAR(100), -- LOGRO, RECONOCIMIENTO, META, etc.
    id_origen INT NULL, -- ID del registro origen
    descripcion TEXT,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    INDEX idx_empleado (id_empleado),
    INDEX idx_tipo (tipo_movimiento),
    INDEX idx_fecha (fecha_movimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. TABLAS DE CONFIGURACIÓN Y AUDITORÍA
-- =====================================================

-- Tabla de configuración del sistema
CREATE TABLE configuraciones (
    id_configuracion INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    tipo VARCHAR(50) DEFAULT 'STRING', -- STRING, NUMBER, BOOLEAN, JSON
    modulo VARCHAR(50),
    descripcion TEXT,
    editable BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clave (clave),
    INDEX idx_modulo (modulo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de auditoría
CREATE TABLE auditoria (
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NULL,
    modulo VARCHAR(50) NOT NULL,
    accion VARCHAR(100) NOT NULL,
    entidad VARCHAR(100),
    id_entidad INT NULL,
    datos_anteriores TEXT,
    datos_nuevos TEXT,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    INDEX idx_usuario (id_usuario),
    INDEX idx_modulo (modulo),
    INDEX idx_accion (accion),
    INDEX idx_fecha (fecha_accion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de notificaciones
CREATE TABLE notificaciones (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_empleado INT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- INFO, WARNING, SUCCESS, ERROR
    modulo VARCHAR(50),
    leida BOOLEAN DEFAULT FALSE,
    fecha_lectura TIMESTAMP NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE SET NULL,
    INDEX idx_usuario (id_usuario),
    INDEX idx_leida (leida),
    INDEX idx_fecha (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. VISTAS ÚTILES
-- =====================================================

-- Vista de empleados activos con información completa
CREATE OR REPLACE VIEW v_empleados_activos AS
SELECT 
    e.id_empleado,
    e.codigo_empleado,
    e.nombres,
    e.apellido_paterno,
    e.apellido_materno,
    CONCAT(e.nombres, ' ', e.apellido_paterno, ' ', IFNULL(e.apellido_materno, '')) AS nombre_completo,
    e.email,
    e.telefono,
    e.fecha_ingreso,
    e.estado,
    p.nombre_puesto,
    p.departamento,
    ep.salario,
    h.nombre_horario,
    h.hora_entrada,
    h.hora_salida
FROM empleados e
LEFT JOIN empleados_puestos ep ON e.id_empleado = ep.id_empleado AND ep.activo = TRUE
LEFT JOIN puestos p ON ep.id_puesto = p.id_puesto
LEFT JOIN empleados_horarios eh ON e.id_empleado = eh.id_empleado AND eh.activo = TRUE
LEFT JOIN horarios h ON eh.id_horario = h.id_horario
WHERE e.estado = 'ACTIVO';

-- Vista de candidatos en proceso
CREATE OR REPLACE VIEW v_candidatos_proceso AS
SELECT 
    pp.id_postulante_proceso,
    p.id_postulante,
    CONCAT(p.nombres, ' ', p.apellido_paterno, ' ', IFNULL(p.apellido_materno, '')) AS nombre_completo,
    p.email,
    p.telefono,
    v.id_vacante,
    v.nombre AS nombre_vacante,
    v.departamento,
    ps.etapa_actual,
    pp.calificacion,
    pp.estado,
    pp.fecha_vinculacion
FROM postulantes_proceso pp
INNER JOIN postulantes p ON pp.id_postulante = p.id_postulante
INNER JOIN procesos_seleccion ps ON pp.id_proceso_actual = ps.id_proceso
INNER JOIN vacantes v ON ps.id_vacante = v.id_vacante
WHERE pp.estado = 'ACTIVO';

-- Vista de estadísticas de vacantes
CREATE OR REPLACE VIEW v_estadisticas_vacantes AS
SELECT 
    v.id_vacante,
    v.nombre,
    v.departamento,
    v.estado,
    COUNT(DISTINCT pp.id_postulante_proceso) AS total_candidatos,
    COUNT(DISTINCT CASE WHEN pp.etapa_actual = 'OFERTA' OR pp.etapa_actual = 'CONTRATACION' THEN pp.id_postulante_proceso END) AS candidatos_seleccionados,
    COUNT(DISTINCT e.id_entrevista) AS total_entrevistas,
    COUNT(DISTINCT CASE WHEN e.estado = 'PENDIENTE' THEN e.id_entrevista END) AS entrevistas_pendientes,
    COUNT(DISTINCT o.id_oferta) AS total_ofertas,
    COUNT(DISTINCT CASE WHEN o.estado_oferta = 'ACEPTADA' THEN o.id_oferta END) AS ofertas_aceptadas
FROM vacantes v
LEFT JOIN procesos_seleccion ps ON v.id_vacante = ps.id_vacante
LEFT JOIN postulantes_proceso pp ON ps.id_proceso = pp.id_proceso_actual
LEFT JOIN entrevistas e ON ps.id_proceso = e.id_proceso
LEFT JOIN ofertas o ON v.id_vacante = o.id_vacante
GROUP BY v.id_vacante, v.nombre, v.departamento, v.estado;

-- =====================================================
-- 10. DATOS INICIALES
-- =====================================================

-- Insertar roles del sistema
INSERT INTO roles (nombre_rol, descripcion) VALUES
('ADMINISTRADOR', 'Administrador del sistema con acceso completo'),
('RECLUTADOR', 'Gestiona vacantes y procesos de selección'),
('EMPLEADO', 'Empleado con acceso a sus propios datos'),
('SUPERVISOR', 'Supervisor con permisos de revisión y aprobación');

-- Insertar permisos básicos
INSERT INTO permisos (nombre_permiso, descripcion, modulo) VALUES
-- Permisos de Reclutamiento
('RECLUTAMIENTO_CREAR_VACANTE', 'Crear nuevas vacantes', 'RECLUTAMIENTO'),
('RECLUTAMIENTO_EDITAR_VACANTE', 'Editar vacantes existentes', 'RECLUTAMIENTO'),
('RECLUTAMIENTO_ELIMINAR_VACANTE', 'Eliminar vacantes', 'RECLUTAMIENTO'),
('RECLUTAMIENTO_PUBLICAR_VACANTE', 'Publicar vacantes', 'RECLUTAMIENTO'),
('RECLUTAMIENTO_GESTIONAR_CANDIDATOS', 'Gestionar candidatos', 'RECLUTAMIENTO'),
('RECLUTAMIENTO_PROGRAMAR_ENTREVISTA', 'Programar entrevistas', 'RECLUTAMIENTO'),
('RECLUTAMIENTO_EVALUAR_CANDIDATO', 'Evaluar candidatos', 'RECLUTAMIENTO'),
('RECLUTAMIENTO_EMITIR_OFERTA', 'Emitir ofertas laborales', 'RECLUTAMIENTO'),

-- Permisos de Empleados
('EMPLEADOS_CREAR', 'Crear nuevos empleados', 'EMPLEADOS'),
('EMPLEADOS_EDITAR', 'Editar información de empleados', 'EMPLEADOS'),
('EMPLEADOS_ELIMINAR', 'Eliminar empleados', 'EMPLEADOS'),
('EMPLEADOS_VER_TODOS', 'Ver todos los empleados', 'EMPLEADOS'),
('EMPLEADOS_GESTIONAR_DOCUMENTOS', 'Gestionar documentos laborales', 'EMPLEADOS'),
('EMPLEADOS_ASIGNAR_PUESTO', 'Asignar puestos a empleados', 'EMPLEADOS'),

-- Permisos de Asistencia
('ASISTENCIA_REGISTRAR', 'Registrar asistencia', 'ASISTENCIA'),
('ASISTENCIA_CORREGIR', 'Corregir registros de asistencia', 'ASISTENCIA'),
('ASISTENCIA_VER_REPORTES', 'Ver reportes de asistencia', 'ASISTENCIA'),
('ASISTENCIA_GENERAR_REPORTES', 'Generar reportes de asistencia', 'ASISTENCIA'),
('ASISTENCIA_APROBAR_HORAS_EXTRA', 'Aprobar horas extras', 'ASISTENCIA'),

-- Permisos de Vacaciones y Permisos
('VACACIONES_SOLICITAR', 'Solicitar vacaciones', 'VACACIONES'),
('VACACIONES_APROBAR', 'Aprobar solicitudes de vacaciones', 'VACACIONES'),
('VACACIONES_VER_TODAS', 'Ver todas las solicitudes', 'VACACIONES'),
('PERMISOS_SOLICITAR', 'Solicitar permisos', 'PERMISOS'),
('PERMISOS_APROBAR', 'Aprobar permisos', 'PERMISOS'),

-- Permisos de Incentivos
('INCENTIVOS_CONFIGURAR', 'Configurar reglas de incentivos', 'INCENTIVOS'),
('INCENTIVOS_CALCULAR', 'Calcular incentivos', 'INCENTIVOS'),
('INCENTIVOS_APROBAR', 'Aprobar incentivos', 'INCENTIVOS'),
('INCENTIVOS_VER_TODOS', 'Ver todos los incentivos', 'INCENTIVOS'),
('INCENTIVOS_OTORGAR_RECONOCIMIENTO', 'Otorgar reconocimientos', 'INCENTIVOS'),

-- Permisos de Recepción de CVs
('CVS_SUBIR', 'Subir CVs', 'CVS'),
('CVS_PROCESAR', 'Procesar CVs', 'CVS'),
('CVS_VER_TODOS', 'Ver todos los CVs', 'CVS'),

-- Permisos de Administración
('ADMIN_GESTIONAR_USUARIOS', 'Gestionar usuarios', 'ADMIN'),
('ADMIN_GESTIONAR_ROLES', 'Gestionar roles y permisos', 'ADMIN'),
('ADMIN_CONFIGURAR_SISTEMA', 'Configurar sistema', 'ADMIN'),
('ADMIN_VER_AUDITORIA', 'Ver auditoría', 'ADMIN');

-- Asignar permisos a roles
-- Administrador: todos los permisos
INSERT INTO roles_permisos (id_rol, id_permiso)
SELECT 1, id_permiso FROM permisos;

-- Reclutador: permisos de reclutamiento y CVs
INSERT INTO roles_permisos (id_rol, id_permiso)
SELECT 2, id_permiso FROM permisos 
WHERE modulo IN ('RECLUTAMIENTO', 'CVS');

-- Supervisor: permisos de revisión y aprobación
INSERT INTO roles_permisos (id_rol, id_permiso)
SELECT 4, id_permiso FROM permisos 
WHERE nombre_permiso LIKE '%APROBAR%' OR nombre_permiso LIKE '%VER_REPORTES%' OR nombre_permiso LIKE '%GENERAR_REPORTES%';

-- Empleado: permisos básicos
INSERT INTO roles_permisos (id_rol, id_permiso)
SELECT 3, id_permiso FROM permisos 
WHERE nombre_permiso LIKE '%SOLICITAR%' OR nombre_permiso LIKE '%REGISTRAR%' AND modulo = 'ASISTENCIA';

-- Insertar tipos de solicitud
INSERT INTO tipos_solicitud (nombre, descripcion, requiere_aprobacion, dias_maximos, requiere_justificacion) VALUES
('VACACIONES', 'Solicitud de vacaciones', TRUE, 30, FALSE),
('PERMISO_PERSONAL', 'Permiso por asuntos personales', TRUE, 5, TRUE),
('PERMISO_MEDICO', 'Permiso por atención médica', TRUE, 3, TRUE),
('LICENCIA_MEDICA', 'Licencia médica', TRUE, NULL, TRUE),
('LICENCIA_MATERNIDAD', 'Licencia por maternidad', TRUE, 90, FALSE),
('LICENCIA_PATERNIDAD', 'Licencia por paternidad', TRUE, 10, FALSE),
('LICENCIA_SIN_GOCE', 'Licencia sin goce de haber', TRUE, NULL, TRUE);

-- Insertar tipos de incentivos
INSERT INTO tipos_incentivos (nombre, descripcion, tipo_calculo, categoria) VALUES
('BONO_PRODUCTIVIDAD', 'Bono por productividad', 'VARIABLE', 'BONO'),
('BONO_ASISTENCIA', 'Bono por asistencia perfecta', 'FIJO', 'BONO'),
('COMISION_VENTAS', 'Comisión por ventas', 'PORCENTAJE', 'COMISION'),
('PREMIO_META', 'Premio por cumplimiento de meta', 'VARIABLE', 'PREMIO'),
('RECONOCIMIENTO_ESPECIAL', 'Reconocimiento especial', 'FIJO', 'RECONOCIMIENTO'),
('BONO_ANIVERSARIO', 'Bono por aniversario', 'FIJO', 'BONO');

-- Insertar políticas de vacaciones por defecto
INSERT INTO politicas_vacaciones (nombre, dias_por_anio, dias_minimos_continuos, dias_maximos_continuos, antiguedad_minima_meses, permite_acumulacion, anios_acumulacion_max) VALUES
('Política Estándar', 30, 5, 15, 12, TRUE, 2);

-- Insertar configuraciones del sistema
INSERT INTO configuraciones (clave, valor, tipo, modulo, descripcion) VALUES
('SISTEMA_NOMBRE', 'Sistema de Recursos Humanos', 'STRING', 'GENERAL', 'Nombre del sistema'),
('SISTEMA_VERSION', '1.0.0', 'STRING', 'GENERAL', 'Versión del sistema'),
('VACACIONES_DIAS_POR_ANIO', '30', 'NUMBER', 'VACACIONES', 'Días de vacaciones por año'),
('ASISTENCIA_TOLERANCIA_MINUTOS', '15', 'NUMBER', 'ASISTENCIA', 'Tolerancia en minutos para entrada'),
('HORAS_EXTRAS_PORCENTAJE_NORMAL', '1.5', 'NUMBER', 'ASISTENCIA', 'Porcentaje de pago horas extras normales'),
('HORAS_EXTRAS_PORCENTAJE_NOCTURNA', '2.0', 'NUMBER', 'ASISTENCIA', 'Porcentaje de pago horas extras nocturnas'),
('NOTIFICACIONES_EMAIL_ACTIVO', 'false', 'BOOLEAN', 'NOTIFICACIONES', 'Activar notificaciones por email');

-- =====================================================
-- 11. ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_empleado_fecha_asistencia ON registros_asistencia(id_empleado, fecha);
CREATE INDEX idx_solicitud_empleado_estado ON solicitudes(id_empleado, estado);
CREATE INDEX idx_incentivo_empleado_periodo ON incentivos(id_empleado, periodo);
CREATE INDEX idx_vacante_estado_fecha ON vacantes(estado, fecha_publicacion);
CREATE INDEX idx_proceso_etapa ON postulantes_proceso(id_proceso_actual, etapa_actual);

-- =====================================================
-- 12. TRIGGERS PARA MANTENIMIENTO AUTOMÁTICO
-- =====================================================

-- Trigger para actualizar fecha de última actualización en empleados
DELIMITER //
CREATE TRIGGER trg_empleados_update
BEFORE UPDATE ON empleados
FOR EACH ROW
BEGIN
    SET NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
END//
DELIMITER ;

-- Trigger para actualizar saldo de vacaciones al aprobar solicitud
DELIMITER //
CREATE TRIGGER trg_actualizar_saldo_vacaciones
AFTER UPDATE ON solicitudes
FOR EACH ROW
BEGIN
    IF NEW.estado = 'APROBADA' AND OLD.estado != 'APROBADA' AND NEW.id_tipo_solicitud = (SELECT id_tipo_solicitud FROM tipos_solicitud WHERE nombre = 'VACACIONES' LIMIT 1) THEN
        UPDATE saldos_vacaciones
        SET dias_tomados = dias_tomados + NEW.dias_solicitados,
            fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id_empleado = NEW.id_empleado
        AND anio = YEAR(NEW.fecha_inicio);
    END IF;
END//
DELIMITER ;

-- Trigger para actualizar puntos al otorgar reconocimiento
DELIMITER //
CREATE TRIGGER trg_actualizar_puntos_reconocimiento
AFTER INSERT ON reconocimientos
FOR EACH ROW
BEGIN
    IF NEW.puntos > 0 THEN
        INSERT INTO puntos_empleados (id_empleado, puntos_totales, puntos_disponibles)
        VALUES (NEW.id_empleado, NEW.puntos, NEW.puntos)
        ON DUPLICATE KEY UPDATE
            puntos_totales = puntos_totales + NEW.puntos,
            puntos_disponibles = puntos_disponibles + NEW.puntos;
        
        INSERT INTO historial_puntos (id_empleado, puntos, tipo_movimiento, origen, id_origen, descripcion)
        VALUES (NEW.id_empleado, NEW.puntos, 'GANADO', 'RECONOCIMIENTO', NEW.id_reconocimiento, CONCAT('Reconocimiento: ', NEW.titulo));
    END IF;
END//
DELIMITER ;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
