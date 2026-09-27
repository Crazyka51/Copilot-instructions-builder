
    Function Polish([string]$text) {
        $r = $text -replace 'Nespecifikováno — Nespecifikováno', 'neuvedeno'
        $r = $r -replace 'Nespecifikováno', 'neuvedeno'
        return $r
    }