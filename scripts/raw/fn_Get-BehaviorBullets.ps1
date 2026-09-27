
    Function Get-BehaviorBullets([string]$rawList) {
        if ($rawList -match "Není vyžadováno") { return $rawList }
        $lines = $rawList -split "`n"
        $out = @()
        foreach ($line in $lines) {
            $label = $line -replace '^- ', ''
            if ($behaviorMap.ContainsKey($label)) { $out += "- $($behaviorMap[$label])" } else { $out += $line }
        }
        return $out -join "`n"
    }