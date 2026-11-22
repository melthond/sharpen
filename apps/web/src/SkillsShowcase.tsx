import CopyButton from './CopyButton.tsx'
import { SKILL_PHASES, SKILLS } from './skills.ts'

/** Companion skills: all ten at a glance in one grid. The first tile is featured. */
export default function SkillsShowcase() {
  return <section id="skills" className="skills reveal" aria-labelledby="skills-title">
    <div className="skills-inner">
      <header className="skills-head">
        <div>
          <p className="section-eyebrow">03 <span aria-hidden="true">·</span> Companion skills</p>
          <h2 id="skills-title">Ten skills, one plugin.<br /><span>Use one, or all of them.</span></h2>
        </div>
        <div className="skills-aside">
          <p className="section-lead">Sharpen runs on its own. These run when you call them: type <code>/sharpen:</code> in Claude Code, whether automatic review is on or off.</p>
          <a href="/docs/#skills">All skill docs <span aria-hidden="true">→</span></a>
        </div>
      </header>
      <ul className="skill-grid">
        {SKILLS.map(([name, summary, detail], i) => {
          const command = `/sharpen:${name}`
          return <li key={name} className={i === 0 ? 'skill-tile is-featured' : 'skill-tile'}>
            <div className="skill-tile-top">
              <span className="skill-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="skill-phase">{SKILL_PHASES[i]}</span>
            </div>
            <h3><a href="/docs/#skills">sharpen-<span>{name.replace(/^sharpen-/, '')}</span></a></h3>
            <p className="skill-summary">{summary}</p>
            <p className="skill-detail">{detail}</p>
            <div className="skill-cmd">
              <code><b aria-hidden="true">$ </b>{command}</code>
              <CopyButton className="skill-copy" text={command} label={`Copy ${command}`} />
            </div>
          </li>
        })}
      </ul>
    </div>
  </section>
}
