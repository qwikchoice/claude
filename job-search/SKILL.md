---
name: job-search
description: >
  End-to-end job search and application toolkit for Divakar BV — a senior Product/TPM leader targeting
  PM, Program Manager, and TPM roles in the Bay Area or remote. Use this skill whenever the user mentions:
  job search, job applications, finding a job, looking for roles, TPM roles, PM roles, program manager
  positions, finding a recruiter, finding a referral, writing a cover letter, outreach to recruiter,
  resume timeline, career infographic, AI portfolio, interview availability, 360 feedback, skill fit,
  job fit analysis, job duties match, customize resume, tailor resume, resume for job description,
  or any variation of career/job-hunting tasks. This skill connects to Indeed, Dice, and Apollo for
  live data, and generates professional documents as outputs. Trigger this skill even when the user
  gives only a partial signal — e.g., "find me some jobs", "write a note to a recruiter",
  "how well do I fit this role?", "prep me for interviews", "customize my resume for this role".
---

# Job Search Skill — Divakar BV

A comprehensive, end-to-end career acceleration workflow. Each section below is a **module** — invoke
the relevant one(s) based on the user's request. Multiple modules can be chained in one session.

Always read `references/profile.md` first so you know Divakar's background, target roles, and
locations before executing any module.

---

## Module 1: Job Search & Applications

**Trigger phrases:** "find jobs", "search roles", "what's out there", "search for PM/TPM positions"

### Steps
1. Identify the role type (TPM, PM, Program Manager, or a specific variant the user mentions).
2. Search **Indeed** (`mcp__fcaeee7c-d0bb-4d33-8a21-3c21be1bc23c__search_jobs`) and **Dice**
   (`mcp__eef6ddc6-db09-4609-aaee-84a402ca5245__search_jobs`) in parallel.
   - Default locations: San Francisco CA, San Jose CA, Mountain View CA, Palo Alto CA, plus Remote.
   - Run location searches in parallel (one call per location per board) to maximize coverage.
3. Score each result against Divakar's profile (see `references/profile.md`) using this rubric:
   - **Strong fit** (3 pts each): AI/ML focus, Bay Area / Remote, FAANG-adjacent company, Senior title
   - **Good fit** (2 pts each): Product + Technical hybrid role, Cloud/Infra domain, cross-functional scope
   - **Weak fit** (1 pt each): Relevant industry but mismatched seniority or domain
4. Present results as a ranked table: Role | Company | Location | Salary | Fit Score | Apply Link.
5. Ask: "Want me to draft a cover letter or find a referral at any of these companies?"

### Output format
A clean markdown table with clickable apply links. Flag top 3 roles with ⭐.

---

## Module 2: Find Referral & Recruiter

**Trigger phrases:** "find me a referral", "who do I know at X", "find a recruiter at Y", "who's hiring at Z"

### Steps
1. Identify the target company (from the job search results or user input).
2. Search Apollo for people at that company:
   - **Recruiters**: Search `mcp__ba4d1715-a56f-4d5e-aaba-a7e30318f18d__apollo_mixed_people_api_search`
     with title filters like "Recruiter", "Talent Acquisition", "Technical Sourcer", "Engineering Recruiter".
   - **Referrals**: Search for people with titles like "Senior Product Manager", "TPM", "Engineering Manager",
     "Director of Product" — people who would plausibly refer a peer.
3. For each result, note: Name, Title, LinkedIn URL (if available), email (if available).
4. Present a short list: top 2-3 recruiters and top 2-3 potential referrals.
5. Offer to draft a cover letter or outreach note for any of them.

---

## Module 3: Cover Letter — To a Referral

**Trigger phrases:** "cover letter to referral", "write a note for referral", "intro request", "referral outreach"

### Steps
1. Get the target person's name, title, and company (from Module 2 or user input).
2. Get the target role (from Module 1 or user input).
3. Read `references/cover_letter_referral_template.md` for tone and structure guidance.
4. Write a personalized 3-paragraph letter:
   - **Para 1**: Warm opener — establish the connection (mutual network, shared experience, admiration for their work).
   - **Para 2**: Brief pitch — 2-3 sentences on Divakar's most relevant experience for the role (use profile.md).
   - **Para 3**: The ask — specific, easy-to-fulfill: "Would you be open to a 15-min call?" or "Would you be
     comfortable forwarding my resume to the hiring team?"
5. Keep it under 200 words. Professional but human — not corporate-stiff.
6. Save as a .docx file using the docx skill: `[Referral Letter - Company - Person.docx]`.

---

## Module 4: Cover Letter — To a Recruiter

**Trigger phrases:** "cover letter to recruiter", "cold outreach recruiter", "email to recruiter", "recruiter note"

### Steps
1. Get the recruiter's name, company, and the target role.
2. Read `references/cover_letter_recruiter_template.md` for structure guidance.
3. Write a 3-paragraph letter:
   - **Para 1**: Hook — lead with the most impressive brand name + outcome from Divakar's background
     (e.g., "I led AI/ML product roadmaps at Meta and Amazon, delivering $60M+ in search revenue").
   - **Para 2**: Role alignment — show why this specific role/company fits (use Apollo company data or
     job description details the user provides).
   - **Para 3**: Clear CTA — "I'd love to connect for 15 minutes" + attach resume note.
4. Keep it under 250 words. Keyword-optimized for ATS where possible.
5. Save as a .docx file: `[Recruiter Letter - Company - Role.docx]`.

---

## Module 5: Resume Infographic Timeline

**Trigger phrases:** "resume timeline", "career infographic", "visual resume", "career visualization", "timeline"

### Steps
1. Read Divakar's career history from `references/profile.md`.
2. Build a visual HTML timeline (single file, clean and printable):
   - Chronological layout: 2003 → present, left-to-right.
   - Each role: Company logo placeholder, Title, Date range, 1-line impact statement.
   - Color-coded by domain: Telecom (blue), Finance (green), Cloud/Amazon (orange), AI/ML/Meta (purple),
     Startup/AI (teal).
   - Include key skills acquired at each role as small tags.
   - Include education markers (MBA 2016, BE 2003).
   - Include certifications as a separate track at the bottom.
3. Make it visually polished — professional enough to share as a portfolio piece.
4. Save as `Resume_Timeline_Divakar_BV.html` in the workspace folder.

---

## Module 6: AI Portfolio One-Pager

**Trigger phrases:** "AI portfolio", "portfolio page", "show my AI work", "AI projects one-pager"

### Steps
1. Read Divakar's AI/ML achievements from `references/profile.md`.
2. Build a single-page HTML portfolio:
   - Header: Name, tagline ("Agentic AI | Product Leadership | 15+ Years"), contact links.
   - Section 1: AI/ML Product Experience (Meta Marketplace AI, Amazon Search AI/ML, Alexa AI, RAG LLM apps).
   - Section 2: Key AI Outcomes (metrics, revenue, scale).
   - Section 3: AI Tools & Skills (Claude Code/Cowork, RAG, LangChain, Prompt Engineering, Generative AI).
   - Section 4: Certifications (NVIDIA GTC, MIT AI, Generative AI Applications, etc.).
   - Footer: Website + LinkedIn.
3. Clean, modern design. Dark header, white content sections, subtle accent color.
4. Save as `AI_Portfolio_Divakar_BV.html` in the workspace folder.

---

## Module 7: Interview Timeslots

**Trigger phrases:** "interview timeslots", "my availability", "schedule interview", "send my availability", "when am I free"

### Steps
1. Ask the user for their available days/times (or a general preference like "weekday mornings PT").
2. Generate a professional, copy-paste-ready availability block:
   ```
   Thank you for reaching out! Here are some times I'm available for a call (all times Pacific):

   - Monday, [date]: 9am–11am, 2pm–4pm
   - Wednesday, [date]: 10am–12pm
   - Thursday, [date]: 9am–11am

   Happy to accommodate other times — just let me know what works best for you.
   ```
3. Format it for three common contexts: email body, LinkedIn message (shorter), and calendar invite note.

---

## Module 8: 360-Degree Feedback Summary

**Trigger phrases:** "360 feedback", "performance feedback", "feedback summary", "synthesize my reviews"

### Steps
1. Ask the user to paste in raw feedback (from peers, managers, skip-levels, self-reviews).
2. Synthesize into a structured narrative:
   - **Top Strengths** (3-5): Specific, evidence-backed, with direct quotes where powerful.
   - **Growth Areas** (2-3): Framed constructively — "opportunity to..." not "weakness in...".
   - **Leadership Story** (1 paragraph): A cohesive narrative suitable for an interview "tell me about yourself" answer.
   - **Interview Sound Bites** (3-5 one-liners): Memorable phrases drawn from the feedback that Divakar can use
     to answer "What are your greatest strengths?" in interviews.
3. Save as `360_Feedback_Summary.docx` if the user wants a file.

---

## Module 9: Job Duties vs. Skill Fit Analysis

**Trigger phrases:** "fit analysis", "how well do I fit", "job fit", "skill match", "compare to job description",
"gap analysis", "should I apply"

### Steps
1. Get the job description (user pastes it, or retrieve via `mcp__fcaeee7c-d0bb-4d33-8a21-3c21be1bc23c__get_job_details`).
2. Extract the key requirements: must-have skills, nice-to-haves, years of experience, domain expertise.
3. Map each requirement against Divakar's profile (from `references/profile.md`):
   - ✅ **Strong match**: Direct experience, specific examples available.
   - 🟡 **Partial match**: Adjacent experience, transferable skills.
   - ❌ **Gap**: Not evidenced in resume.
4. Calculate an overall fit score (% of must-haves met as Strong or Partial match).
5. Output:
   - Fit score + verdict ("Strong Candidate", "Good Candidate — Address Gaps", "Stretch Role").
   - A "what to emphasize" list for the cover letter and interview.
   - A "gap bridging" suggestion for each ❌ (e.g., "highlight X from your Alexa experience").
6. Ask: "Want me to write a cover letter tailored to this role?"

---

## Module 10: Resume Customization

**Trigger phrases:** "customize my resume", "tailor resume", "update resume for this role",
"resume for job description", "tweak my resume", "optimize resume"

The goal is to produce a version of Divakar's resume that is precisely tuned for a specific job
description — emphasizing the most relevant experiences, mirroring the JD's language for ATS
optimization, and surfacing the right achievements without fabricating anything.

### Steps

1. **Get the JD** — user pastes it, or retrieve via `mcp__fcaeee7c-d0bb-4d33-8a21-3c21be1bc23c__get_job_details`.

2. **Run a fit analysis first** (Module 9) if not already done — identifies which experiences to
   emphasize (✅), which to reframe (🟡), and which to downplay (❌ gaps).

3. **Read `references/resume_customization_guide.md`** for detailed rewriting rules.

4. **Customize the resume** by making targeted edits across these sections:

   - **Profile Summary** — Rewrite the top 3-4 lines to mirror the JD's exact language and role title.
     If the JD says "Staff TPM", lead with that. If it emphasizes "AI infrastructure", surface that.

   - **Experience bullets** — For each relevant role, rewrite up to 3 bullets to:
     - Use verbs and keywords from the JD (e.g., if JD says "drove alignment", use "drove alignment")
     - Lead with the metric most relevant to the role (revenue, scale, speed, team size)
     - Remove or compress bullets for unrelated work at that company

   - **Skills section** — Reorder to put JD-matched skills first. Add any skills Divakar has but
     that weren't prominent in the original resume (e.g., if JD emphasizes "OKRs" and Divakar uses
     them but didn't list it explicitly).

   - **Section ordering** — If the JD is heavily AI/ML focused, move the AI/ML skills cluster to
     the top of the Skills section. If it's a Program Management role, lead with PM skills.

5. **ATS check** — Scan the customized resume for the JD's top 10 keywords. Flag any that are
   missing and suggest natural insertion points.

6. **Output** — Save as a .docx file using the `docx` skill:
   `Resume_Divakar_BV_[Company]_[Role].docx`
   Preserve the original ATS-friendly formatting from the base resume.

7. **Show a change summary** — List what was changed and why, so Divakar can review and approve
   before sending. Format as: `[Section] → [What changed] → [Why: matches JD requirement X]`

### Important rules
- Never fabricate experience, metrics, or skills not present in `references/profile.md`.
- Keep changes targeted — only edit what improves fit. Don't rewrite everything.
- Preserve the ATS-friendly structure (no tables, no text boxes, clean heading hierarchy).
- If a gap is real and can't be bridged, note it honestly rather than obscuring it.

---

## Workflow Chains

These modules are designed to chain together naturally. Common flows:

**Full Application Flow**: Module 1 → Module 9 → Module 10 → Module 3 or 4 → Module 2
*Find jobs → Fit analysis → Customize resume → Cover letter → Find referral*

**Portfolio Prep**: Module 5 → Module 6
*Timeline → AI Portfolio*

**Interview Prep**: Module 7 → Module 8
*Timeslots → 360 Feedback*

---

## Notes

- Always save output files to the workspace folder: `/sessions/pensive-vibrant-meitner/mnt/WBR2026_3_14_Claude/`
- For .docx files, use the `docx` skill.
- For .pptx files, use the `pptx` skill.
- Apollo tools are available under `mcp__ba4d1715-a56f-4d5e-aaba-a7e30318f18d__*`.
- Indeed: `mcp__fcaeee7c-d0bb-4d33-8a21-3c21be1bc23c__search_jobs`
- Dice: `mcp__eef6ddc6-db09-4609-aaee-84a402ca5245__search_jobs`
