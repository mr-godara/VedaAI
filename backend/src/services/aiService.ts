import { IAssignment, IGeneratedPaper, Section } from '../types';
import { env } from '../config/env';
import { z } from 'zod';

const QuestionSchema = z.object({
  questionNumber: z.number(),
  text: z.string(),
  type: z.string(),
  difficulty: z.enum(['easy', 'moderate', 'hard']),
  marks: z.number(),
  options: z.array(z.string()).optional()
});

const SectionSchema = z.object({
  title: z.string(),
  instruction: z.string(),
  questionType: z.string(),
  questions: z.array(QuestionSchema)
});

const AnswerKeySchema = z.object({
  questionNumber: z.number(),
  answer: z.string()
});

const GeneratedPaperSchema = z.object({
  sections: z.array(SectionSchema),
  answerKey: z.array(AnswerKeySchema)
});

class AIService {
  private client: any = null;
  private initialized = false;

  constructor() {}

  private async getClient(): Promise<any> {
    if (this.initialized) {
      return this.client;
    }

    if (env.GEMINI_API_KEY) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      } catch (error) {
        console.error('Failed to dynamically load @google/genai SDK:', error);
      }
    } else {
      console.warn('Gemini API key missing. Please supply GEMINI_API_KEY in .env');
    }

    this.initialized = true;
    return this.client;
  }

  async generateQuestions(assignment: IAssignment, fileContent?: string): Promise<any> {
    const client = await this.getClient();
    if (!client) {
      console.warn('Gemini client not initialized. Returning mock data.');
      return this.generateMockQuestions(assignment);
    }

    const prompt = this.buildPrompt(assignment, fileContent);

    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      let content = response.text;
      if (!content) throw new Error('Empty AI response');

      // Strip markdown code block wrappers if present
      content = content.trim();
      if (content.startsWith('```')) {
        content = content.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      }

      // Sanitize bad control characters (newlines, tabs, etc.) ONLY inside string literals to prevent JSON.parse syntax errors
      const sanitizedContent = content.replace(/"([^"\\]|\\.)*"/g, (match: string) => {
        return match.replace(/[\u0000-\u001F]/g, (char: string) => {
          if (char === '\n') return '\\n';
          if (char === '\r') return '\\r';
          if (char === '\t') return '\\t';
          return ''; // Strip other unescaped control characters
        });
      });

      const parsed = JSON.parse(sanitizedContent);
      // Strictly validate the response instead of directly returning LLM output
      return GeneratedPaperSchema.parse(parsed);
    } catch (error) {
      console.error('AI Generation Error:', error);
      throw error;
    }
  }

  private buildPrompt(assignment: IAssignment, fileContent?: string): string {
    const qtStr = assignment.questionTypes
      .map(qt => `- ${qt.type}: ${qt.count} questions, ${qt.marks} marks each`)
      .join('\n');

    let prompt = `You are an expert teacher creating an exam paper.
Subject: ${assignment.subject}
Title: ${assignment.title}
Target Grade Level: 5th Grade
Duration: 45 minutes

Please generate a structured exam paper containing the following question types:
${qtStr}

Additional Instructions:
${assignment.additionalInstructions || 'None'}

Please output your response as a JSON object matching this exact structure:
{
  "sections": [
    {
      "title": "Section A", // Use alphabetical letters for section titles (e.g. Section A, Section B, etc.)
      "instruction": "Instructions for this section",
      "questionType": "Matching question type",
      "questions": [
        {
          "questionNumber": 1,
          "text": "The question text",
          "type": "question type",
          "difficulty": "moderate", // Must be one of: easy, moderate, hard
          "marks": 5, // Match the requested marks
          "options": ["A", "B", "C", "D"] // Only include if MCQ or similar
        }
      ]
    }
  ],
  "answerKey": [
    {
      "questionNumber": 1,
      "answer": "The correct answer or brief explanation"
    }
  ]
}

Ensure the question numbers are sequential starting from 1 across all sections.
`;

    if (fileContent) {
      prompt += `\nBase the questions on the following content extracted from the uploaded document:\n\n${fileContent.substring(0, 5000)}\n`;
    }

    return prompt;
  }

  private generateMockQuestions(assignment: IAssignment): any {
    let questionNumber = 1;
    const sections: Section[] = [];
    const answerKey: any[] = [];
    let totalMarks = 0;

    for (const qt of assignment.questionTypes) {
      const questions = [];
      for (let i = 0; i < qt.count; i++) {
        const qNum = questionNumber++;
        totalMarks += qt.marks;
        questions.push({
          questionNumber: qNum,
          text: `This is a mock ${qt.type} question about ${assignment.subject}.`,
          type: qt.type,
          difficulty: 'moderate' as const,
          marks: qt.marks,
          ...(qt.type.includes('Choice') ? { options: ['Option A', 'Option B', 'Option C', 'Option D'] } : {})
        });
        answerKey.push({
          questionNumber: qNum,
          answer: `Mock answer for question ${qNum}`
        });
      }

      sections.push({
        title: qt.type,
        instruction: `Answer all questions. Each question carries ${qt.marks} marks.`,
        questionType: qt.type,
        questions,
      });
    }

    return {
      sections,
      answerKey,
      totalMarks,
      totalQuestions: questionNumber - 1
    };
  }
}

export const aiService = new AIService();
