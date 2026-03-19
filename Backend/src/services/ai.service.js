const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

const MODEL = "gemini-2.0-flash";

// ─── Key Rotation ─────────────────────────────────────────────────────────────
const API_KEYS = [
  process.env.GOOGLE_GENAI_API_KEY_1,
  process.env.GOOGLE_GENAI_API_KEY_2,
].filter(Boolean);

if (API_KEYS.length === 0) {
  throw new Error(
    "No Gemini API keys found. Set GOOGLE_GENAI_API_KEY_1 in .env",
  );
}

let currentKeyIndex = 0;

function getClient() {
  return new GoogleGenAI({ apiKey: API_KEYS[currentKeyIndex] });
}

function switchToNextKey() {
  const nextIndex = (currentKeyIndex + 1) % API_KEYS.length;
  if (nextIndex === currentKeyIndex) {
    throw new Error(
      "All Gemini API keys have exceeded their quota. Please wait or add more keys.",
    );
  }
  currentKeyIndex = nextIndex;
  console.log(
    `[AI] Switched to API key ${currentKeyIndex + 1} of ${API_KEYS.length}`,
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────
async function callGemini(prompt, schema, retried = false) {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: zodToJsonSchema(schema),
      },
    });
    return JSON.parse(response.text);
  } catch (err) {
    const is429 =
      err?.status === 429 ||
      err?.message?.includes("429") ||
      err?.message?.includes("RESOURCE_EXHAUSTED") ||
      err?.message?.includes("quota");

    if (is429 && !retried) {
      console.warn(
        `[AI] Quota hit on key ${currentKeyIndex + 1}. Switching keys...`,
      );
      switchToNextKey();
      return callGemini(prompt, schema, true);
    }

    throw err;
  }
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .describe(
      "A score 0–100 indicating how well the candidate matches the job",
    ),
  technicalQuestions: z.array(
    z.object({
      question: z.string().describe("Technical interview question"),
      intention: z.string().describe("Why the interviewer asks this"),
      answer: z.string().describe("How to answer this question effectively"),
    }),
  ),
  behavioralQuestions: z.array(
    z.object({
      question: z.string().describe("Behavioral interview question"),
      intention: z.string().describe("Why the interviewer asks this"),
      answer: z.string().describe("How to answer this question effectively"),
    }),
  ),
  skillGaps: z.array(
    z.object({
      skill: z.string().describe("Skill the candidate is lacking"),
      severity: z
        .enum(["low", "medium", "high"])
        .describe("How critical this gap is for the role"),
    }),
  ),
  preparationPlan: z.array(
    z.object({
      day: z.number().describe("Day number starting from 1"),
      focus: z.string().describe("Main focus area for this day"),
      tasks: z.array(z.string()).describe("Tasks to complete on this day"),
    }),
  ),
  title: z.string().describe("Job title for this interview report"),
});

const resumeAnalysisSchema = z.object({
  overallScore: z.number().describe("Overall resume score out of 100"),
  atsScore: z.number().describe("ATS compatibility score out of 100"),
  skillsMatch: z
    .number()
    .describe("Percentage of required skills found in resume (0–100)"),
  experienceMatch: z
    .number()
    .describe("How well the experience matches the JD (0–100)"),
  keywordsMatch: z
    .number()
    .describe("Percentage of JD keywords found in resume (0–100)"),
  missingSkills: z
    .array(z.string())
    .describe("List of skills required in JD but missing from resume"),
  skillGaps: z
    .array(
      z.object({
        skill: z.string(),
        severity: z.enum(["low", "medium", "high"]),
      }),
    )
    .describe("Skill gaps with severity ratings"),
  problems: z
    .array(z.string())
    .describe(
      "Issues found: weak bullet points, missing metrics, ATS problems, etc.",
    ),
  suggestions: z
    .array(z.string())
    .describe("Actionable suggestions to improve the resume for this JD"),
  bulletRewrites: z
    .array(
      z.object({
        original: z.string().describe("The original weak bullet point"),
        improved: z
          .string()
          .describe("AI-rewritten version with metrics and impact"),
      }),
    )
    .describe("Improved versions of weak bullet points"),
  goodParts: z
    .array(z.string())
    .describe("Strong sections or achievements already in the resume"),
  weakParts: z
    .array(z.string())
    .describe("Weak sections that need improvement"),
});

const candidateRankingSchema = z.object({
  matchScore: z
    .number()
    .describe("How well the candidate matches the job (0–100)"),
  skillsMatch: z
    .number()
    .describe("Percentage of required skills the candidate has (0–100)"),
  experienceMatch: z
    .number()
    .describe("How well the candidate's experience matches the JD (0–100)"),
  keywordsMatch: z.number().describe("Keyword match percentage (0–100)"),
  aiSummary: z
    .string()
    .describe("2–3 sentence summary of the candidate for the recruiter"),
  strengths: z
    .array(z.string())
    .describe("Top strengths of the candidate for this role"),
  weaknesses: z
    .array(z.string())
    .describe("Key weaknesses or gaps of the candidate for this role"),
  missingSkills: z
    .array(z.string())
    .describe("Skills required for the job that the candidate lacks"),
});

const jobEnhancementSchema = z.object({
  enhancedDescription: z
    .string()
    .describe("Improved, clearer, more attractive job description"),
  suggestedSkills: z
    .array(z.string())
    .describe("Skills that should be required for this role"),
  suggestedTitle: z.string().describe("Optimized job title for better reach"),
});

const resumePdfSchema = z.object({
  html: z
    .string()
    .describe("Full HTML content of the resume for PDF conversion"),
});

const bulletRewriteSchema = z.object({
  improved: z
    .string()
    .describe(
      "Rewritten bullet point with stronger action verb, metrics and impact",
    ),
  explanation: z
    .string()
    .describe("Why this rewrite is better and what was improved"),
});

// ─── Service Functions ────────────────────────────────────────────────────────

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
  title,
}) {
  const prompt = `You are an expert career coach and technical interviewer.
Generate a comprehensive interview report for a candidate applying for: ${title}

Resume:
${resume}

Self Description:
${selfDescription || "Not provided"}

Job Description:
${jobDescription}

Analyze the candidate's profile against the job requirements and generate:
- A match score
- Relevant technical questions they may be asked
- Behavioral questions
- Skill gaps they need to address
- A day-wise preparation plan`;

  return await callGemini(prompt, interviewReportSchema);
}

async function analyzeResume({ resume, jobDescription, jobRole }) {
  const prompt = `You are an expert ATS system and career coach combined.
Analyze this resume against the job description and provide detailed feedback.

Job Role: ${jobRole || "Not specified"}

Job Description:
${jobDescription}

Resume Content:
${resume}

Provide:
1. Overall resume score (0–100) considering all factors
2. ATS compatibility score — does it pass automated screening?
3. Skills match % — how many required skills does the candidate have?
4. Experience match % — does their experience level fit?
5. Keywords match % — are the right keywords present?
6. Missing skills — what does the JD require that isn't in the resume?
7. Skill gaps with severity — which gaps hurt the most?
8. Problems — weak bullet points, missing metrics, ATS issues, vague language
9. Suggestions — specific, actionable improvements
10. Bullet point rewrites — take the 2–3 weakest bullet points and rewrite them with strong action verbs and measurable impact
11. Good parts — what's already strong in this resume?
12. Weak parts — what sections need the most work?

Be specific, honest and actionable. Focus on what will actually increase the candidate's chances.`;

  return await callGemini(prompt, resumeAnalysisSchema);
}

async function rankCandidate({
  resume,
  jobDescription,
  jobTitle,
  requiredSkills,
}) {
  const prompt = `You are an expert technical recruiter.
Evaluate this candidate's resume for the following job and provide a detailed assessment.

Job Title: ${jobTitle}
Required Skills: ${requiredSkills.join(", ")}

Job Description:
${jobDescription}

Candidate Resume:
${resume}

Provide:
1. Overall match score (0–100)
2. Skills match % — how many required skills does the candidate have?
3. Experience match % — does their background fit?
4. Keywords match % — are the right keywords present?
5. A short 2–3 sentence AI summary of this candidate for a recruiter
6. Top 3 strengths for this specific role
7. Top 3 weaknesses or gaps for this specific role
8. Missing skills from the JD

Be objective and focus on fit for this specific role.`;

  return await callGemini(prompt, candidateRankingSchema);
}

async function enhanceJobDescription({
  title,
  description,
  requiredSkills,
  experienceLevel,
}) {
  const prompt = `You are an expert technical recruiter and copywriter.
Improve this job posting to attract better candidates and be clearer about requirements.

Job Title: ${title}
Experience Level: ${experienceLevel}
Current Required Skills: ${requiredSkills.join(", ")}

Current Description:
${description}

Provide:
1. An enhanced, well-structured job description that is clear, attractive and specific
2. A complete list of skills that should be required for this role
3. An optimized job title if the current one could be improved

The enhanced description should be ATS-friendly, specific about responsibilities, and clearly communicate the role's impact.`;

  return await callGemini(prompt, jobEnhancementSchema);
}

async function rewriteBulletPoint({ bulletPoint, jobRole, jobDescription }) {
  const prompt = `You are an expert resume writer and career coach.
Rewrite this resume bullet point to be stronger, more impactful, and tailored for the target role.

Target Job Role: ${jobRole || "Not specified"}
Target Job Description: ${jobDescription || "Not provided"}

Original Bullet Point:
"${bulletPoint}"

Rules for rewriting:
- Start with a strong action verb
- Add measurable impact or metrics where possible (estimate if not given)
- Be specific about what was done and the outcome
- Keep it concise (1–2 lines max)
- Make it ATS-friendly with relevant keywords
- Do not make up facts — only enhance what's already implied`;

  return await callGemini(prompt, bulletRewriteSchema);
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const prompt = `You are an expert resume designer and career coach.
Generate a professional, ATS-friendly resume in HTML format for this candidate.

Resume Content:
${resume}

Self Description:
${selfDescription || "Not provided"}

Target Job Description:
${jobDescription}

Requirements:
- Tailor the resume for the given job description
- Highlight the most relevant skills and experience
- Use clean, professional HTML/CSS styling
- Keep it 1–2 pages when converted to PDF
- Make it ATS-friendly — avoid tables for main content, use standard section headers
- Use subtle color accents (not heavy colors) — keep it professional
- Do not sound AI-generated — write naturally and confidently
- Include all relevant sections: Summary, Experience, Skills, Education, Projects
- Quantify achievements wherever possible`;

  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: zodToJsonSchema(resumePdfSchema),
      },
    });
    const jsonContent = JSON.parse(response.text);
    return await generatePdfFromHtml(jsonContent.html);
  } catch (err) {
    const is429 =
      err?.status === 429 ||
      err?.message?.includes("429") ||
      err?.message?.includes("RESOURCE_EXHAUSTED") ||
      err?.message?.includes("quota");

    if (is429) {
      console.warn(
        `[AI] Quota hit on key ${currentKeyIndex + 1}. Switching keys...`,
      );
      switchToNextKey();
      return generateResumePdf({ resume, selfDescription, jobDescription });
    }
    throw err;
  }
}

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    printBackground: true,
  });

  await browser.close();
  return pdfBuffer;
}

module.exports = {
  generateInterviewReport,
  analyzeResume,
  rankCandidate,
  enhanceJobDescription,
  rewriteBulletPoint,
  generateResumePdf,
};
