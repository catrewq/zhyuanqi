$ErrorActionPreference = "Stop"

$legacyPackage = "com." + "zhyuanqi"
$escapedPackage = [regex]::Escape($legacyPackage)
$matches = Get-ChildItem -Path "src/main" -Recurse -File | Select-String -Pattern $escapedPackage

if ($matches) {
    $matches | ForEach-Object {
        Write-Output "$($_.Path):$($_.LineNumber):$($_.Line.Trim())"
    }
    throw "Found legacy package references to $legacyPackage"
}

Write-Output "No legacy package references found."
