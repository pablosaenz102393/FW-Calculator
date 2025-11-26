$files = Get-ChildItem -Path . -Force | Where-Object { $_.Name -notin @('node_modules', '.next', '.git', 'create-netlify-zip.ps1') } | Select-Object -ExpandProperty FullName
Compress-Archive -Path $files -DestinationPath ..\fw-calc-v3-netlify.zip -Force
Write-Host "Zip file created: fw-calc-v3-netlify.zip (one folder up)"
