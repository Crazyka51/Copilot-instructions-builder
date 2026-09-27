
    Function Get-SkillMd {
        $head = @('---', "name: $($projName.ToLower() -replace '[^a-z0-9]+','-')-skills",
            "description: Postupy a kontrolní seznamy pro projekt $projName. Načti příslušný skill, když úloha odpovídá jeho zaměření.")
        if ($incMetadata) {
            $head += 'metadata:'
            $head += "  projekt: $projName"
            $head += "  architektura: $($vals.Arch)"
            $head += "  skills: $($selectedSkills.Count)"
        }
        $head += '---'
        $body = @("", "# Skills: $projName", "",
            "Soubor obsahuje $($selectedSkills.Count) postupů. Každý skill má své zaměření, postup a kontrolní seznam.",
            "")
        if ($incSummary) { $body += "## Přehled"; $body += ""; $body += $skillsSummaryTable; $body += "" }
        foreach ($sk in $selectedSkills) { $body += (Get-SkillBlock $sk 2); $body += "" }
        return (($head -join "`n") + "`n" + (($body -join "`n").TrimEnd()) + "`n")
    }