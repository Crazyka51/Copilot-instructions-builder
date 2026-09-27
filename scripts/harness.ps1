# Headless harness: spustí generátor z PowerShell builderu bez GUI.
# Použití: powershell -STA -File scripts/harness.ps1 -Source <ps1> -Config <json> -OutRoot <dir>
param(
  [Parameter(Mandatory = $true)][string]$Source,
  [Parameter(Mandatory = $true)][string]$Config,
  [Parameter(Mandatory = $true)][string]$OutRoot
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

function Show-ParityMsg { return [System.Windows.Forms.DialogResult]::Yes }

$src = [System.IO.File]::ReadAllText($Source, [System.Text.Encoding]::UTF8)

# 1) přesměrovat cílovou složku místo dialogu
$src = $src.Replace('$folderDialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK', '$false')
$src = $src.Replace('$desktop = [System.Environment]::GetFolderPath("Desktop")', '$desktop = $env:CB_OUT_ROOT')

# 2) všechny dialogy odpoví "Ano" (jen čtení výsledku, žádné blokování)
$src = $src.Replace('[System.Windows.Forms.MessageBox]::Show(', 'Show-ParityMsg(')

# 3) obsluha tlačítka se stane volatelnou funkcí a okno se nezobrazí
$src = $src.Replace('$btnOk.Add_Click({', 'function global:InvokeGen {')
$src = [regex]::Replace($src, '\}\)\r?\n\r?\n\$form\.ShowDialog\(\) \| Out-Null', { param($m) '}' }, 1)

$tmp = Join-Path $env:TEMP 'cb-parity-harness.ps1'
[System.IO.File]::WriteAllText($tmp, $src, (New-Object System.Text.UTF8Encoding($true)))

. $tmp

$cfg = Get-Content $Config -Raw -Encoding UTF8 | ConvertFrom-Json
Apply-ConfigObject $cfg | Out-Null

if ($cfg.project) { $txtProjectName.Text = $cfg.project }
if ($cfg.goal) { $wizardGoal.Text = $cfg.goal }
if ($cfg.spec) {
  $wizardCreates.Text = [string]$cfg.spec.creates
  $wizardAudience.Text = [string]$cfg.spec.audience
  $wizardTech.Text = [string]$cfg.spec.tech
  $wizardFunctions.Text = [string]$cfg.spec.functions
  $wizardFiles.Text = [string]$cfg.spec.files
  $wizardDependencies.Text = [string]$cfg.spec.forbiddenDependencies
}

$env:CB_OUT_ROOT = $OutRoot
InvokeGen | Out-Null

Write-Host 'HARNESS OK'
