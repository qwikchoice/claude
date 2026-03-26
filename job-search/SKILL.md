---
name: job-search
description: >
  End-to-end job search and application toolkit for Divakar BV — a senior Product/TPM leader targeting
  PM, Program Manager, and TPM roles in the Bay Area or remote. Use this skill whenever the user mentions:
  job search, job applications, finding a job, looking for roles, TPM roles, PM roles, program manager
  positions, finding a recruiter, finding a referral, writing a cover letter, outreach to recruiter,
  skill fit, job fit analysis, job duties match, build a resume, create a resume, customize resume,
  generate resume, tailor resume, or any variation of career/job-hunting tasks. This skill connects to
  Indeed, Dice, and Apollo for live data, and generates professional documents as outputs. Trigger this
  skill even when the user gives only a partial signal — e.g., "find me some jobs", "write a note to a
  recruiter", "how well do I fit this role?", "build me a resume for this role".
---

# Job Search Skill — Divakar BV

Each section below is a **module** — invoke the relevant one based on the user's request.
Only load `references/profile.md` when explicitly required by the module (Modules 2 and 3).

---

## Module 1: Job Search & Applications

**Trigger phrases:** "find jobs", "search roles", "what's out there", "search for PM/TPM positions"

**Default search parameters (no profile read needed):**
- Roles: Senior Technical Product Manager, Senior Product Manager, Senior Program Manager, TPM
- Locations: San Francisco CA, San Jose CA, Mountain View CA, Palo Alto CA, Remote

### Steps
1. Identify the role type from user input, or use defaults above.
2. Search **Indeed** (`mcp__fcaeee7c-d0bb-4d33-8a21-3c21be1bc23c__search_jobs`) and **Dice**
   (`mcp__eef6ddc6-db09-4609-aaee-84a402ca5245__search_jobs`) in parallel across all default locations.
3. Score each result using this rubric:
   - **Strong fit** (3 pts each): AI/ML focus, Bay Area / Remote, FAANG-adjacent company, Senior title
   - **Good fit** (2 pts each): Product + Technical hybrid, Cloud/Infra domain, cross-functional scope
   - **Weak fit** (1 pt each): Relevant industry but mismatched seniority or domain
4. Present as a ranked markdown table: Role | Company | Location | Salary | Fit Score | Apply Link.
   Flag top 3 with ⭐.

---

## Module 2: Custom Resume Builder

**Trigger phrases:** "build a resume", "create a resume", "customize my resume", "generate resume for",
"tailor resume to", "write a resume for this job", "make me a resume", "resume for [role] at [company]"

### Step 1 — Extract JD Signals

Read `references/resume_instructions.md` Phase 1 rules. From the JD, extract:
- Role type (PM / TPM / Program Manager / Director)
- Top 8–10 must-have keywords and skills
- Business goals and domain signals (AI/ML, Cloud, Search, Ecommerce, etc.)
- Leadership and seniority signals
- Company name (for output filename)

### Step 2 — Select Template

| JD signals | Template |
|---|---|
| Product Manager, Head of Product, VP Product, Product Lead, PM | `Template_PM.docx` |
| Technical Program Manager, TPM, Program Manager, Engineering PM | `Template_TPM.docx` |
| Ambiguous or hybrid | Ask the user before proceeding |

Templates path: `/sessions/gallant-cool-volta/mnt/JobAgent/Templates/`

### Step 3 — Plan All Customizations

Before writing any code, explicitly decide each of the following. Use `references/resume_instructions.md`
as the rulebook for every decision. **Never fabricate — only select, reorder, or filter content that
already exists in the template. Do not add metrics, experiences, or achievements not present in the template.**

**Role tagline** — Write a specific tagline matching the JD.
Format: `SENIOR [ROLE] | [DOMAIN 1] & [DOMAIN 2]`
Example: `SENIOR PRODUCT MANAGER | AI PLATFORM & ECOMMERCE SEARCH`

**Profile Summary** — Write 3–5 lines using the LinkedIn base voice, layered with JD language:
- Line 1: `[Role] with 15+ years [domain from JD] at [top brands]...`
- Lines 2–3: 1–2 strongest JD-aligned achievements with actual metrics from the template
- Line 4: `Key strengths: [keyword 1]  |  [keyword 2]  |  [keyword 3]` — mirror JD phrasing exactly

**Key Achievements** — Decide the order of the 4 existing achievements (most JD-relevant first).
Do not rewrite any achievement.

**Core Competencies** (PM template only) — Select 12–16 competency items that match JD keywords.
List which items to keep; remove the rest.

**Experience bullets per role** — For each role, select 3–5 bullets and rank them (most JD-relevant first):
- SynergIQ: select from 4 available bullets
- Meta: select from 5 available bullets
- Amazon Search CX: select from 4 available bullets
- Amazon Alexa: select from 3 available bullets
- AWS EC2: select from 3 available bullets (PM) / 2 available bullets (TPM)
- Earlier experience: include or compress to 1 line based on JD domain match

**Skills** — Decide which skill categories and specific items to keep. Reorder categories: most
JD-relevant category first. Remove individual skills that don't appear in the JD.

**Certifications** — Reorder by JD relevance (AI certs first for AI roles, PMP first for program roles).

### Step 4 — Generate the Custom DOCX

Use `/sessions/gallant-cool-volta/resume-gen/generate_templates.js` as the base.

Write a new script `/sessions/gallant-cool-volta/resume-gen/generate_custom_resume.js` that:
1. Copies the appropriate build function (`buildPMTemplate` or `buildTPMTemplate`) from the base script
2. Replaces every `[[AGENT: ...]]` placeholder with the actual text from Step 3
3. Removes every `agentNote(...)` call — agent instructions must NOT appear in the final resume
4. Implements bullet selection: include only the bullets chosen in Step 3, in the decided order
5. Implements skill filtering: include only the skills and categories chosen in Step 3
6. Sets the output path to the dated folder (Step 5 below)

Run the script:
```bash
cd /sessions/gallant-cool-volta/resume-gen && node generate_custom_resume.js
```

### Step 5 — Save to Dated Output Folder

```bash
DATE=$(date +%Y-%m-%d)
mkdir -p /sessions/gallant-cool-volta/mnt/JobAgent/Outputs/$DATE
```

Filename format: `[Company]_[RoleAbbrev]_Divakar_BV_[YYYYMMDD].docx`

Examples:
- `Google_PM_Divakar_BV_20260325.docx`
- `Meta_TPM_Divakar_BV_20260325.docx`
- `Stripe_ProgramManager_Divakar_BV_20260325.docx`

### Step 6 — Quality Check

Run the Pre-Output Checklist from `references/resume_instructions.md` Phase 11.
Report the estimated Quality Score (Phase 10 formula). Flag any reject conditions.

---

## Module 3: Job Duties vs. Skill Fit Analysis

**Trigger phrases:** "fit analysis", "how well do I fit", "job fit", "skill match", "compare to job description",
"gap analysis", "should I apply"

### Steps
1. Get the job description — user pastes it, or retrieve via `mcp__fcaeee7c-d0bb-4d33-8a21-3c21be1bc23c__get_job_details`.
2. Read `references/profile.md` (full profile needed for accurate mapping).
3. Extract from the JD: must-have skills, nice-to-haves, years of experience, domain expertise.
4. Map each requirement against the profile:
   - ✅ **Strong match**: Direct experience, specific examples available.
   - 🟡 **Partial match**: Adjacent experience, transferable skills.
   - ❌ **Gap**: Not evidenced in resume.
5. Calculate fit score: % of must-haves met as ✅ or 🟡.
6. Output:
   - Fit score + verdict: "Strong Candidate" (≥80%), "Good Candidate — Address Gaps" (60–79%), "Stretch Role" (<60%).
   - "What to emphasize" list for the cover letter and interview.
   - Gap-bridging suggestion for each ❌.

---

## Module 4: Find Referral & Recruiter

**Trigger phrases:** "find me a referral", "who do I know at X", "find a recruiter at Y", "who's hiring at Z"

### Steps
1. Identify the target company from user input or prior job search results.
2. Search Apollo (`mcp__ba4d1715-a56f-4d5e-aaba-a7e30318f18d__apollo_mixed_people_api_search`) in parallel:
   - **Recruiters**: title filters — "Recruiter", "Talent Acquisition", "Technical Sourcer", "Engineering Recruiter"
   - **Referrals**: title filters — "Senior Product Manager", "TPM", "Engineering Manager", "Director of Product"
3. Present: top 2-3 recruiters and top 2-3 referrals with Name | Title | LinkedIn URL | Email (if available).

---

## Module 5: Cover Letter — To a Referral

**Trigger phrases:** "cover letter to referral", "write a note for referral", "intro request", "referral outreach"

**Key facts (no profile read needed):**
- Divakar BV | divakarbv@gmail.com | www.linkedin.com/in/divakarbv | www.divakarbv.tech
- Top achievements: $60M search revenue at Amazon (15+ countries); Meta Marketplace AI roadmap; Alexa launch in 6 countries; AWS EC2 (10 regions, CEO-level pricing approval); SynergIQ — Agentic AI / RAG LLM

### Steps
1. Get target person's name, title, and company (from Module 4 or user input).
2. Get the target role (from Module 1 or user input).
3. Write a 3-paragraph letter using this structure:
   - **Para 1 (~40 words):** Establish the connection — mutual contact, shared experience, or admired work.
     If cold: "I know this is a cold ask, but I've admired [Company]'s approach to X."
   - **Para 2 (~80 words):** Pick the 1-2 most relevant achievements above. Lead with brand + outcome.
     Connect directly to what the company or role cares about. Use specific numbers.
   - **Para 3 (~40 words):** Easy, specific ask — "Would you be open to a 15-min call?" or
     "Would you be comfortable forwarding my resume to the hiring team?"
4. Constraints: under 200 words total. No buzzwords ("synergy", "leverage", "passionate about").
   Do not ask for a job directly. Do not apologize for reaching out.
5. Save as `[Referral Letter - Company - Person.docx]` using the docx skill.

---

## Module 6: Cover Letter — To a Recruiter

**Trigger phrases:** "cover letter to recruiter", "cold outreach recruiter", "email to recruiter", "recruiter note"

**Key facts (no profile read needed):**
- Divakar BV | divakarbv@gmail.com | www.linkedin.com/in/divakarbv
- Top achievements: $60M search revenue at Amazon (15+ countries); Meta Marketplace AI roadmap; Alexa launch in 6 countries; AWS EC2 CEO-level pricing approval; SynergIQ — Agentic AI / RAG LLM
- ATS keywords by role type:
  - TPM: Technical Program Manager, Cross-functional leadership, OKRs, Roadmap, Agile, Stakeholder management
  - PM: Product roadmap, Go-to-market, Customer insights, Prioritization, Data-driven, A/B testing
  - AI: AI/ML, Generative AI, LLM, Recommendation engine, Search relevance, Prompt engineering

### Steps
1. Get the recruiter's name, company, and target role from user input or Module 4.
2. Write a 3-paragraph letter using this structure:
   - **Para 1 (~60 words):** Open with strongest brand + outcome. Do NOT start with "I am writing to..."
     or "My name is...". Start with the bold credential: "I led AI/ML product roadmaps at Meta and Amazon —
     delivering $60M in search revenue across 15+ countries..."
   - **Para 2 (~100 words):** Connect 2-3 specific experiences to the company's known products, challenges,
     or the role's key responsibilities. Show homework done.
   - **Para 3 (~40 words):** "I'd welcome a 15-minute call to explore whether there's a fit.
     My resume is attached — happy to answer any questions or share more context."
3. Constraints: under 250 words total. Include relevant ATS keywords from the list above.
4. Save as `[Recruiter Letter - Company - Role.docx]` using the docx skill.

---

## Workflow Chain

**Full Application Flow**: Module 1 → Module 3 → Module 2 → Module 5 or 6 → Module 4
*Find jobs → Fit analysis → Build custom resume → Cover letter → Find referral*

**Quick Apply Flow**: Module 2 → Module 6
*Paste JD → Build resume → Write recruiter cover letter*

---

## Notes

- Resume templates: `/sessions/gallant-cool-volta/mnt/JobAgent/Templates/`
- Resume generator base: `/sessions/gallant-cool-volta/resume-gen/generate_templates.js`
- Resume output folder: `/sessions/gallant-cool-volta/mnt/JobAgent/Outputs/[YYYY-MM-DD]/`
- Resume rules: `references/resume_instructions.md`
- For .docx files, use the `docx` skill.
- Apollo tools: `mcp__ba4d1715-a56f-4d5e-aaba-a7e30318f18d__*`
- Indeed: `mcp__fcaeee7c-d0bb-4d33-8a21-3c21be1bc23c__search_jobs`
- Dice: `mcp__eef6ddc6-db09-4609-aaee-84a402ca5245__search_jobs`
