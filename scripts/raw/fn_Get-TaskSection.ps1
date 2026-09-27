
    Function Get-TaskSection([string]$title, $listValues) {
        $parts = @()
        foreach ($v in $listValues) {
            if ($v -and $v -notmatch "Není vyžadováno") { $parts += $v }
        }
        if ($parts.Count -eq 0) { return "" }
        return "### $title`n`n" + ($parts -join "`n")
    }