
    Function Get-SkillBlock($sk, [int]$level) {
        $h = [string]::new('#', $level)
        $parts = @("$h $($sk.T)", "", $sk.D, "", "$h# Postup")
        foreach ($step in $script:skillCategorySteps[$sk.C]) { $parts += "- $step" }
        if ($incChecklist) {
            $parts += @("", "$h# Kontrolní seznam")
            foreach ($item in $sk.K) { $parts += "- [ ] $item" }
        }
        if ($incExample) {
            $parts += @("", "$h# Příklad použití", "", $fence, "Uživatel: Potřebuji aplikovat: $($sk.T).", "Agent: Projde Postup, ověří Kontrolní seznam a teprve pak upraví kód.", $fence)
        }
        if ($incRelated) {
            $parts += @("", "$h# Související soubory", "- ``.github/copilot-instructions.md``", "- ``AGENTS.md``", "- ``.github/workflows/copilot-setup-steps.yml``")
        }
        return ($parts -join "`n")
    }