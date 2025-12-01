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
    Provide a complete, rewritten version of the resume based on all your recommendations. This should be a clean copy that the user can use directly${hasRequirements ? ", perfectly tailored to the target position requirements" : ""}.

    **CRITICAL FORMATTING INSTRUCTIONS:**
    - Output the resume as PLAIN TEXT with clean formatting - NO markdown code blocks, NO \`\`\` markers
    - Use simple text formatting: ALL CAPS for section headers, dashes or bullets for lists
    - Do NOT wrap the resume in any code blocks or markdown syntax
    - The output should be copy-paste ready for a word processor
    ${hasRequirements ? `
    **CRITICAL INSTRUCTIONS FOR TAILORING TO JOB REQUIREMENTS:**
    1. **Extract Key Requirements**: Identify the top 5-7 most important requirements from the target position (must-have skills, required experience, key responsibilities).
    2. **Keyword Integration**: Use EXACT keywords and phrases from the job requirements throughout the resume. If the job says "project management", use "project management" - not "managing projects".
    3. **Professional Summary**: Write a 3-4 sentence summary that directly addresses the top 3 requirements. Start with "[Years] of experience in [relevant field]" and explicitly mention key required skills.
    4. **Experience Bullets - STAR + Keywords**: Rewrite each bullet using:
       - A strong action verb
       - The specific task/responsibility (using job requirement keywords)
       - Quantifiable results with numbers/percentages
       - Example: "Led cross-functional team of 8 engineers to deliver [specific project type from requirements], reducing deployment time by 40%"
    5. **Skills Section**: List skills in this exact order:
       - Required skills from job posting (first)
       - Preferred/nice-to-have skills (second)
       - Other relevant skills (last)
    6. **Address Requirements Gaps**: If the candidate lacks a required skill, highlight the closest transferable experience or related competency.
    7. **ATS Optimization**: Include exact job title variations, tool names, and certifications mentioned in requirements.` : `
    **FORMATTING GUIDELINES:**
    - Professional Summary: 3-4 impactful sentences
    - Experience: Use action verbs and quantify achievements
    - Skills: Organize by category (Technical, Soft Skills, Tools)`}

    ---
    ### Cover Letter Draft
    Write a compelling cover letter tailored to ${hasRequirements ? "the specific job requirements provided" : "the user's career goals"}.

    **CRITICAL FORMATTING INSTRUCTIONS:**
    - Output as PLAIN TEXT - NO markdown code blocks, NO \`\`\` markers
    - Use standard business letter format
    - Do NOT wrap in code blocks

    **CONTENT REQUIREMENTS:**
    ${hasRequirements ? `
    - **Opening Paragraph**: Reference the specific position and company (if mentioned). Hook with your most relevant qualification that matches their #1 requirement.
    - **Body Paragraph 1**: Address 2-3 key requirements from the job posting with specific examples from your experience. Use their exact terminology.
    - **Body Paragraph 2**: Highlight a specific achievement with metrics that demonstrates your value. Connect it to what they're looking for.
    - **Closing**: Express enthusiasm for this specific role, mention you're eager to discuss how your [specific skill from requirements] can benefit their team. Include call to action.` : `
    - **Opening**: State the type of role you're seeking and your key qualification
    - **Body**: Highlight 2-3 relevant achievements with specific results
    - **Closing**: Express enthusiasm and include call to action`}

    Keep it to 3-4 paragraphs, approximately 250-350 words. Address to "Hiring Manager" unless a specific contact is provided.
    `;

    // Use streaming for better UX and to avoid timeouts
    const resultStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        maxOutputTokens: 8192, // Increase max output length to ensure we get all sections
        temperature: 0.7,
      },
    });

    // Create a ReadableStream to stream the response
    const encoder = new TextEncoder();
    let chunkCount = 0;
    let totalLength = 0;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('🚀 Starting Gemini stream...');
          for await (const chunk of resultStream) {
            const text = chunk.text;
            if (text) {
              chunkCount++;
              totalLength += text.length;
              controller.enqueue(encoder.encode(text));

              if (chunkCount % 10 === 0) {
                console.log(`📤 Sent chunk ${chunkCount}, Total: ${totalLength} chars`);
              }
            }
          }
          console.log(`✅ Gemini stream complete. Total chunks: ${chunkCount}, Total length: ${totalLength}`);
          controller.close();
        } catch (error) {
          console.error('❌ Gemini stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Error generating AI feedback:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}
