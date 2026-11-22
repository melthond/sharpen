import { useState } from 'react'

// The inline SVG paths are Lucide's Copy and Check icons.
export default function CopyButton({ text, label, className }: { text: string; label: string; className: string }) {
  const [message, setMessage] = useState('')

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setMessage('Copied')
    } catch {
      setMessage('Copy failed. Select the commands to copy them.')
    }
  }

  return <>
    <button className={className} type="button" aria-label={message === 'Copied' ? 'Copied' : label} onClick={copy}>
      {message === 'Copied'
        ? <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg>
        : <svg aria-hidden="true" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></svg>}
    </button>
    <span className="sr-only" aria-live="polite">{message}</span>
  </>
}
