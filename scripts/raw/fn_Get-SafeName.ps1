
    Function Get-SafeName([string]$name) {
        $invalidChars = [System.IO.Path]::GetInvalidFileNameChars() -join ''
        $escaped = [System.Text.RegularExpressions.Regex]::Escape($invalidChars)
        $safe = [System.Text.RegularExpressions.Regex]::Replace($name, "[$escaped]", '_')
        $safe = ($safe -replace '\s+', '_').Trim('_')
        if ([string]::IsNullOrWhiteSpace($safe)) { $safe = "EnterpriseProject" }
        return $safe
    }