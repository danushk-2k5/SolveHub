# Fix XAMPP MySQL/MariaDB crash
# Run as Administrator

$xamppPath = "C:\xampp"
$dataPath = "$xamppPath\mysql\data"
$backupPath = "$xamppPath\mysql\data_backup"

Write-Host "Fixing XAMPP MySQL/MariaDB..." -ForegroundColor Cyan

# 1. Stop any running MySQL/MariaDB processes
Write-Host "Stopping MySQL/MariaDB processes..." -ForegroundColor Yellow
Get-Process -Name "mysqld" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "mariadb" -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Check if data_backup exists and restore clean data files
if (Test-Path $backupPath) {
    Write-Host "Restoring clean data files..." -ForegroundColor Yellow
    
    # Remove corrupted files
    Get-ChildItem $dataPath -File | Where-Object { $_.Name -match "^(ibdata|ib_logfile|ibtmp)" } | Remove-Item -Force
    
    # Copy clean files from backup
    Copy-Item "$backupPath\ibdata1" $dataPath -Force -ErrorAction SilentlyContinue
    Copy-Item "$backupPath\ib_logfile0" $dataPath -Force -ErrorAction SilentlyContinue
    Copy-Item "$backupPath\ib_logfile1" $dataPath -Force -ErrorAction SilentlyContinue
    
    Write-Host "Data files restored from backup" -ForegroundColor Green
}

# 3. Check for Windows MySQL service conflict
Write-Host "Checking for Windows MySQL service conflict..." -ForegroundColor Yellow
$mysqlService = Get-Service -Name "MySQL80" -ErrorAction SilentlyContinue
if ($mysqlService -and $mysqlService.Status -eq "Running") {
    Write-Host "Found MySQL80 Windows service running - stopping it..." -ForegroundColor Red
    Stop-Service MySQL80 -Force -ErrorAction SilentlyContinue
}

$mysql57 = Get-Service -Name "MySQL57" -ErrorAction SilentlyContinue
if ($mysql57 -and $mysql57.Status -eq "Running") {
    Write-Host "Found MySQL57 Windows service running - stopping it..." -ForegroundColor Red
    Stop-Service MySQL57 -Force -ErrorAction SilentlyContinue
}

Write-Host "`nDone! Now:" -ForegroundColor Cyan
Write-Host "1. Open XAMPP Control Panel as Administrator" -ForegroundColor White
Write-Host "2. Stop any MySQL/MariaDB that's running" -ForegroundColor White  
Write-Host "3. Click 'Explorer' in XAMPP -> go to mysql/data" -ForegroundColor White
Write-Host "4. Delete all files EXCEPT folders and .err files" -ForegroundColor White
Write-Host "5. Copy all files from data_backup to data folder" -ForegroundColor White
Write-Host "6. Start MySQL in XAMPP" -ForegroundColor White