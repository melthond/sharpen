import CopyButton from './CopyButton.tsx'
import { scrambleLines, useScramble } from './useScramble.tsx'

export default function Terminal({ commands, label = 'claude — zsh', ariaLabel = 'Terminal commands' }: { commands: string; label?: string; ariaLabel?: string }) {
  const displayText = useScramble(commands, 680)

  return <div className="term" role="group" aria-label={ariaLabel}>
    <div className="term-bar" aria-label="Terminal window controls">
      <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" /><em>{label}</em>
      <CopyButton className="copy-btn" text={commands} label="Copy install commands" />
    </div>
    <pre><code aria-hidden="true">{scrambleLines(displayText).map((line, index, lines) => <span key={index}><b>❯ </b>{line}{index < lines.length - 1 ? '\n' : ''}</span>)}</code></pre>
    <span className="sr-only">{commands}</span>
  </div>
}
