import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: NextRequest) {
  try {
    const { resume, goals, requirements } = await request.json();

    if (!resume || !goals) {
      return NextResponse.json(
        { error: 'Resume and goals are required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not set in environment variables');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    const hasRequirements = requirements && requirements.trim();

    const prompt = `
    You are an expert career coach and professional resume writer with over 20 years of experience helping candidates land jobs at top companies. Your task is to analyze a user's resume and their stated career goals${hasRequirements ? " and the requirements of their target position" : ""} to provide actionable, specific, and constructive feedback for improvement.

    **User's Current Resume:**
    ---
    ${resume}
    ---

    **User's Career Goals:**
    ---
    ${goals}
    ---
    ${hasRequirements ? `
    **Target Position Requirements:**
    ---
    ${requirements}
    ---
    ` : ''}
    Please provide a detailed analysis and recommendations to improve this resume for the user's specific goal${hasRequirements ? ", taking the target position requirements heavily into account" : ""}. Structure your feedback in the following sections using Markdown formatting. Be encouraging but direct.

    ### Overall Summary
    Start with a brief, high-level summary that acts as a compelling "teaser" for the full analysis. Highlight 1-2 key strengths of the resume, but then clearly identify 2-3 specific, high-impact areas where it's falling short (e.g., "lacks quantifiable achievements," "not optimized for ATS keywords," "summary isn't tailored").

    **CRITICAL: After identifying the gaps, provide 2-3 immediate, tangible action items the user can implement right now.** These should be specific and actionable (e.g., "Add metrics to your top 3 achievements using the format: 'Achieved [X] by doing [Y], resulting in [Z]%'", "Replace generic terms like 'responsible for' with action verbs like 'Led', 'Spearheaded', 'Optimized'", "Customize your professional summary to include these 3 keywords from the job description: [keyword1], [keyword2], [keyword3]").

    Frame these as immediate opportunities and explicitly state that the detailed, step-by-step solutions, rewritten examples, and a fully revised resume are available in the full analysis. The goal is to make the user understand the value they will get by unlocking the next steps.

    ### Section-by-Section Breakdown
    Provide specific, bullet-pointed feedback for each major section of the resume (e.g., Summary/Objective, Experience, Skills, Education). For each point, explain *why* the change is recommended and provide an improved example if possible.
    - **Summary/Objective:** Analyze its effectiveness and suggest a more impactful version aligned with the user's goals.
    - **Experience:** Focus on rephrasing bullet points to use the STAR (Situation, Task, Action, Result) method. Suggest quantifying achievements with metrics (e.g., "Increased sales by 15%" instead of "Responsible for sales").
    - **Skills:** Recommend adding or removing skills based on the user's goals. Suggest organizing them into categories (e.g., Technical Skills, Soft Skills).
    - **Education/Certifications:** Comment on placement and relevance.

    ### Tailoring for the Target Role
    ${hasRequirements
        ? "This is the most critical section. Give concrete examples of how to tailor the language and content of the resume to better match the provided job description/requirements. Suggest specific keywords from the requirements to include throughout the resume. Highlight any gaps between the resume and the job requirements and suggest how to address them."
        : "Give general advice on how to tailor a resume for a target role. Explain the importance of using keywords from a job description and aligning the summary and experience sections with the needs of a potential employer. Provide examples of how to customize a resume for a hypothetical job posting."
    }

    ### Final Polish
    Offer tips on formatting, grammar, and overall presentation to ensure the resume is professional and easy to read. Mention consistency in tense and formatting.

    ---
    ### Refined Resume Copy
    Provide a complete, rewritten version of the resume based on all your recommendations. This should be a clean copy that the user can use directly${hasRequirements ? ", perfectly tailored to the target position requirements" : ""}. ${hasRequirements ? `

    **CRITICAL INSTRUCTIONS FOR TAILORING:**
    1. **Identify the Top 5 Most Important Requirements** from the target position (technical skills, experiences, qualifications, or responsibilities).
    2. **For each top requirement**, strategically reframe existing experiences and achievements from the original resume to directly address and demonstrate how the candidate meets that requirement. Use specific examples and metrics wherever possible.
    3. **Professional Summary**: Open with a powerful summary that immediately highlights alignment with the 3-5 most critical requirements. Use exact keywords from the job posting.
    4. **Experience Section Reframing**: For each work experience bullet point, prioritize and prominently feature accomplishments that directly map to target requirements. Restructure and reorder bullet points to lead with the most relevant achievements for this specific role.
    5. **Skills Section**: List skills in order of relevance to the target position, ensuring all required technical skills and tools mentioned in the requirements are prominently featured (if the candidate has them).
    6. **Bridge Gaps Strategically**: If certain requirements aren't directly met, highlight transferable skills, related experiences, or adjacent competencies that demonstrate the candidate's ability to quickly learn or adapt.
    7. **Use Job-Specific Language**: Mirror the terminology, phrases, and technical vocabulary used in the target position requirements throughout the resume to pass ATS systems and resonate with hiring managers.

    The goal is to make it immediately obvious to the reader how this candidate is an excellent match for this specific role by explicitly connecting their background to what the employer is seeking.` : ""}

    Present it clearly under this heading, formatted as clean markdown.

    ---
    ### Cover Letter Draft
    Based on the resume and job details, write a compelling and professional cover letter. The letter should highlight the user's most relevant skills and experiences, express enthusiasm for the role, and include a clear call to action. Address it to "Hiring Manager" if no specific contact is available. Keep it concise and impactful, around 3-4 paragraphs. Format it as clean markdown.
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const feedback = result.text;

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error generating AI feedback:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}
