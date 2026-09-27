

Function Apply-Preset([string]$label) {
    if (-not $script:presets.ContainsKey($label)) { return 0 }
    # Volitelne nejdriv vycistit vsechny skupiny, kterych se tykaji presety
    $clearFirst = $false
    if ($script:cPresetOptions) {
        $clearFirst = (@($script:cPresetOptions | Where-Object { $_.Text -eq "Před aplikací vyčistit doporučené skupiny" -and $_.Checked }).Count -gt 0)
    }
    if ($clearFirst) {
        $kind = Get-PresetKind $label
        foreach ($g in $script:presetGroupsByKind[$kind]) { foreach ($c in $g) { $c.Checked = $false } }
    }
    $added = 0
    foreach ($entry in $script:presets[$label]) {
        $group = @($entry.C)
        if ($group.Count -eq 0) { continue }
        # U jednovyberovych karet nejdriv vycistit skupinu, aby nezustaly dva vybery
        if ($group[0].Tag -eq 'single') { foreach ($c in $group) { $c.Checked = $false } }
        foreach ($ctrl in $group) {
            if (($entry.I -contains $ctrl.Text) -and (-not $ctrl.Checked)) {
                $ctrl.Checked = $true
                $added++
            }
        }
    }
    return $added
}