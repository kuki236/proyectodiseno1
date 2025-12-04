# Script para iniciar el backend conectado a Railway MySQL
# Configura las variables de entorno de Railway y ejecuta el backend

Write-Host "=== Iniciando Backend con Base de Datos Railway ===" -ForegroundColor Cyan
Write-Host ""

# Configurar variables de entorno de Railway MySQL
# Para desarrollo local, usa la URL pública de Railway
$env:MYSQLHOST = "yamanote.proxy.rlwy.net"
$env:MYSQLPORT = "25500"
$env:MYSQLDATABASE = "railway"
$env:MYSQLUSER = "root"
$env:MYSQLPASSWORD = "wlKTsqjTXVQBwaoNwcOwcvMMZiWSkPnw"

# Si estás ejecutando dentro de Railway, usa estas variables en su lugar:
# $env:MYSQLHOST = "mysql.railway.internal"
# $env:MYSQLPORT = "3306"

Write-Host "Configuración de Base de Datos:" -ForegroundColor Yellow
Write-Host "  Host: $env:MYSQLHOST" -ForegroundColor Gray
Write-Host "  Puerto: $env:MYSQLPORT" -ForegroundColor Gray
Write-Host "  Base de datos: $env:MYSQLDATABASE" -ForegroundColor Gray
Write-Host "  Usuario: $env:MYSQLUSER" -ForegroundColor Gray
Write-Host ""

# Buscar Java 17
Write-Host "Buscando Java 17..." -ForegroundColor Cyan

$java17Paths = @(
    "C:\Program Files\Eclipse Adoptium\jdk-17*-hotspot",
    "C:\Program Files\Java\jdk-17*",
    "C:\Program Files\Eclipse Adoptium\jdk-17*"
)

$JAVA_HOME_FOUND = $null

foreach ($pathPattern in $java17Paths) {
    try {
        $parentPath = Split-Path $pathPattern -Parent
        $filter = Split-Path $pathPattern -Leaf
        $resolvedPaths = Get-ChildItem -Path $parentPath -Filter $filter -ErrorAction SilentlyContinue | Where-Object { $_.PSIsContainer }
        
        foreach ($path in $resolvedPaths) {
            $javaExe = Join-Path $path.FullName "bin\java.exe"
            if (Test-Path $javaExe) {
                $JAVA_HOME_FOUND = $path.FullName
                break
            }
        }
        
        if ($JAVA_HOME_FOUND) { break }
    }
    catch {
        # Continuar con el siguiente path
    }
}

if (-not $JAVA_HOME_FOUND) {
    Write-Host "ERROR: Java 17 no encontrado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, instala Java 17 desde:" -ForegroundColor Yellow
    Write-Host "  https://adoptium.net/" -ForegroundColor Cyan
    Write-Host ""
    pause
    exit 1
}

$env:JAVA_HOME = $JAVA_HOME_FOUND
Write-Host "JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Green

# Verificar versión
$javaVersion = & "$env:JAVA_HOME\bin\java.exe" -version 2>&1 | Select-Object -First 1
Write-Host "Java: $javaVersion" -ForegroundColor Green
Write-Host ""

# Verificar Maven Wrapper
$wrapperPath = ".mvn\wrapper\maven-wrapper.jar"
if (-not (Test-Path $wrapperPath) -or (Get-Item $wrapperPath -ErrorAction SilentlyContinue).Length -lt 50000) {
    Write-Host "Descargando Maven Wrapper..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path ".mvn\wrapper" | Out-Null
    try {
        Invoke-WebRequest -Uri "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar" -OutFile $wrapperPath
        Write-Host "Maven Wrapper descargado." -ForegroundColor Green
    }
    catch {
        Write-Host "Error al descargar Maven Wrapper: $_" -ForegroundColor Red
        Write-Host "Ejecuta primero: .\descargar-maven-wrapper.ps1" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "Iniciando backend Spring Boot..." -ForegroundColor Cyan
Write-Host "Conectando a base de datos Railway..." -ForegroundColor Cyan
Write-Host ""

# Ejecutar Maven Wrapper
.\mvnw.cmd spring-boot:run

