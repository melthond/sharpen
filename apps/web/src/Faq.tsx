import { useId, useState, type ReactNode } from 'react'

const FAQS: [string, ReactNode][] = [
  ['Does Sharpen change a clear prompt?', 'For a clear request, it keeps the ask intact and adds helpful context. If a rewrite could change what you meant, you can choose the original from the card.'],
  ['Will it slow every task down?', <>There is one review decision per sharpened prompt. Use <code>raw:</code> for a request you want to send unchanged, or turn automatic review off with <code>/sharpen off</code>.</>],
  ['Does Sharpen cost extra?', "It uses some of your current agent session's context: the method and setup summary load once per session, with a short reminder on each prompt. There is no separate Sharpen API or service fee."],
  ['Does it know every tool or hook?', 'It uses what Claude Code lists for skills, agents, MCP tools, and plugin commands, plus the hook and enabled-plugin summary it reads at session start. It does not execute hooks while gathering context.'],
  ['Can it work in other coding agents?', 'The current plugin is for Claude Code. The project describes support for other agents as future work; do not assume the automatic review flow is available elsewhere today.'],
  ['Where does its advice come from?', <>From the Anthropic, OpenAI and Google prompting guides, open-source projects such as the DAIR.AI Prompt Engineering Guide, the OpenAI Cookbook and GitHub Spec Kit, published studies on prompt and agent failures, and 2025–2026 developer surveys. <a href="https://github.com/ardfaiyaz/sharpen/blob/main/CREDITS.md">CREDITS.md</a> lists every source and what it contributed, and model-specific settings carry the date they were checked.</>],
  ['Does Sharpen track what I type?', <>No. Nothing leaves your machine. <code>/sharpen</code> shows two local counts, the review cards shown and the follow-ups that pushed back, so you can see whether sharpened prompts land the first time. No prompt text is stored.</>],
  ['Can it guarantee the code change is correct?', 'No prompt tool can guarantee that. Sharpen makes the requested work, boundaries, and checks clearer, and lets you review the prompt before it starts. The agent still needs to do and report the work.'],
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
