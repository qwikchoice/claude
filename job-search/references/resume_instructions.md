# Resume Agent Rulebook — Senior PM / TPM / Leadership Roles

A unified instruction set for an AI agent that produces JD-tailored, impactful resumes
for experienced leadership candidates (10+ years). Organized as ordered rules the agent
executes in sequence.

**Core principle:** A resume is not a history document. It is a positioning document.
Every word must serve the question: *Why should this person solve our hiring problem?*

---

## Phase 1 — Input Processing (JD → Signal Extraction)

### Rule 1.1 — Extract Core Signals from the JD

Before touching the resume, parse the job description for:

- **Role type:** PM / TPM / Program Manager / Director / Platform / AI-focused
- **Keywords:** skills, tools, methodologies, domain terms
- **Business goals:** scale, cost reduction, growth, revenue, AI/ML, reliability, GTM
- **Leadership signals:** stakeholder management, org-level ownership, strategic scope, C-level exposure

These signals drive every downstream decision — what to include, what to cut, and how to frame every bullet.

### Rule 1.2 — Build a Target Profile

Synthesize the extracted signals into a working target profile before writing:

```
TARGET_PROFILE = {
  role_identity,        # e.g., "Senior TPM, AI/ML Platform"
  domain_focus,         # e.g., "Search, Cloud Infrastructure"
  required_skills,      # top 8–10 from JD
  business_outcomes,    # what success looks like for the hiring manager
  seniority_signals     # language and scope cues from JD
}
```

This profile is the lens through which every resume section is evaluated and written.

---

## Phase 2 — Content Selection

### Rule 2.1 — Filter Experience by Signal Strength

```
INCLUDE:
  - Last 10–15 years of experience
  - Leadership roles with clear ownership
  - High-impact, quantifiable projects
  - Experience directly relevant to the TARGET_PROFILE

EXCLUDE:
  - Entry-level or junior roles (unless defining career foundation)
  - Technology or tools not relevant to the target role
  - Low-impact tasks that don't show ownership or results
  - Roles older than 15 years (reduce to 1–2 lines or omit)
```

Senior resumes demonstrate relevance and impact — not completeness of career history.

### Rule 2.2 — Score and Prioritize Content

For every experience item or bullet candidate, compute a relative priority:

```
priority_score = relevance_to_JD + business_impact + leadership_scope
```

Keep the highest-scoring items. When page length forces cuts, drop the lowest-scoring items first — never cut a metric-rich, JD-aligned bullet to preserve a generic responsibility statement.

---

## Phase 3 — Resume Structure

### Rule 3.1 — Section Order

```
1. Contact Header
2. Executive Summary
3. Core Competencies
4. Professional Experience
5. Education
6. Certifications (if relevant and recent)
```

This order front-loads what hiring managers and ATS systems read first.

### Rule 3.2 — Contact Header

Include: Full name, city/state (not full address), phone, professional email, LinkedIn URL, personal site or portfolio if applicable.

Exclude: Photo, date of birth, marital status, full street address, "References available upon request."

### Rule 3.3 — Format Rules (ATS Safety)

```
REQUIRED:
  - Single-column layout
  - Consistent font: Arial, Calibri, or Garamond — 10–11pt body, 14–16pt name
  - PDF output unless the JD requests Word
  - Uniform spacing and clear section headers

FORBIDDEN:
  - Multi-column layouts
  - Text boxes or tables anywhere in the document
  - Headers or footers (ATS cannot reliably parse them)
  - Graphics, icons, or profile photos
  - Sidebar content of any kind
```

ATS parsers fail silently on visual formatting — a brilliant resume in a broken layout scores zero.

### Rule 3.4 — Length Constraint

```
IF experience < 15 years → target 1–2 pages
IF senior / executive (15+ years) → max 2 pages
```

Page 1 must be self-sufficient. Assume the recruiter stops there.

---

## Phase 4 — Executive Summary

### Rule 4.1 — Summary Generator

The summary is a 6-second pitch. It must answer: who is this person, what can they do, and why should the reader keep reading.

Write 3–5 lines maximum:

- **Line 1:** Role identity + years of experience + domain: *"Senior TPM with 15+ years leading AI/ML product programs at FAANG scale..."*
- **Lines 2–3:** 2–3 strongest, most JD-aligned achievements with metrics.
- **Line 4 (optional):** Leadership style or current focus that maps to the company's domain.

Constraints:

- No first-person pronouns ("I"). Start with the role descriptor or a strong noun phrase.
- No fluff: "passionate", "results-driven", "hardworking", "team player" — delete on sight.
- Mirror the JD's language exactly — if the JD says "cross-functional leadership," use that phrase.
- Rewrite the summary for every application. A summary not tailored to the JD is a missed opportunity.

---

## Phase 5 — Core Competencies

### Rule 5.1 — Build the Skills Section

Extract 10–15 skills that:

- Appear in the JD (exact match preferred for ATS)
- Reflect a mix of technical, leadership, and domain expertise
- The candidate can defend in an interview

Group into 2–3 logical clusters (e.g., AI/ML & Technical | Product & Program | Business Domains).

Include both spelled-out and abbreviated forms where relevant: *"Technical Program Manager (TPM)"*, *"Large Language Models (LLM)"*.

Do not list every tool ever used. Curate for the target role — an exhaustive skills list dilutes focus and invites questions the candidate can't answer.

---

## Phase 6 — Experience Bullets (Core Engine)

### Rule 6.1 — Mandatory Bullet Format

Every bullet must follow this structure:

```
ACTION VERB + SCOPE + RESULT + METRIC
```

Example: *"Led migration of 200+ microservices to containerized infrastructure, reducing infra cost by 30% and improving deployment velocity by 40%."*

No paragraphs. Bullets only. 4–6 bullets per role. The most recent 2 roles get the most detail; roles older than 8 years get 2–3 bullets maximum.

### Rule 6.2 — Verb Strength

Senior roles require leadership-level verbs. Audit every bullet.

| Replace (junior / passive)  | With (senior / leadership)       |
| --------------------------- | -------------------------------- |
| Managed                     | Led, Owned, Directed             |
| Worked on                   | Delivered, Built, Architected    |
| Responsible for             | → eliminate this phrase entirely |
| Helped, Assisted, Supported | Spearheaded, Championed, Drove   |
| Was involved in             | Defined, Oversaw, Scaled         |
| Made improvements           | Achieved, Reduced, Accelerated   |

### Rule 6.3 — Quantification (Mandatory)

Every bullet must contain at least one quantified metric. If a metric is unavailable:

- Attempt to infer or estimate with appropriate language ("~", "30%+")
- If genuinely unquantifiable, deprioritize the bullet in favor of ones that are

Metric types to use:

- **Revenue / value:** "$60M in search revenue across 15 countries"
- **Scale:** teams, countries, users, services, regions
- **Efficiency:** % reduction in time, cost, or error rate
- **Velocity:** "Reduced launch cycle from 6 months to 8 weeks"
- **Scope:** "Led 7 cross-functional teams across 3 orgs"

### Rule 6.4 — Leadership Bias

Prefer bullets that show:

- Strategic decision-making with real stakes
- Cross-team or cross-org influence
- Stakeholder management up to C-level / VP
- Ownership of outcomes, not tasks

Leadership and strategy are the primary differentiators at senior levels. Execution bullets matter only when accompanied by scope and outcome.

### Rule 6.5 — Front-Load JD Relevance

For each role, the first bullet must be the most JD-aligned achievement. Hiring managers read bullets top-to-bottom and stop early. The best evidence must never be buried.

---

## Phase 7 — Role-Specific Framing

Adjust tone and emphasis based on role type from the TARGET_PROFILE:

### TPM Roles

- Emphasize: delivery track record, technical depth, program complexity, risk mitigation
- Show: cross-functional leadership (number of teams, org levels), engineering partnership, C-level stakeholder communication
- Include: systems and architecture decisions navigated, dependency management, concurrent workstreams
- Do not position as a pure process manager — TPMs are expected to understand the technical system deeply

### PM Roles

- Emphasize: product outcomes (DAU, MAU, revenue, conversion, engagement), user-centric thinking
- Show: full product lifecycle (discovery → definition → launch → iteration), data-driven decisions (A/B tests, analytics), go-to-market involvement
- Include: customer research, prioritization judgment, pricing or positioning ownership
- Lead with outcomes, not features: "Launched X, increasing DAU by 18%" — not just "Launched X"

### Director / Leadership Roles

- Emphasize: org-level strategy, P&L ownership, team building, executive communication
- Show: multi-team leadership, business model impact, stakeholder influence at board or C-suite level
- Include: hiring and developing talent, budget ownership, cross-company partnerships

---

## Phase 8 — ATS and Keyword Optimization

### Rule 8.1 — Keyword Injection

Ensure that the top 8–10 JD keywords appear in the resume — not just the skills section, but in the summary and experience bullets too. ATS scores for density and placement.

Mirror the JD's exact language. Do not assume synonyms are equivalent — ATS matches on specific terms. If the JD says "stakeholder management," use that phrase verbatim.

### Rule 8.2 — Role-Type Keyword Reference

```
TPM roles:   Technical Program Manager, Cross-functional leadership, OKRs,
             Roadmap, Agile, Scrum, Stakeholder management, Delivery, Risk mitigation

PM roles:    Product roadmap, Go-to-market, Customer insights, Prioritization,
             Data-driven, A/B testing, Product-market fit, User research

AI roles:    AI/ML, Generative AI, LLM, Recommendation engine, Search relevance,
             Prompt engineering, RAG, NLP, Agentic AI

Director:    P&L, Organizational design, Talent development, Business strategy,
             Executive leadership, M&A, Board-level communication
```

Do not keyword-stuff — ATS scores relevance, but human reviewers read the document too.

---

## Phase 9 — Content Quality Rules

### Rule 9.1 — Delete Fluff on Sight

```
DELETE without replacement:
  "Hardworking", "Team player", "Results-driven", "Passionate about",
  "Dynamic", "Synergy", "Leverage", "Detail-oriented", "Go-getter"
```

Replace all fluff with proof. A single metric outweighs a paragraph of adjectives.

### Rule 9.2 — Rewrite Responsibility Statements

```
IF bullet contains "Responsible for..." or "Duties included..."
  → rewrite as an impact statement using Rule 6.1 format
```

Responsibility statements describe a job description. Impact statements describe a candidate worth hiring.

### Rule 9.3 — Enforce Career Narrative

The resume as a whole must answer three questions:

1. What problems did this person solve?
2. What impact did they create?
3. Why are they the right fit for *this* role?

If any section fails to contribute to the narrative, cut or rewrite it.

---

## Phase 10 — Scoring (Agent Self-Evaluation)

### Rule 10.1 — Resume Quality Score

Before finalizing output, compute a quality score:

```
Quality Score =
  (Impact Score     × 0.40)   # Quantified, outcomes-driven bullets
  (JD Alignment     × 0.30)   # Keywords, framing, role-specific content
  (Leadership Signal × 0.20)  # Seniority of verbs, scope, stakeholder level
  (Clarity          × 0.10)   # Readability, structure, no fluff
```

### Rule 10.2 — Reject Conditions

Do not produce or return a resume if any of the following are true:

```
- No metrics present in any experience bullet
- Summary is generic (not tailored to the JD)
- Top JD keywords are absent from the document
- Bullet verbs are predominantly junior/passive
```

If any reject condition is met: rewrite the failing section before output.

---

## Phase 11 — Final Validation

### Rule 11.1 — 6-Second Scan Test

Check the top 30% of page 1 (approximately the first 8–10 lines). A recruiter scanning for 6 seconds must be able to see:

- Role fit (title, domain, seniority)
- Impact (at least one strong metric)
- Seniority (leadership-level verbs and scope)

If any of these three are absent from the top 30%, restructure.

### Rule 11.2 — Hiring Manager Test

Ask: *"Would this resume solve the hiring problem described in the JD?"*

If no → identify the weakest section and rewrite before output.

### Rule 11.3 — Pre-Output Checklist

```
[ ] Summary is tailored to this specific JD and role type
[ ] Every bullet starts with a leadership-level action verb
[ ] Every bullet contains at least one quantified metric
[ ] Top 8–10 JD keywords appear in the document
[ ] Most JD-relevant bullet is first within each role
[ ] No tables, columns, text boxes, or graphics in formatting
[ ] Document is 2 pages or fewer
[ ] No first-person pronouns
[ ] No fluff phrases present
[ ] Skills section is curated (10–15 items), not exhaustive
[ ] Quality Score computed — no reject conditions triggered
```

---

## Quick Reference — What to Always Do vs. Never Do

| Always Do                                          | Never Do                                                  |
| -------------------------------------------------- | --------------------------------------------------------- |
| Lead every bullet with a strong action verb        | Start bullets with "Responsible for" or "Duties included" |
| Quantify every bullet with at least one metric     | Leave bullets without measurable impact                   |
| Mirror JD language exactly for ATS                 | Assume synonyms are equivalent                            |
| Tailor summary and bullet order per application    | Submit the same resume to every role                      |
| Use single-column, ATS-safe formatting          