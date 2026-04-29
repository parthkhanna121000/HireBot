// const { GoogleGenAI } = require("@google/genai");
// const { z } = require("zod");
// const { zodToJsonSchema } = require("zod-to-json-schema");
// const puppeteer = require("puppeteer");

// const MODEL = "gemini-2.5-flash-lite";

// // ─── Key rotation ─────────────────────────────────────────────────────────────
// const API_KEYS = [
//   process.env.GOOGLE_GENAI_API_KEY_1,
//   process.env.GOOGLE_GENAI_API_KEY_2,
// ].filter(Boolean);

// if (!API_KEYS.length) throw new Error("No Gemini API keys found.");

// let keyIdx = 0;
// function getClient() {
//   return new GoogleGenAI({ apiKey: API_KEYS[keyIdx] });
// }
// function nextKey() {
//   const next = (keyIdx + 1) % API_KEYS.length;
//   if (next === keyIdx) throw new Error("All Gemini keys exhausted.");
//   keyIdx = next;
//   console.log(`[AI] Switched to key ${keyIdx + 1}/${API_KEYS.length}`);
// }

// async function callGemini(prompt, schema, retried = false) {
//   try {
//     const ai = getClient();
//     const resp = await ai.models.generateContent({
//       model: MODEL,
//       contents: prompt,
//       config: {
//         responseMimeType: "application/json",
//         responseSchema: zodToJsonSchema(schema),
//       },
//     });
//     return JSON.parse(resp.text);
//   } catch (err) {
//     const quota =
//       err?.status === 429 ||
//       err?.message?.includes("RESOURCE_EXHAUSTED") ||
//       err?.message?.includes("quota");
//     if (quota && !retried) {
//       nextKey();
//       return callGemini(prompt, schema, true);
//     }
//     throw err;
//   }
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // SCHEMAS
// // ─────────────────────────────────────────────────────────────────────────────

// const questionSchema = z.object({
//   question: z
//     .string()
//     .describe("Clean interview question text — one sentence only"),
//   difficulty: z.enum(["Easy", "Medium", "Hard"]),
//   intention: z
//     .string()
//     .describe("1-2 sentences: specifically why interviewers ask this question"),
//   answer: z
//     .string()
//     .describe(
//       "FULL SPOKEN MODEL ANSWER — minimum 5 sentences as if the CANDIDATE IS SPEAKING in the interview room. Must start with 'I' or a direct factual statement. NEVER write coaching hints. NEVER empty.",
//     ),
//   keyPoints: z
//     .array(z.string())
//     .describe("3-4 key points the candidate must cover"),
// });

// const interviewReportSchema = z.object({
//   matchScore: z
//     .number()
//     .describe("Plain integer 0-100. NEVER a string like '75%'."),
//   technicalQuestions: z
//     .array(questionSchema)
//     .describe(
//       "8-12 questions. EVERY answer field is a FULL SPOKEN RESPONSE (5+ sentences). NEVER empty.",
//     ),
//   behavioralQuestions: z
//     .array(questionSchema)
//     .describe("5-7 questions. EVERY answer uses full STAR prose. NEVER empty."),
//   skillGaps: z.array(
//     z.object({
//       skill: z.string(),
//       severity: z.enum(["low", "medium", "high"]),
//     }),
//   ),
//   preparationPlan: z
//     .array(
//       z.object({
//         day: z.number(),
//         focus: z
//           .string()
//           .describe(
//             "SHORT topic name — maximum 8 words. Do NOT put tasks or descriptions here.",
//           ),
//         tasks: z
//           .array(z.string())
//           .describe("EXACTLY 4 concrete 1-line tasks. NEVER empty array."),
//       }),
//     )
//     .describe("EVERY day MUST have 4 tasks. tasks array CANNOT be empty."),
//   title: z.string(),
// });

// // ── POSITIONAL schemas for retry calls ───────────────────────────────────────
// // Positional = answers are returned IN THE SAME ORDER as input questions.
// // No index needed — just zip arrays together. Most reliable approach with Gemini.

// const answersPositionalSchema = z.object({
//   answers: z
//     .array(
//       z.object({
//         intention: z
//           .string()
//           .describe("1-2 sentences why interviewers ask this"),
//         answer: z
//           .string()
//           .describe(
//             "Full spoken model answer — minimum 5 sentences. First person. Specific. Never a hint.",
//           ),
//         keyPoints: z.array(z.string()).describe("3-4 key points"),
//       }),
//     )
//     .describe(
//       "Return answers IN THE SAME ORDER as the input question list. Position 0 = answer to question 0.",
//     ),
// });

// const tasksPositionalSchema = z.object({
//   days: z
//     .array(
//       z.object({
//         tasks: z
//           .array(z.string())
//           .describe("Exactly 4 concrete actionable tasks for this day"),
//       }),
//     )
//     .describe(
//       "Return task arrays IN THE SAME ORDER as the input day list. Position 0 = tasks for day 0.",
//     ),
// });

// // ── Resume analysis schema ────────────────────────────────────────────────────
// const resumeAnalysisSchema = z.object({
//   overallScore: z.number(),
//   atsScore: z.number(),
//   skillsMatch: z.number(),
//   experienceMatch: z.number(),
//   keywordsMatch: z.number(),
//   missingSkills: z.array(z.string()),
//   skillGaps: z.array(
//     z.object({
//       skill: z.string(),
//       severity: z.enum(["low", "medium", "high"]),
//     }),
//   ),
//   problems: z.array(z.string()),
//   suggestions: z.array(z.string()),
//   bulletRewrites: z.array(
//     z.object({ original: z.string(), improved: z.string() }),
//   ),
//   goodParts: z.array(z.string()),
//   weakParts: z.array(z.string()),
//   scoreBreakdown: z.array(
//     z.object({ factor: z.string(), score: z.number(), reason: z.string() }),
//   ),
//   hiringDiagnosis: z.object({
//     primaryConcern: z.string(),
//     secondaryGaps: z.array(z.string()),
//     strengths: z.array(z.string()),
//   }),
//   skillGapIntelligence: z.array(
//     z.object({
//       skill: z.string(),
//       impact: z.enum(["high", "medium", "low"]),
//       whyMissing: z.string(),
//       hiringEffect: z.string(),
//       fixPlan: z.array(z.string()),
//     }),
//   ),
//   rankedSuggestions: z.array(
//     z.object({ text: z.string(), impact: z.enum(["high", "medium", "low"]) }),
//   ),
//   actionPlan: z.object({
//     mustFix: z.array(z.string()),
//     nextPriority: z.array(z.string()),
//     optional: z.array(z.string()),
//   }),
//   hiringOutlook: z.object({
//     shortlistProbability: z.number(),
//     interviewConversion: z.number(),
//     riskLevel: z.enum(["low", "medium", "high"]),
//     rejectionReasons: z.array(z.string()),
//     verdict: z.string(),
//   }),
// });

// const candidateRankingSchema = z.object({
//   matchScore: z.number(),
//   skillsMatch: z.number(),
//   experienceMatch: z.number(),
//   keywordsMatch: z.number(),
//   aiSummary: z.string(),
//   strengths: z.array(z.string()),
//   weaknesses: z.array(z.string()),
//   missingSkills: z.array(z.string()),
// });
// const jobEnhancementSchema = z.object({
//   enhancedDescription: z.string(),
//   suggestedSkills: z.array(z.string()),
//   suggestedTitle: z.string(),
// });
// const resumePdfSchema = z.object({ html: z.string() });
// const bulletRewriteSchema = z.object({
//   improved: z.string(),
//   explanation: z.string(),
// });

// // ─────────────────────────────────────────────────────────────────────────────
// // SERVICE FUNCTIONS
// // ─────────────────────────────────────────────────────────────────────────────

// async function generateInterviewReport({
//   resume,
//   selfDescription,
//   jobDescription,
//   title,
// }) {
//   const prompt = `You are a senior technical interviewer and career coach.
// Generate a comprehensive, personalised interview preparation report.

// ═══════════════════════════════════════════════════════
// STRICT RULES — VIOLATING ANY RULE = BROKEN OUTPUT
// ═══════════════════════════════════════════════════════

// [1] matchScore = plain integer like 72. NEVER "72%" string.

// [2] EVERY question MUST be a complete object with ALL 5 fields populated:
// {
//   "question": "How does JWT authentication work in your HireBot project?",
//   "difficulty": "Medium",
//   "intention": "Tests authentication knowledge and ability to connect theory to real project implementation.",
//   "answer": "JWT stands for JSON Web Token and it is how I implemented authentication in HireBot. When a user logs in, my auth controller calls jwt.sign() with the user ID and role as the payload, signed with a secret key from environment variables. The resulting token is stored in an HTTP-only cookie so JavaScript cannot access it, which protects against XSS attacks. On every protected API request, my auth middleware reads this cookie, verifies the signature using jwt.verify(), and checks my MongoDB BlacklistToken collection to confirm the token has not been invalidated by a logout. If all checks pass, the user object is attached to req.user and the next middleware runs. I chose this approach over localStorage because HTTP-only cookies are much safer for sensitive tokens.",
//   "keyPoints": ["Header.Payload.Signature structure", "HTTP-only cookie prevents XSS", "jwt.verify() validates signature + expiry", "BlacklistToken enables real logout"]
// }

// ❌ NEVER: answer: ""
// ❌ NEVER: answer: "You should mention JWT..."
// ❌ NEVER: answer: "Use the STAR method"
// ❌ NEVER: plain string arrays

// [3] Behavioral answers = full STAR prose (5+ sentences):
// "Situation: [specific context from candidate's experience]. My task was [specific responsibility]. I approached this by [detailed action steps with technologies]. The result was [measurable outcome]."

// [4] preparationPlan — CRITICAL:
// - focus = SHORT TOPIC (max 8 words). Example: "React Hooks fundamentals"
// - tasks = EXACTLY 4 short 1-line action items. Example:
//   ["Read official React docs section on useState and useEffect",
//    "Build a small counter app using hooks only — no class components",
//    "Refactor one component in your HireBot project to use custom hooks",
//    "Practice explaining hooks out loud in 60 seconds and record yourself"]
// - NEVER: tasks: []
// - NEVER: tasks: null
// - NEVER: put description text inside focus

// ═══════════════════════════════════════════════════════
// Job Title: ${title}
// Resume: ${resume || "Not provided"}
// Self Description: ${selfDescription || "Not provided"}
// Job Description: ${jobDescription}
// ═══════════════════════════════════════════════════════

// GENERATE:
// matchScore: honest integer comparing resume skills to JD requirements

// technicalQuestions (8-12 objects):
// - Derive from JD required skills + candidate's actual projects
// - Reference project names from resume in questions
// - 30% Easy / 50% Medium / 20% Hard distribution
// - FULL SPOKEN answer for EVERY question (5+ sentences, first person)

// behavioralQuestions (5-7 objects):
// - Reference candidate's actual internship/projects
// - Full STAR prose answer for EVERY question

// skillGaps: only genuine gaps vs this specific JD (3-6 items)

// preparationPlan day count:
// - matchScore ≥ 75 → 3-5 days (strong candidate)
// - matchScore 55-74 → 6-9 days (moderate gaps)
// - matchScore < 55 → 10-14 days (significant gaps)
// - Day 1 = most critical skill gap
// - Second-to-last day = full mock interview simulation
// - Last day = rest, logistics, confidence`;

//   return await callGemini(prompt, interviewReportSchema);
// }

// // ─── generateAnswerIfMissing — POSITIONAL MATCHING ────────────────────────────
// // WHY POSITIONAL: Asking Gemini to return {index: N, answer: "..."} is unreliable
// // because Gemini sometimes ignores the index field or returns wrong values.
// // Positional = answers returned IN ORDER matching input questions.
// // Simple array zip: questions[i].answer = result.answers[i].answer
// // 100% reliable because Gemini is very good at maintaining array order.
// async function generateAnswerIfMissing(questions, jobDescription, title) {
//   const emptyCount = questions.filter(
//     (q) => !q.answer || q.answer.trim().length < 50,
//   ).length;
//   if (emptyCount === 0) return questions;

//   console.log(
//     `[AI] ${emptyCount}/${questions.length} empty answers — positional answer generator running...`,
//   );

//   const numbered = questions
//     .map((q, i) => `${i + 1}. ${q.question}`)
//     .join("\n");

//   const prompt = `You are a senior technical interviewer and career coach.
// Role: ${title}
// Job Description: ${jobDescription}

// For each question below, generate a COMPLETE MODEL ANSWER.

// ⚠️  STRICT RULES — NO EXCEPTIONS:
// - Return answers IN THE EXACT SAME ORDER as the question list below
// - answer: minimum 5 sentences spoken as if the CANDIDATE is answering in the interview
// - Start with "I" or a direct factual statement ("JWT is...", "The Virtual DOM...")
// - Reference specific technologies and project names where relevant
// - Behavioral answers MUST be full STAR prose: Situation → Task → Action → Result
// - intention: 1-2 sentences WHY interviewers specifically ask this question
// - keyPoints: 3-4 bullet points the candidate MUST cover
// - NEVER write "you should mention X" or "use STAR method" — write the ACTUAL ANSWER
// - NEVER return empty answer field
// - Return EXACTLY ${questions.length} answers, one per question, in order

// Questions:
// ${numbered}`;

//   try {
//     const result = await callGemini(prompt, answersPositionalSchema);
//     if (!Array.isArray(result?.answers) || result.answers.length === 0) {
//       console.error("[AI] Answer generator returned empty array");
//       return questions;
//     }

//     // POSITIONAL MERGE: zip by array position
//     return questions.map((q, i) => {
//       const a = result.answers[i];
//       if (!a) return q;
//       return {
//         ...q,
//         intention: a.intention?.trim().length > 5 ? a.intention : q.intention,
//         answer: a.answer?.trim().length > 50 ? a.answer : q.answer,
//         keyPoints: a.keyPoints?.length > 0 ? a.keyPoints : q.keyPoints,
//       };
//     });
//   } catch (err) {
//     console.error("[AI] Answer generator failed:", err.message);
//     return questions;
//   }
// }

// // ─── generateTasksIfMissing — POSITIONAL MATCHING ────────────────────────────
// async function generateTasksIfMissing(plan, jobDescription, skillGaps) {
//   // First: fix any focus fields that contain description text (Gemini bug)
//   const fixedPlan = plan.map((day) => {
//     let focus = String(day.focus || "").trim();
//     if (focus.length > 60) {
//       focus = focus.split(/[.!\n]/)[0].trim();
//       if (focus.length > 60) focus = focus.substring(0, 55).trim() + "…";
//     }
//     return { ...day, focus };
//   });

//   const emptyCount = fixedPlan.filter(
//     (d) => !d.tasks || d.tasks.length === 0,
//   ).length;
//   if (emptyCount === 0) return fixedPlan;

//   console.log(
//     `[AI] ${emptyCount}/${fixedPlan.length} days with empty tasks — positional task generator running...`,
//   );

//   const gaps =
//     skillGaps.map((g) => g.skill).join(", ") || "general interview preparation";
//   const numbered = fixedPlan
//     .map((d, i) => `${i + 1}. Day ${d.day}: ${d.focus}`)
//     .join("\n");

//   const prompt = `You are an expert career coach building an interview preparation plan.
// Job Description: ${jobDescription.substring(0, 600)}
// Skill gaps to address: ${gaps}

// For each day below, generate EXACTLY 4 concrete tasks.

// ⚠️  STRICT RULES:
// - Return task arrays IN THE EXACT SAME ORDER as the day list below
// - Each task = ONE specific action completable in 30-60 minutes
// - Be specific: not "learn Google Ads" → "Create a dummy Search campaign in Google Ads interface and explore bidding options"
// - Tasks logically progress: learn → understand → practice → simulate/apply
// - Reference real tools, platforms, and resources
// - NEVER return empty tasks array
// - Return EXACTLY ${fixedPlan.length} day objects, in order

// Days:
// ${numbered}`;

//   try {
//     const result = await callGemini(prompt, tasksPositionalSchema);
//     if (!Array.isArray(result?.days) || result.days.length === 0) {
//       console.error("[AI] Task generator returned empty array");
//       return fixedPlan;
//     }

//     // POSITIONAL MERGE: zip by array position
//     return fixedPlan.map((day, i) => {
//       const d = result.days[i];
//       if (!d || !Array.isArray(d.tasks) || d.tasks.length === 0) return day;
//       return { ...day, tasks: d.tasks };
//     });
//   } catch (err) {
//     console.error("[AI] Task generator failed:", err.message);
//     return fixedPlan;
//   }
// }

// // ─── analyzeResume ────────────────────────────────────────────────────────────
// async function analyzeResume({ resume, jobDescription, jobRole }) {
//   const prompt = `You are a senior ATS system, recruiter, and career intelligence engine.
// Analyze this resume against the job description. Return a complete hiring intelligence report.

// MANDATORY: All numeric scores = plain integers (no % signs, no strings).
// MANDATORY: Use EXACTLY these camelCase keys:
//   overallScore, atsScore, skillsMatch, experienceMatch, keywordsMatch,
//   missingSkills, skillGaps, problems, suggestions, bulletRewrites, goodParts, weakParts,
//   scoreBreakdown, hiringDiagnosis, skillGapIntelligence, rankedSuggestions, actionPlan, hiringOutlook

// Job Role: ${jobRole || "Auto-detect from JD"}

// Job Description:
// ${jobDescription}

// Resume:
// ${resume}

// ANALYSIS INSTRUCTIONS:
// 1. overallScore — holistic match quality for THIS specific JD
// 2. atsScore — will automated filters pass this resume?
// 3. skillsMatch — % of required skills actually present
// 4. experienceMatch — does the experience LEVEL match JD requirements?
// 5. keywordsMatch — % of JD keywords found verbatim in resume

// scoreBreakdown (4-5 factors): One honest sentence per factor. Reference actual resume content.

// hiringDiagnosis:
// - primaryConcern: #1 blocker with specific evidence from resume
// - secondaryGaps: 2-4 real secondary concerns
// - strengths: 2-4 genuine strengths for this role

// skillGapIntelligence (3-5 most important):
// - whyMissing: cite the specific section where this is absent
// - hiringEffect: what happens at each screening stage
// - fixPlan: 2-3 concrete steps with specific resources

// rankedSuggestions: sorted high→medium→low impact

// actionPlan: mustFix (2-4 critical), nextPriority (2-4 medium), optional (1-3)

// hiringOutlook:
// - shortlistProbability: honest 0-100 integer
// - interviewConversion: probability of passing technical screen
// - riskLevel: low/medium/high
// - rejectionReasons: top 3 specific realistic rejection reasons
// - verdict: 1-2 sentence recruiter-voice assessment (honest, not encouraging)

// bulletRewrites (2-3):
// - original: copy verbatim from resume
// - improved: starts with strong action verb + quantified metric
// - Must be distinctly different from original`;

//   return await callGemini(prompt, resumeAnalysisSchema);
// }

// async function rankCandidate({
//   resume,
//   jobDescription,
//   jobTitle,
//   requiredSkills,
// }) {
//   const prompt = `Expert recruiter. Evaluate candidate. Plain integer camelCase fields: matchScore, skillsMatch, experienceMatch, keywordsMatch.
// Job: ${jobTitle} | Skills: ${requiredSkills.join(", ")} | JD: ${jobDescription} | Resume: ${resume}`;
//   return await callGemini(prompt, candidateRankingSchema);
// }

// async function enhanceJobDescription({
//   title,
//   description,
//   requiredSkills,
//   experienceLevel,
// }) {
//   const prompt = `Improve this job posting. camelCase fields: enhancedDescription, suggestedSkills, suggestedTitle.
// Title: ${title} | Level: ${experienceLevel} | Skills: ${requiredSkills.join(", ")} | Current: ${description}`;
//   return await callGemini(prompt, jobEnhancementSchema);
// }

// async function rewriteBulletPoint({ bulletPoint, jobRole, jobDescription }) {
//   const prompt = `Expert resume writer. camelCase fields: improved, explanation.
// Role: ${jobRole || "Not specified"} | JD: ${jobDescription || "Not provided"}
// Original: "${bulletPoint}"
// Rules: strong action verb, quantified impact, 1-2 lines, ATS-friendly, no invented facts.`;
//   return await callGemini(prompt, bulletRewriteSchema);
// }

// async function generateResumePdf({ resume, selfDescription, jobDescription }) {
//   const prompt = `Professional ATS-friendly resume in HTML. Return JSON with key "html".
// Resume: ${resume} | Self: ${selfDescription || "Not provided"} | JD: ${jobDescription}
// Requirements: tailored for JD, clean CSS, ATS-friendly, 1-2 pages, sections: Summary/Skills/Experience/Projects/Education.`;
//   try {
//     const ai = getClient();
//     const resp = await ai.models.generateContent({
//       model: MODEL,
//       contents: prompt,
//       config: {
//         responseMimeType: "application/json",
//         responseSchema: zodToJsonSchema(resumePdfSchema),
//       },
//     });
//     return await generatePdfFromHtml(JSON.parse(resp.text).html);
//   } catch (err) {
//     if (err?.status === 429 || err?.message?.includes("RESOURCE_EXHAUSTED")) {
//       nextKey();
//       return generateResumePdf({ resume, selfDescription, jobDescription });
//     }
//     throw err;
//   }
// }

// async function generatePdfFromHtml(html) {
//   const browser = await puppeteer.launch({
//     headless: true,
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//   });
//   const page = await browser.newPage();
//   await page.setContent(html, { waitUntil: "networkidle0" });
//   const buf = await page.pdf({
//     format: "A4",
//     margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
//     printBackground: true,
//   });
//   await browser.close();
//   return buf;
// }

// module.exports = {
//   generateInterviewReport,
//   generateAnswerIfMissing,
//   generateTasksIfMissing,
//   analyzeResume,
//   rankCandidate,
//   enhanceJobDescription,
//   rewriteBulletPoint,
//   generateResumePdf,
// };

const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

const MODEL = "gemini-2.5-flash-lite";

// ─── Key rotation ─────────────────────────────────────────────────────────────
const API_KEYS = [
  process.env.GOOGLE_GENAI_API_KEY_1,
  process.env.GOOGLE_GENAI_API_KEY_2,
].filter(Boolean);

if (!API_KEYS.length) throw new Error("No Gemini API keys found.");

let keyIdx = 0;
function getClient() {
  return new GoogleGenAI({ apiKey: API_KEYS[keyIdx] });
}
function nextKey() {
  const next = (keyIdx + 1) % API_KEYS.length;
  if (next === keyIdx) throw new Error("All Gemini keys exhausted.");
  keyIdx = next;
  console.log(`[AI] Switched to key ${keyIdx + 1}/${API_KEYS.length}`);
}

// ─── callGemini — uses Zod responseSchema (for structured first-pass calls) ──
async function callGemini(prompt, schema, retried = false) {
  try {
    const ai = getClient();
    const resp = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: zodToJsonSchema(schema),
      },
    });
    return JSON.parse(resp.text);
  } catch (err) {
    const quota =
      err?.status === 429 ||
      err?.message?.includes("RESOURCE_EXHAUSTED") ||
      err?.message?.includes("quota");
    if (quota && !retried) {
      nextKey();
      return callGemini(prompt, schema, true);
    }
    throw err;
  }
}

// ─── callGeminiRaw — NO responseSchema (most reliable for retry/fill calls) ──
// ROOT CAUSE FIX: zodToJsonSchema() produces JSON Schema properties that
// Gemini's responseSchema does not fully support ($schema, additionalProperties,
// complex describe() annotations). This causes Gemini to silently return empty
// arrays. Removing responseSchema and prompting for JSON directly is far more
// reliable for the answer/task fill-in calls.
async function callGeminiRaw(prompt, retried = false) {
  try {
    const ai = getClient();
    const resp = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // No responseSchema — Gemini returns free-form JSON guided by prompt only
      },
    });
    // Strip accidental markdown fences (```json ... ```) before parsing
    const text = (resp.text || "").replace(/```json\s*|\s*```/g, "").trim();
    return JSON.parse(text);
  } catch (err) {
    const quota =
      err?.status === 429 ||
      err?.message?.includes("RESOURCE_EXHAUSTED") ||
      err?.message?.includes("quota");
    if (quota && !retried) {
      nextKey();
      return callGeminiRaw(prompt, true);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS  (used only in callGemini — not in the raw retry calls)
// ─────────────────────────────────────────────────────────────────────────────

const questionSchema = z.object({
  question: z
    .string()
    .describe("Clean interview question text — one sentence only"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  intention: z
    .string()
    .describe("1-2 sentences: specifically why interviewers ask this question"),
  answer: z
    .string()
    .describe(
      "FULL SPOKEN MODEL ANSWER — minimum 5 sentences as if the CANDIDATE IS SPEAKING in the interview room. Must start with 'I' or a direct factual statement. NEVER write coaching hints. NEVER empty.",
    ),
  keyPoints: z
    .array(z.string())
    .describe("3-4 key points the candidate must cover"),
});

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .describe("Plain integer 0-100. NEVER a string like '75%'."),
  technicalQuestions: z
    .array(questionSchema)
    .describe(
      "8-12 questions. EVERY answer field is a FULL SPOKEN RESPONSE (5+ sentences). NEVER empty.",
    ),
  behavioralQuestions: z
    .array(questionSchema)
    .describe("5-7 questions. EVERY answer uses full STAR prose. NEVER empty."),
  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    }),
  ),
  preparationPlan: z
    .array(
      z.object({
        day: z.number(),
        focus: z
          .string()
          .describe(
            "SHORT topic name — maximum 8 words. Do NOT put tasks or descriptions here.",
          ),
        tasks: z
          .array(z.string())
          .describe("EXACTLY 4 concrete 1-line tasks. NEVER empty array."),
      }),
    )
    .describe("EVERY day MUST have 4 tasks. tasks array CANNOT be empty."),
  title: z.string(),
});

// ─── Resume analysis schema ────────────────────────────────────────────────────
const resumeAnalysisSchema = z.object({
  overallScore: z.number(),
  atsScore: z.number(),
  skillsMatch: z.number(),
  experienceMatch: z.number(),
  keywordsMatch: z.number(),
  missingSkills: z.array(z.string()),
  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    }),
  ),
  problems: z.array(z.string()),
  suggestions: z.array(z.string()),
  bulletRewrites: z.array(
    z.object({ original: z.string(), improved: z.string() }),
  ),
  goodParts: z.array(z.string()),
  weakParts: z.array(z.string()),
  scoreBreakdown: z.array(
    z.object({ factor: z.string(), score: z.number(), reason: z.string() }),
  ),
  hiringDiagnosis: z.object({
    primaryConcern: z.string(),
    secondaryGaps: z.array(z.string()),
    strengths: z.array(z.string()),
  }),
  skillGapIntelligence: z.array(
    z.object({
      skill: z.string(),
      impact: z.enum(["high", "medium", "low"]),
      whyMissing: z.string(),
      hiringEffect: z.string(),
      fixPlan: z.array(z.string()),
    }),
  ),
  rankedSuggestions: z.array(
    z.object({ text: z.string(), impact: z.enum(["high", "medium", "low"]) }),
  ),
  actionPlan: z.object({
    mustFix: z.array(z.string()),
    nextPriority: z.array(z.string()),
    optional: z.array(z.string()),
  }),
  hiringOutlook: z.object({
    shortlistProbability: z.number(),
    interviewConversion: z.number(),
    riskLevel: z.enum(["low", "medium", "high"]),
    rejectionReasons: z.array(z.string()),
    verdict: z.string(),
  }),
});

const candidateRankingSchema = z.object({
  matchScore: z.number(),
  skillsMatch: z.number(),
  experienceMatch: z.number(),
  keywordsMatch: z.number(),
  aiSummary: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  missingSkills: z.array(z.string()),
});
const jobEnhancementSchema = z.object({
  enhancedDescription: z.string(),
  suggestedSkills: z.array(z.string()),
  suggestedTitle: z.string(),
});
const resumePdfSchema = z.object({ html: z.string() });
const bulletRewriteSchema = z.object({
  improved: z.string(),
  explanation: z.string(),
});

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
  title,
}) {
  const prompt = `You are a senior technical interviewer and career coach.
Generate a comprehensive, personalised interview preparation report.

═══════════════════════════════════════════════════════
STRICT RULES — VIOLATING ANY RULE = BROKEN OUTPUT
═══════════════════════════════════════════════════════

[1] matchScore = plain integer like 72. NEVER "72%" string.

[2] EVERY question MUST be a complete object with ALL 5 fields populated:
{
  "question": "How does JWT authentication work in your HireBot project?",
  "difficulty": "Medium",
  "intention": "Tests authentication knowledge and ability to connect theory to real project implementation.",
  "answer": "JWT stands for JSON Web Token and it is how I implemented authentication in HireBot. When a user logs in, my auth controller calls jwt.sign() with the user ID and role as the payload, signed with a secret key from environment variables. The resulting token is stored in an HTTP-only cookie so JavaScript cannot access it, which protects against XSS attacks. On every protected API request, my auth middleware reads this cookie, verifies the signature using jwt.verify(), and checks my MongoDB BlacklistToken collection to confirm the token has not been invalidated by a logout. If all checks pass, the user object is attached to req.user and the next middleware runs. I chose this approach over localStorage because HTTP-only cookies are much safer for sensitive tokens.",
  "keyPoints": ["Header.Payload.Signature structure", "HTTP-only cookie prevents XSS", "jwt.verify() validates signature + expiry", "BlacklistToken enables real logout"]
}

❌ NEVER: answer: ""
❌ NEVER: answer: "You should mention JWT..."
❌ NEVER: answer: "Use the STAR method"
❌ NEVER: plain string arrays

[3] Behavioral answers = full STAR prose (5+ sentences):
"Situation: [specific context from candidate's experience]. My task was [specific responsibility]. I approached this by [detailed action steps with technologies]. The result was [measurable outcome]."

[4] preparationPlan — CRITICAL:
- focus = SHORT TOPIC (max 8 words). Example: "React Hooks fundamentals"
- tasks = EXACTLY 4 short 1-line action items. Example:
  ["Read official React docs section on useState and useEffect",
   "Build a small counter app using hooks only — no class components",
   "Refactor one component in your HireBot project to use custom hooks",
   "Practice explaining hooks out loud in 60 seconds and record yourself"]
- NEVER: tasks: []
- NEVER: tasks: null
- NEVER: put description text inside focus

═══════════════════════════════════════════════════════
Job Title: ${title}
Resume: ${resume || "Not provided"}
Self Description: ${selfDescription || "Not provided"}
Job Description: ${jobDescription}
═══════════════════════════════════════════════════════

GENERATE:
matchScore: honest integer comparing resume skills to JD requirements

technicalQuestions (8-12 objects):
- Derive from JD required skills + candidate's actual projects
- Reference project names from resume in questions
- 30% Easy / 50% Medium / 20% Hard distribution
- FULL SPOKEN answer for EVERY question (5+ sentences, first person)

behavioralQuestions (5-7 objects):
- Reference candidate's actual internship/projects
- Full STAR prose answer for EVERY question

skillGaps: only genuine gaps vs this specific JD (3-6 items)

preparationPlan day count:
- matchScore ≥ 75 → 3-5 days (strong candidate)
- matchScore 55-74 → 6-9 days (moderate gaps)
- matchScore < 55 → 10-14 days (significant gaps)
- Day 1 = most critical skill gap
- Second-to-last day = full mock interview simulation
- Last day = rest, logistics, confidence`;

  return await callGemini(prompt, interviewReportSchema);
}

// ─── generateAnswerIfMissing ──────────────────────────────────────────────────
// FIX: Uses callGeminiRaw (no responseSchema) instead of callGemini + Zod schema.
// zodToJsonSchema produces properties Gemini's responseSchema ignores, causing
// it to return empty arrays silently. Plain JSON prompting is 100% reliable.
async function generateAnswerIfMissing(questions, jobDescription, title) {
  const emptyCount = questions.filter(
    (q) => !q.answer || q.answer.trim().length < 50,
  ).length;
  if (emptyCount === 0) return questions;

  console.log(
    `[AI] ${emptyCount}/${questions.length} empty answers — raw answer generator running...`,
  );

  const numbered = questions
    .map((q, i) => `${i + 1}. ${q.question}`)
    .join("\n");

  // ── PROMPT: explicit JSON structure example removes all ambiguity ──────────
  const prompt = `You are a senior technical interviewer and career coach.
Role: ${title}
Job Description: ${jobDescription}

Return a JSON object in EXACTLY this structure — no extra keys, no markdown:
{
  "answers": [
    {
      "intention": "1-2 sentences why interviewers ask this specific question",
      "answer": "Full spoken model answer — minimum 5 sentences. Write as if the CANDIDATE is speaking in the interview room. Start with I or a direct factual statement. Be specific about technologies and project names. NEVER write hints or coaching tips. NEVER leave blank.",
      "keyPoints": ["point 1", "point 2", "point 3", "point 4"]
    }
  ]
}

RULES:
- Return EXACTLY ${questions.length} objects in the answers array — one per question, in the same order
- answer: minimum 5 full sentences, first person, specific to the role and projects
- Behavioral questions: use full STAR prose (Situation → Task → Action → Result)
- Technical questions: explain the concept then connect it to a real project example
- keyPoints: exactly 3-4 bullet points the candidate must cover
- intention: why does an interviewer specifically ask THIS question
- NEVER return an empty answers array
- NEVER return fewer than ${questions.length} answers

Questions (answer them in this exact order):
${numbered}`;

  try {
    const result = await callGeminiRaw(prompt);

    if (
      !result ||
      !Array.isArray(result.answers) ||
      result.answers.length === 0
    ) {
      console.error(
        "[AI] Raw answer generator returned no answers — result:",
        JSON.stringify(result)?.slice(0, 200),
      );
      return questions;
    }

    console.log(
      `[AI] Raw answer generator returned ${result.answers.length} answers`,
    );

    // Positional merge: questions[i] gets result.answers[i]
    return questions.map((q, i) => {
      const a = result.answers[i];
      if (!a) return q;
      return {
        ...q,
        intention:
          typeof a.intention === "string" && a.intention.trim().length > 5
            ? a.intention.trim()
            : q.intention,
        answer:
          typeof a.answer === "string" && a.answer.trim().length > 50
            ? a.answer.trim()
            : q.answer,
        keyPoints:
          Array.isArray(a.keyPoints) && a.keyPoints.length > 0
            ? a.keyPoints
            : q.keyPoints,
      };
    });
  } catch (err) {
    console.error("[AI] Raw answer generator failed:", err.message);
    return questions;
  }
}

// ─── generateTasksIfMissing ────────────────────────────────────────────────────
// FIX: Same raw approach — no responseSchema, explicit JSON structure in prompt.
async function generateTasksIfMissing(plan, jobDescription, skillGaps) {
  // First: fix any focus fields that contain description text (Gemini bug)
  const fixedPlan = plan.map((day) => {
    let focus = String(day.focus || "").trim();
    if (focus.length > 60) {
      focus = focus.split(/[.!\n]/)[0].trim();
      if (focus.length > 60) focus = focus.substring(0, 55).trim() + "…";
    }
    return { ...day, focus };
  });

  const emptyCount = fixedPlan.filter(
    (d) => !d.tasks || d.tasks.length === 0,
  ).length;
  if (emptyCount === 0) return fixedPlan;

  console.log(
    `[AI] ${emptyCount}/${fixedPlan.length} days with empty tasks — raw task generator running...`,
  );

  const gaps =
    skillGaps.map((g) => g.skill).join(", ") || "general interview preparation";
  const numbered = fixedPlan
    .map((d, i) => `${i + 1}. Day ${d.day}: ${d.focus}`)
    .join("\n");

  // ── PROMPT: explicit JSON structure example removes all ambiguity ──────────
  const prompt = `You are an expert career coach building an interview preparation plan.
Job Description: ${jobDescription.substring(0, 600)}
Skill gaps to address: ${gaps}

Return a JSON object in EXACTLY this structure — no extra keys, no markdown:
{
  "days": [
    {
      "tasks": [
        "Specific task 1 completable in 30-60 minutes",
        "Specific task 2 completable in 30-60 minutes",
        "Specific task 3 completable in 30-60 minutes",
        "Specific task 4 completable in 30-60 minutes"
      ]
    }
  ]
}

RULES:
- Return EXACTLY ${fixedPlan.length} objects in the days array — one per day, in the same order
- Each day MUST have EXACTLY 4 tasks
- Tasks must be specific and actionable — not vague ("learn SQL" → "Write 5 JOIN queries using a sample e-commerce database on SQLZoo or LeetCode")
- Tasks logically progress: learn → understand → practice → simulate
- Reference real tools and platforms (LeetCode, MDN, YouTube, etc.)
- NEVER return an empty tasks array
- NEVER return fewer than ${fixedPlan.length} day objects

Days (generate 4 tasks for each, in this exact order):
${numbered}`;

  try {
    const result = await callGeminiRaw(prompt);

    if (!result || !Array.isArray(result.days) || result.days.length === 0) {
      console.error(
        "[AI] Raw task generator returned no days — result:",
        JSON.stringify(result)?.slice(0, 200),
      );
      return fixedPlan;
    }

    console.log(`[AI] Raw task generator returned ${result.days.length} days`);

    // Positional merge: fixedPlan[i] gets result.days[i].tasks
    return fixedPlan.map((day, i) => {
      const d = result.days[i];
      if (!d || !Array.isArray(d.tasks) || d.tasks.length === 0) return day;
      return { ...day, tasks: d.tasks };
    });
  } catch (err) {
    console.error("[AI] Raw task generator failed:", err.message);
    return fixedPlan;
  }
}

// ─── analyzeResume ────────────────────────────────────────────────────────────
async function analyzeResume({ resume, jobDescription, jobRole }) {
  const prompt = `You are a senior ATS system, recruiter, and career intelligence engine.
Analyze this resume against the job description. Return a complete hiring intelligence report.

MANDATORY: All numeric scores = plain integers (no % signs, no strings).
MANDATORY: Use EXACTLY these camelCase keys:
  overallScore, atsScore, skillsMatch, experienceMatch, keywordsMatch,
  missingSkills, skillGaps, problems, suggestions, bulletRewrites, goodParts, weakParts,
  scoreBreakdown, hiringDiagnosis, skillGapIntelligence, rankedSuggestions, actionPlan, hiringOutlook

Job Role: ${jobRole || "Auto-detect from JD"}

Job Description:
${jobDescription}

Resume:
${resume}

ANALYSIS INSTRUCTIONS:
1. overallScore — holistic match quality for THIS specific JD
2. atsScore — will automated filters pass this resume?
3. skillsMatch — % of required skills actually present
4. experienceMatch — does the experience LEVEL match JD requirements?
5. keywordsMatch — % of JD keywords found verbatim in resume

scoreBreakdown (4-5 factors): One honest sentence per factor. Reference actual resume content.

hiringDiagnosis:
- primaryConcern: #1 blocker with specific evidence from resume
- secondaryGaps: 2-4 real secondary concerns
- strengths: 2-4 genuine strengths for this role

skillGapIntelligence (3-5 most important):
- whyMissing: cite the specific section where this is absent
- hiringEffect: what happens at each screening stage
- fixPlan: 2-3 concrete steps with specific resources

rankedSuggestions: sorted high→medium→low impact

actionPlan: mustFix (2-4 critical), nextPriority (2-4 medium), optional (1-3)

hiringOutlook:
- shortlistProbability: honest 0-100 integer
- interviewConversion: probability of passing technical screen
- riskLevel: low/medium/high
- rejectionReasons: top 3 specific realistic rejection reasons
- verdict: 1-2 sentence recruiter-voice assessment (honest, not encouraging)

bulletRewrites (2-3):
- original: copy verbatim from resume
- improved: starts with strong action verb + quantified metric
- Must be distinctly different from original`;

  return await callGemini(prompt, resumeAnalysisSchema);
}

async function rankCandidate({
  resume,
  jobDescription,
  jobTitle,
  requiredSkills,
}) {
  const prompt = `Expert recruiter. Evaluate candidate. Plain integer camelCase fields: matchScore, skillsMatch, experienceMatch, keywordsMatch.
Job: ${jobTitle} | Skills: ${requiredSkills.join(", ")} | JD: ${jobDescription} | Resume: ${resume}`;
  return await callGemini(prompt, candidateRankingSchema);
}

async function enhanceJobDescription({
  title,
  description,
  requiredSkills,
  experienceLevel,
}) {
  const prompt = `Improve this job posting. camelCase fields: enhancedDescription, suggestedSkills, suggestedTitle.
Title: ${title} | Level: ${experienceLevel} | Skills: ${requiredSkills.join(", ")} | Current: ${description}`;
  return await callGemini(prompt, jobEnhancementSchema);
}

async function rewriteBulletPoint({ bulletPoint, jobRole, jobDescription }) {
  const prompt = `Expert resume writer. camelCase fields: improved, explanation.
Role: ${jobRole || "Not specified"} | JD: ${jobDescription || "Not provided"}
Original: "${bulletPoint}"
Rules: strong action verb, quantified impact, 1-2 lines, ATS-friendly, no invented facts.`;
  return await callGemini(prompt, bulletRewriteSchema);
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const prompt = `Professional ATS-friendly resume in HTML. Return JSON with key "html".
Resume: ${resume} | Self: ${selfDescription || "Not provided"} | JD: ${jobDescription}
Requirements: tailored for JD, clean CSS, ATS-friendly, 1-2 pages, sections: Summary/Skills/Experience/Projects/Education.`;
  try {
    const ai = getClient();
    const resp = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: zodToJsonSchema(resumePdfSchema),
      },
    });
    return await generatePdfFromHtml(JSON.parse(resp.text).html);
  } catch (err) {
    if (err?.status === 429 || err?.message?.includes("RESOURCE_EXHAUSTED")) {
      nextKey();
      return generateResumePdf({ resume, selfDescription, jobDescription });
    }
    throw err;
  }
}

async function generatePdfFromHtml(html) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const buf = await page.pdf({
    format: "A4",
    margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    printBackground: true,
  });
  await browser.close();
  return buf;
}

module.exports = {
  generateInterviewReport,
  generateAnswerIfMissing,
  generateTasksIfMissing,
  analyzeResume,
  rankCandidate,
  enhanceJobDescription,
  rewriteBulletPoint,
  generateResumePdf,
};
