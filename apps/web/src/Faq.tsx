import { useId, useState, type ReactNode } from 'react'

const FAQS: [string, ReactNode][] = [
  ['Does Sharpen change a clear prompt?', 'It keeps a clear ask intact and adds useful context. If a rewrite might change your meaning, pick your original on the card.'],
  ['Will it slow every task down?', <>One review per sharpened prompt. Start a request with <code>raw:</code> to send it unchanged, or turn review off with <code>/sharpen off</code>.</>],
  ['Does Sharpen cost extra?', 'No fee. It uses a little of your session’s context: the method and setup summary load once, plus a short reminder per prompt. There is no Sharpen API or service.'],
  ['Does it know every tool or hook?', 'It uses the skills, agents, MCP tools and plugin commands Claude Code lists, plus a session-start summary of hooks and enabled plugins. It never runs hooks while gathering context.'],
  ['Can it work in other coding agents?', 'Not yet. It is built for Claude Code; other agents are future work.'],
  ['Where does its advice come from?', <>The Anthropic, OpenAI and Google prompting guides, projects like the DAIR.AI Prompt Engineering Guide, the OpenAI Cookbook and GitHub Spec Kit, published studies, and 2025–2026 developer surveys. <a href="https://github.com/melthond/sharpen/blob/main/CREDITS.md">CREDITS.md</a> lists every source; model settings show the date they were checked.</>],
  ['Does Sharpen track what I type?', <>No. Nothing leaves your machine. <code>/sharpen</code> shows two local counts: cards shown and follow-ups that pushed back. No prompt text is stored.</>],
  ['Can it guarantee the code change is correct?', 'No prompt tool can. Sharpen makes the work, limits and checks clear, and lets you review first. The agent still does and reports the work.'],
]

/** Shared by the landing page and the docs page. */
export default function Faq() {
  return <div className="faq-list">{FAQS.map(([question, answer]) => <FaqItem key={question} question={question}>{answer}</FaqItem>)}</div>
}

// GitOwl's SmoothReveal pattern: grid rows animate 0fr -> 1fr, so height follows the content; closed answers are inert.
function FaqItem({ question, children }: { question: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return <div className="faq-item" data-open={open}>
    <h3><button id={`${id}-q`} type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((value) => !value)}>
      {question}<span aria-hidden="true">+</span>
    </button></h3>
    <div id={id} className="faq-answer" role="region" aria-labelledby={`${id}-q`} inert={!open}>
      <div><p>{children}</p></div>
    </div>
  </div>
}
