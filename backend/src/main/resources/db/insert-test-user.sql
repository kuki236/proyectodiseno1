-- Script para insertar usuario de prueba
-- Contraseña: admin123 (hash SHA-256 en Base64)
-- Para generar el hash de otra contraseña, puedes usar: 
-- echo -n "tu_contraseña" | sha256sum | xxd -r -p | base64

INSERT INTO usuarios (username, email, password_hash, nombre_completo, activo, cuenta_bloqueada, intentos_fallidos)
VALUES (
    'admin',
    'admin@rrhh.com',
    'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=', -- admin123
    'Administrador del Sistema',
    TRUE,
    FALSE,
    0
)
ON DUPLICATE KEY UPDATE
    password_hash = 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=',
    activo = TRUE,
    cuenta_bloqueada = FALSE;

-- Si existe un reclutador, asociarlo al usuario admin
-- Ajusta el id_reclutador según tu base de datos
UPDATE reclutadores 
SET id_usuario = (SELECT id_usuario FROM usuarios WHERE username = 'admin')
WHERE email = 'admin@rrhh.com' OR id_reclutador = 1;

