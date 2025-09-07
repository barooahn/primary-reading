import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuration constants
export const AI_CONFIG = {
  // Use GPT-4.1 nano as specified
  TEXT_MODEL: 'gpt-4-1106-preview', // Using closest available model
  IMAGE_MODEL: 'dall-e-3',
  MAX_TOKENS: 2000,
  TEMPERATURE: 0.7,
  IMAGE_SIZE: '1024x1024' as const,
  IMAGE_QUALITY: 'standard' as const,
  IMAGE_STYLE: 'natural' as const,
} as const;

// Helper function to generate educational stories
export async function generateStory(params: {
  topic: string;
  grade_level: number;
  reading_level: string;
  genre: string;
  word_count: number;
  research_context?: string;
}) {
  const prompt = `
Context: Use the following researched information to create an EXCITING and ENGAGING educational story.

Research Summary: ${params.research_context || 'General educational content'}

Generate a FUN and CAPTIVATING story for grade ${params.grade_level} readers about ${params.topic}.

ENGAGEMENT REQUIREMENTS (CRITICAL):
- Start with immediate action, conflict, or intriguing question
- Include relatable characters kids actually care about (peers, not adults lecturing)
- Add humor, suspense, or surprise elements throughout
- Use dialogue and action rather than description
- Include a problem the characters must solve
- Make the educational content feel like a natural part of the adventure
- End with a satisfying resolution and hint at more adventures

STORY REQUIREMENTS:
- Age-appropriate vocabulary for grade ${params.grade_level} students (${params.reading_level} reading level)
- Approximately ${params.word_count} words
- ${params.genre} genre with educational elements woven naturally into exciting plot
- Diverse characters with distinct personalities and motivations

AVOID:
- Boring "teachy" tone
- Adult characters explaining things to kids
- Static descriptions without action
- Predictable plots
- Moralizing or preachy content

Write an engaging story that kids will actually want to read:
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.TEXT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert children\'s book author who creates exciting, educational stories that kids love to read.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: AI_CONFIG.MAX_TOKENS,
      temperature: AI_CONFIG.TEMPERATURE,
    });

    return completion.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
}

// Helper function to generate comprehension questions
export async function generateQuestions(params: {
  story_content: string;
  grade_level: number;
  question_count: number;
  research_context?: string;
}) {
  const prompt = `
Based on the story content and research context, create ${params.question_count} comprehension questions for grade ${params.grade_level}:

Story Context: ${params.story_content}
Research Context: ${params.research_context || 'General educational content'}

Question Requirements:
- 2 multiple choice questions (4 options each)
- 1 short answer question (1-2 sentence responses)  
- 1 creative thinking question

Ensure questions test different cognitive levels:
- Basic comprehension (who, what, when, where)
- Analysis (why, how, cause and effect)
- Application (connections to real life, predictions)

Include encouraging feedback for both correct and incorrect answers that:
- Explains the correct answer clearly
- Provides additional context from research when relevant
- Encourages continued learning

Format as JSON with this structure:
{
  "questions": [
    {
      "question_text": "question here",
      "question_type": "multiple_choice|short_answer|creative",
      "options": ["option1", "option2", "option3", "option4"], // only for multiple choice
      "correct_answer": "answer here",
      "explanation": "encouraging explanation here",
      "difficulty_level": 1-3
    }
  ]
}
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.TEXT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an educational assessment expert who creates engaging, age-appropriate comprehension questions for children.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: AI_CONFIG.MAX_TOKENS,
      temperature: 0.5, // Lower temperature for more consistent question format
    });

    const response = completion.choices[0]?.message?.content || null;
    if (response) {
      try {
        return JSON.parse(response);
      } catch (parseError) {
        console.error('Error parsing questions JSON:', parseError);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}

// Helper function to generate story illustrations
export async function generateImage(params: {
  story_excerpt: string;
  grade_level: number;
  research_context?: string;
}) {
  const prompt = `
Create an educational illustration for a grade ${params.grade_level} story.

Story Context: ${params.story_excerpt}
Research Context: ${params.research_context || 'Educational content'}

Image Requirements:
- Bright, colorful, child-friendly illustration style
- Educational and supportive of story comprehension
- Inclusive representation of diverse characters
- Safe, age-appropriate imagery (no scary or inappropriate elements)
- Visual complexity appropriate for grade ${params.grade_level} students
- Incorporate factually accurate details from research context
- Support key story elements and learning objectives

Style: Children's book illustration, friendly cartoon style, educational
  `;

  try {
    const response = await openai.images.generate({
      model: AI_CONFIG.IMAGE_MODEL,
      prompt: prompt,
      size: AI_CONFIG.IMAGE_SIZE,
      quality: AI_CONFIG.IMAGE_QUALITY,
      style: AI_CONFIG.IMAGE_STYLE,
      n: 1,
    });

    return response.data?.[0]?.url || null;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

// Content moderation helper
export async function moderateContent(text: string): Promise<boolean> {
  try {
    const moderation = await openai.moderations.create({
      input: text,
    });

    return moderation.results[0]?.flagged === false;
  } catch (error) {
    console.error('Error moderating content:', error);
    // Fail safe - if moderation fails, assume content needs review
    return false;
  }
}