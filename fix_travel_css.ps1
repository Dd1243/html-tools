$files = Get-ChildItem "e:\html-tools\tools\travel\*.html"
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $fixed = $content
    $fixed = $fixed -replace 'var\(--color-bg-deep\)', 'var(--bg-deep)'
    $fixed = $fixed -replace 'var\(--color-bg-surface\)', 'var(--bg-surface)'
    $fixed = $fixed -replace 'var\(--color-bg-card\)', 'var(--bg-card)'
    $fixed = $fixed -replace 'var\(--color-bg-input\)', 'var(--bg-input)'
    $fixed = $fixed -replace 'var\(--color-bg-subtle\)', 'var(--bg-input)'
    $fixed = $fixed -replace 'var\(--color-text-primary\)', 'var(--text-primary)'
    $fixed = $fixed -replace 'var\(--color-text-secondary\)', 'var(--text-secondary)'
    $fixed = $fixed -replace 'var\(--color-text-muted\)', 'var(--text-muted)'
    $fixed = $fixed -replace 'var\(--color-border-subtle\)', 'var(--border-subtle)'
    $fixed = $fixed -replace 'var\(--color-border-default\)', 'var(--border-subtle)'
    $fixed = $fixed -replace 'var\(--color-border-strong\)', 'var(--border-strong)'
    $fixed = $fixed -replace 'var\(--color-accent-primary\)', 'var(--accent-cyan)'
    $fixed = $fixed -replace 'var\(--color-accent-cyan\)', 'var(--accent-cyan)'
    if ($fixed -ne $content) {
        [System.IO.File]::WriteAllText($file.FullName, $fixed, [System.Text.Encoding]::UTF8)
        Write-Host "Fixed CSS vars: $($file.Name)"
    }
}
Write-Host "Done!"
