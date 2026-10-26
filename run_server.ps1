param(
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$projectRoot = "C:\Users\anany\OneDrive\Documents\java_project"
$tomcatHome = "C:\Users\anany\apache-tomcat-10.1.20"
$webappDir = Join-Path $tomcatHome "webapps\java_project"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Building & Deploying Split & Expense   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Ensure WEB-INF/classes exists
$classesDir = Join-Path $projectRoot "WebContent\WEB-INF\classes"
if (-not (Test-Path $classesDir)) {
    New-Item -ItemType Directory -Path $classesDir -Force | Out-Null
}

# 2. Compile all Java sources into WEB-INF/classes
Write-Host "[1/4] Compiling Java classes..." -ForegroundColor Yellow
$sources = (Get-ChildItem -Path (Join-Path $projectRoot "src") -Recurse -Filter "*.java").FullName
$cp = (Join-Path $projectRoot "WebContent\WEB-INF\lib\*")

& javac -encoding UTF-8 -cp $cp -d $classesDir $sources
if ($LASTEXITCODE -ne 0) {
    Write-Host "Compilation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "      Java compilation successful!" -ForegroundColor Green

# 3. Deploy to Tomcat webapps/java_project
Write-Host "[2/4] Deploying to Tomcat ($webappDir)..." -ForegroundColor Yellow
if (-not (Test-Path $webappDir)) {
    New-Item -ItemType Directory -Path $webappDir -Force | Out-Null
}
Copy-Item -Path (Join-Path $projectRoot "WebContent\*") -Destination $webappDir -Recurse -Force
Write-Host "      Deployment complete!" -ForegroundColor Green

# 4. Check if Tomcat is already running on port 8080
Write-Host "[3/4] Checking server status..." -ForegroundColor Yellow
$portOpen = $false
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $tcp.Connect("127.0.0.1", 8080)
    $portOpen = $true
    $tcp.Close()
} catch {
    $portOpen = $false
}

if (-not $portOpen) {
    Write-Host "[4/4] Starting Apache Tomcat on port 8080..." -ForegroundColor Green
    $catalina = Join-Path $tomcatHome "bin\catalina.bat"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c `"$catalina`" run" -WindowStyle Normal
    Start-Sleep -Seconds 4
} else {
    Write-Host "      Tomcat is already running on port 8080. Hot deployed!" -ForegroundColor Green
}

$url = "http://localhost:8080/java_project/login.html"
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " App URL: $url" -ForegroundColor Green
Write-Host " Demo User: ananya | Password: ananya123" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

if (-not $NoBrowser) {
    Start-Process $url
}