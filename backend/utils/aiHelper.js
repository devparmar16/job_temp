import { GoogleGenerativeAI } from "@google/generative-ai";
import ErrorHandler from "../middlewares/error.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getAtsScore = async (resumeText, requiredSkills) => {
    const maxLength = 3000;
    const truncatedResumeText = resumeText.length > maxLength ? resumeText.substring(0, maxLength) : resumeText;

    const prompt = `
You are an expert ATS analyzer. Analyze the resume against the job requirements and provide a detailed score based on multiple criteria.

JOB REQUIREMENTS:
- Skills: ${requiredSkills.join(', ')}
- Preferred Experience: At least 2 years of relevant experience (if not specified, assume this as a baseline).
- Preferred Education: Bachelor's degree or higher, with a CGPA of 3.0 or above (if not specified, assume this as a baseline).

RESUME CONTENT:
${truncatedResumeText}

ANALYSIS INSTRUCTIONS:
1. Skills Analysis:
   - Check for each required skill, including variations and related terms (e.g., 'js' for 'javascript', 'reactjs' for 'react').
   - Evaluate expertise level for each skill based on years of experience, project complexity, or specific achievements.
2. Experience Analysis:
   - Identify the candidate's total years of relevant work experience.
   - Evaluate the relevance of their experience to the job requirements (e.g., specific projects, roles, or responsibilities).
3. Education Analysis:
   - Extract the candidate's highest degree and CGPA (if mentioned).
   - Assess if the degree is relevant to the job (e.g., Computer Science for a tech role).
   - Evaluate the CGPA: Consider a CGPA ≥ 3.0 as "good" (boosts the score), and < 3.0 as "average" (neutral or slight penalty).
4. Additional Factors:
   - Look for certifications, awards, or achievements that align with the job requirements.
   - Consider any other relevant details (e.g., leadership roles, publications).
5. Scoring:
   - Skills (40%): 90-100 for all skills with strong evidence, 70-89 for most skills with good evidence, 50-69 for some skills with moderate evidence, 30-49 for few skills with limited evidence, 0-29 for minimal or no skills.
   - Experience (30%): 90-100 for >5 years of relevant experience, 70-89 for 3-5 years, 50-69 for 1-2 years, 30-49 for <1 year, 0-29 for no relevant experience.
   - Education (20%): 90-100 for relevant degree with CGPA ≥ 3.5, 70-89 for relevant degree with CGPA 3.0-3.5, 50-69 for relevant degree with CGPA < 3.0, 30-49 for non-relevant degree or no CGPA, 0-29 for no degree.
   - Additional Factors (10%): 90-100 for multiple relevant certifications/achievements, 70-89 for some, 50-69 for minimal, 0-49 for none.
   - Combine the weighted scores for a final score out of 100.

RESPONSE FORMAT:
Score: [0-100]
Skills Analysis: [Detailed explanation of skill matches and expertise]
Experience Analysis: [Details of relevant experience, years, and relevance]
Education Analysis: [Degree, CGPA (if found), and relevance]
Additional Factors: [Certifications, awards, or other relevant details]
Matched Skills: [List of matched skills]
Missing Skills: [List of missing skills]
`;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });
        const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (!text) {
            throw new ErrorHandler('Empty response from AI.', 500);
        }

        const scoreMatch = text.match(/Score:\s*(\d+)/);
        let score = scoreMatch ? parseInt(scoreMatch[1]) : null;

        if (!score || score < 0 || score > 100) {
            const skillsArray = requiredSkills.map(skill => skill.toLowerCase());
            const resumeLower = resumeText.toLowerCase();
            const matchedSkills = skillsArray.filter(skill => resumeLower.includes(skill));
            const matchedSkillsCount = matchedSkills.length;
            score = Math.round((matchedSkillsCount / skillsArray.length) * 100) || 1;
        }
        return score;
    } catch (error) {
        console.error("Error getting ATS score:", error);
        // Fallback score calculation
        const skillsArray = requiredSkills.map(skill => skill.toLowerCase());
        const resumeLower = resumeText.toLowerCase();
        const matchedSkills = skillsArray.filter(skill => resumeLower.includes(skill));
        const matchedSkillsCount = matchedSkills.length;
        return Math.round((matchedSkillsCount / skillsArray.length) * 100) || 1;
    }
}; 