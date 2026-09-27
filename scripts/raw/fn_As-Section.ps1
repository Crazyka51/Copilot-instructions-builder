
    Function As-Section([string]$text) {
        if ([string]::IsNullOrWhiteSpace($text)) { return "" }
        return [regex]::Replace($text.Trim(), '(?m)^# ', '## ', 1)
    }