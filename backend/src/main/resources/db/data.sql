-- =====================================================
-- DATOS INICIALES Y DE PRUEBA
-- =====================================================

USE rrhh_db;

-- Usuario administrador por defecto (password: admin123 - debe hashearse en producción)
-- NOTA: En producción, usar BCrypt para hashear contraseñas
INSERT INTO usuarios (username, email, password_hash, nombre_completo, activo) VALUES
('admin', 'admin@rrhh.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Administrador del Sistema', TRUE),
('reclutador1', 'reclutador1@rrhh.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Juan Pérez - Reclutador', TRUE),
('supervisor1', 'supervisor1@rrhh.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'María García - Supervisor', TRUE);

-- Asignar roles a usuarios
INSERT INTO usuarios_roles (id_usuario, id_rol) VALUES
(1, 1), -- admin es ADMINISTRADOR
(2, 2), -- reclutador1 es RECLUTADOR
(3, 4); -- supervisor1 es SUPERVISOR

-- Crear reclutador asociado al usuario
INSERT INTO reclutadores (id_usuario, nombre, email, departamento, activo) VALUES
(2, 'Juan Pérez', 'reclutador1@rrhh.com', 'Recursos Humanos', TRUE);

-- Insertar horarios comunes
INSERT INTO horarios (nombre_horario, departamento, hora_entrada, hora_salida, dias_semana, horas_jornada) VALUES
('Horario Administrativo', 'Administración', '09:00:00', '18:00:00', 'LUNES-VIERNES', 8.0),
('Horario Comercial', 'Comercial', '08:00:00', '17:00:00', 'LUNES-SABADO', 8.0),
('Horario Operaciones', 'Operaciones', '07:00:00', '16:00:00', 'LUNES-VIERNES', 8.0),
('Medio Tiempo', 'General', '09:00:00', '13:00:00', 'LUNES-VIERNES', 4.0);

-- Insertar puestos comunes
INSERT INTO puestos (nombre_puesto, departamento, area, descripcion, nivel_jerarquico, salario_minimo, salario_maximo) VALUES
('Técnico de Soporte', 'Operaciones', 'Soporte Técnico', 'Brindar soporte técnico a clientes', 'JUNIOR', 2500.00, 3500.00),
('Ejecutivo de Ventas', 'Comercial', 'Ventas', 'Vender productos y servicios', 'JUNIOR', 2000.00, 4000.00),
('Ingeniero de Red', 'Infraestructura', 'Redes', 'Diseñar y mantener infraestructura de red', 'SENIOR', 5000.00, 8000.00),
('Especialista en Telecomunicaciones', 'Soporte', 'Técnico', 'Especialista en sistemas telefónicos', 'SEMI_SENIOR', 3500.00, 5500.00),
('Técnico de Instalación', 'Operaciones', 'Instalaciones', 'Instalar y dar mantenimiento a equipos', 'JUNIOR', 2200.00, 3200.00);

-- Insertar habilidades comunes
INSERT INTO habilidades (nombre_habilidad, tipo_habilidad, descripcion, categoria) VALUES
-- Habilidades Técnicas
('Soporte Técnico', 'TECNICA', 'Capacidad para resolver problemas técnicos', 'TECNOLOGIA'),
('Sistemas Telefónicos', 'TECNICA', 'Conocimiento de sistemas telefónicos', 'TELECOMUNICACIONES'),
('Redes IP', 'TECNICA', 'Configuración y mantenimiento de redes IP', 'REDES'),
('Fibra Óptica', 'TECNICA', 'Instalación y mantenimiento de fibra óptica', 'TELECOMUNICACIONES'),
('VoIP', 'TECNICA', 'Sistemas de Voz sobre IP', 'TELECOMUNICACIONES'),
('Ventas', 'TECNICA', 'Técnicas de venta', 'COMERCIAL'),
('Linux/Windows', 'TECNICA', 'Administración de sistemas operativos', 'SISTEMAS'),
-- Habilidades Blandas
('Comunicación', 'BLANDA', 'Habilidad para comunicarse efectivamente', 'INTERPERSONAL'),
('Liderazgo', 'BLANDA', 'Capacidad de liderar equipos', 'LIDERAZGO'),
('Trabajo en equipo', 'BLANDA', 'Colaboración efectiva', 'INTERPERSONAL'),
('Resolución de problemas', 'BLANDA', 'Análisis y solución de problemas', 'COGNITIVA'),
('Pensamiento analítico', 'BLANDA', 'Análisis de situaciones complejas', 'COGNITIVA'),
('Proactividad', 'BLANDA', 'Iniciativa y proactividad', 'ACTITUDINAL'),
('Empatía', 'BLANDA', 'Comprensión de las necesidades de otros', 'INTERPERSONAL');

-- Insertar habilidades técnicas extendidas
INSERT INTO habilidades_tecnicas (id_habilidad, tecnologia, nivel_dominio, certificacion)
SELECT id_habilidad, 
    CASE 
        WHEN nombre_habilidad = 'Redes IP' THEN 'Cisco, Juniper'
        WHEN nombre_habilidad = 'VoIP' THEN 'Asterisk, FreePBX'
        WHEN nombre_habilidad = 'Linux/Windows' THEN 'Ubuntu, CentOS, Windows Server'
        ELSE 'General'
    END,
    'INTERMEDIO',
    NULL
FROM habilidades 
WHERE tipo_habilidad = 'TECNICA';

-- Insertar habilidades blandas extendidas
INSERT INTO habilidades_blandas (id_habilidad, tipo_interaccion, descripcion_habilidad)
SELECT id_habilidad,
    CASE 
        WHEN nombre_habilidad = 'Comunicación' THEN 'Verbal y Escrita'
        WHEN nombre_habilidad = 'Liderazgo' THEN 'Dirección de Equipos'
        WHEN nombre_habilidad = 'Trabajo en equipo' THEN 'Colaboración'
        ELSE 'General'
    END,
    descripcion
FROM habilidades 
WHERE tipo_habilidad = 'BLANDA';

