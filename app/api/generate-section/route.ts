import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { resume, goals, requirements, section, existingAnalysis } = await request.json();

    if (!resume || !goals || !section) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const hasRequirements = requirements && requirements.trim().length > 0;

    let prompt = '';

    if (section === 'refined_resume') {
      prompt = `
You are an expert resume writer and ATS optimization specialist. Create a complete, professionally rewritten resume based on the following inputs.

**User's Current Resume:**
---
${resume}
---

**User's Career Goals:**
---
${goals}
---
${hasRequirements ? `
**Target Position Requirements (CRITICAL - tailor the resume to match these):**
---
${requirements}
---
` : ''}
${existingAnalysis ? `
**Previous Analysis (incorporate these recommendations):**
---
${existingAnalysis.substring(0, 2000)}
---
` : ''}

**CRITICAL OUTPUT REQUIREMENTS:**
- Output as PLAIN TEXT only - NO markdown code blocks, NO \`\`\` markers
- Use ALL CAPS for section headers (e.g., PROFESSIONAL SUMMARY, EXPERIENCE, SKILLS)
- Use bullet points (•) or dashes (-) for lists
- Do NOT wrap output in any code blocks
- Output should be copy-paste ready for a word processor

${hasRequirements ? `**TAILORING INSTRUCTIONS (MUST FOLLOW):**
1. Use EXACT keywords from the job requirements - if they say "project management", write "project management"
2. Professional Summary: 3-4 sentences directly addressing the top 3 requirements
3. Reorder and rewrite experience bullets to highlight relevant achievements first
4. Skills section: List required skills first, then preferred skills, then others
5. Include specific metrics and numbers in achievements
6. Mirror the terminology from the job posting throughout` : `**GENERAL GUIDELINES:**
1. Strong action verbs and quantified achievements
2. Clear professional summary aligned with career goals
3. Skills organized by relevance`}

Output ONLY the resume content. No explanations, no headers like "Here is your resume", just the resume itself.
`;
    } else if (section === 'cover_letter') {
      prompt = `
You are an expert cover letter writer. Write a compelling, tailored cover letter based on the following inputs.

**User's Resume:**
---
${resume}
---

**User's Career Goals:**
---
${goals}
---
${hasRequirements ? `
**Target Position Requirements (CRITICAL - reference these specifically):**
---
${requirements}
---
` : ''}

**CRITICAL OUTPUT REQUIREMENTS:**
- Output as PLAIN TEXT only - NO markdown code blocks, NO \`\`\` markers
- Use standard business letter format
- Do NOT wrap output in any code blocks
- Output should be copy-paste ready

**CONTENT STRUCTURE:**
${hasRequirements ? `
- **Opening (2-3 sentences)**: Reference the specific position. Lead with your #1 qualification that matches their top requirement.
- **Body Paragraph 1**: Address 2-3 specific requirements from the job posting. Use their EXACT terminology. Give concrete examples from your experience.
- **Body Paragraph 2**: Highlight one major achievement with specific metrics. Connect it directly to what they need.
- **Closing (2-3 sentences)**: Express genuine enthusiasm for THIS role. Mention how your [specific skill they require] will benefit them. Clear call to action.` : `
- **Opening**: State the role type you're targeting and your key qualification
- **Body**: 2-3 specific achievements with measurable results
- **Closing**: Enthusiasm and call to action`}

Keep it 250-350 words, 3-4 paragraphs. Address to "Hiring Manager" unless a specific contact is mentioned.

Output ONLY the cover letter. No explanations, no "Here is your cover letter", just the letter itself.
`;
    } else {
      return NextResponse.json(
        { error: 'Invalid section type. Use "refined_resume" or "cover_letter"' },
        { status: 400 }
      );
    }

    // Use non-streaming for focused section generation (faster, more reliable)
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        maxOutputTokens: 4096,
        temperature: 0.7,
      },
    });

    const content = result.text;

    if (!content || content.length < 100) {
      return NextResponse.json(
        { error: 'Failed to generate content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      section,
      content: content.trim(),
    });

  } catch (error) {
    console.error('Error generating section:', error);
    return NextResponse.json(
      { error: 'Failed to generate section' },
      { status: 500 }
    );
  }
}
