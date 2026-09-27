
    Function Merge-GeneratedContent([string]$existing, [string]$newContent, [string]$startMarker, [string]$endMarker) {
        $block = $startMarker + "`n" + $newContent.TrimEnd() + "`n" + $endMarker + "`n"
        if ([string]::IsNullOrWhiteSpace($existing)) { return $block }
        $si = $existing.IndexOf($startMarker)
        $ei = $existing.IndexOf($endMarker)
        if ($si -ge 0 -and $ei -gt $si) {
            $before = $existing.Substring(0, $si)
            $after = $existing.Substring($ei + $endMarker.Length)
            return $before + $block + $after
        }
        # Soubor bez markerů: vygenerovaný blok nahoru, původní obsah zůstává pod ním
        return $block + "`n" + $existing
    }