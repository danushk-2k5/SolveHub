# SolvHub - MySQL XAMPP Deep Fix Script
# Fixes: "Incorrect file format 'db'" corrupted privilege tables
# Run as Administrator

Write-Host "=== SolvHub MySQL Deep Fix ===" -ForegroundColor Cyan

$xamppPath   = "C:\xampp"
$dataPath    = "$xamppPath\mysql\data"
$backupPath  = "$xamppPath\mysql\data_backup"
$mysqlBin    = "$xamppPath\mysql\bin\mysqld.exe"
$mysqlClient = "$xamppPath\mysql\bin\mysql.exe"
$mysqlUpgrade= "$xamppPath\mysql\bin\mysql_upgrade.exe"

# Step 1: Kill mysqld
Write-Host "`n[1] Stopping MySQL..." -ForegroundColor Yellow
Get-Process -Name "mysqld" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "    Done" -ForegroundColor Green

# Step 2: Backup current data folder
Write-Host "`n[2] Backing up data folder to mysql\data_backup..." -ForegroundColor Yellow
if (Test-Path $backupPath) { Remove-Item $backupPath -Recurse -Force }
Copy-Item $dataPath $backupPath -Recurse
Write-Host "    Backup created at $backupPath" -ForegroundColor Green

# Step 3: Replace corrupted mysql system db with fresh one from XAMPP defaults
Write-Host "`n[3] Restoring clean mysql system database..." -ForegroundColor Yellow
$freshMysqlDb = "$xamppPath\mysql\backup\mysql"
$currentMysqlDb = "$dataPath\mysql"

if (Test-Path $freshMysqlDb) {
    Remove-Item $currentMysqlDb -Recurse -Force
    Copy-Item $freshMysqlDb $currentMysqlDb -Recurse
    Write-Host "    Restored from XAMPP backup" -ForegroundColor Green
} else {
    # No backup folder — use mysql_install_db instead
    Write-Host "    No backup found, running mysql_install_db..." -ForegroundColor Yellow
    $installDb = "$xamppPath\mysql\bin\mysql_install_db.exe"
    if (Test-Path $installDb) {
        & $installDb --datadir="$dataPath" --password="" 2>$null
        Write-Host "    mysql_install_db completed" -ForegroundColor Green
    } else {
        Write-Host "    Manually copy a clean 'mysql' folder into $dataPath" -ForegroundColor Red
    }
}

# Step 4: Delete stale InnoDB files
Write-Host "`n[4] Cleaning InnoDB temp files..." -ForegroundColor Yellow
@("ib_logfile0","ib_logfile1","ib_buffer_pool","ibtmp1") | ForEach-Object {
    $f = "$dataPath\$_"
    if (Test-Path $f) { Remove-Item $f -Force; Write-Host "    Deleted $_" -ForegroundColor Green }
}

# Step 5: Start MySQL and wait
Write-Host "`n[5] Starting MySQL..." -ForegroundColor Yellow
Start-Process $mysqlBin -ArgumentList "--defaults-file=$xamppPath\mysql\bin\my.ini" -WindowStyle Hidden

$ready = $false
for ($i = 1; $i -le 20; $i++) {
    Start-Sleep -Seconds 1
    $test = & $mysqlClient -u root --connect-timeout=2 -e "SELECT 1;" 2>$null
    if ($LASTEXITCODE -eq 0) { $ready = $true; Write-Host "    MySQL ready in ${i}s" -ForegroundColor Green; break }
}

if (-not $ready) {
    Write-Host "    MySQL still not responding. Check: $dataPath\mysql_error.log" -ForegroundColor Red
    exit 1
}

# Step 6: Create solvhub database
Write-Host "`n[6] Creating 'solvhub' database..." -ForegroundColor Yellow
& $mysqlClient -u root -e "CREATE DATABASE IF NOT EXISTS solvhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
Write-Host "    Database 'solvhub' ready!" -ForegroundColor Green

Write-Host "`n=== All done! Run: node backend/server.js ===" -ForegroundColor Cyan
