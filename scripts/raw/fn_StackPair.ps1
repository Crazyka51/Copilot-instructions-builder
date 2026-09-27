
    Function StackPair($a, $b) {
        $aOk = ($a -and $a -notmatch 'neuvedeno|Nespecifikováno')
        $bOk = ($b -and $b -notmatch 'neuvedeno|Nespecifikováno')
        if ($aOk -and $bOk) { return "$a + $b" }
        if ($aOk) { return $a }
        if ($bOk) { return $b }
        return "neuvedeno"
    }