param (
  [Parameter(Mandatory=$false, Position=0)]
  [string]$message = "deployment"
)

Write-Host "Running deployment script..." -ForegroundColor Cyan

try {
  Write-Host "Committing changes..."
  git add .
  git commit -m "$message"
  git push origin main
  Write-Host "Git updated." -ForegroundColor Green
  
  Set-Location .\app

  Write-Host "Building App..."
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "Build failed." }
  Write-Host "Build complete." -ForegroundColor Green

  Write-Host "Deploying to Firebase..."
  firebase deploy
  if ($LASTEXITCODE -ne 0) { throw "Firebase deploy failed." }
  Write-Host "Deploy complete." -ForegroundColor Green

  Set-Location ..\extension

  Write-Host "Building Extension..."
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "Build failed." }
  Write-Host "Build complete." -ForegroundColor Green

  Set-Location ..

} catch {
  Write-Host "Error: $_" -ForegroundColor Red
  exit 1
}