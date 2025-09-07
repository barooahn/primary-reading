import { NextRequest, NextResponse } from 'next/server';
import openai from '@/utils/openai/client';
import { researchTopicForStory } from '@/utils/search/client';
import { getGradeLevelConfig, getVocabularyForYear } from '@/config/grade-levels';

interface GenerateStoryRequest {
  theme: string;
  customTopic?: string;
  gradeLevel: number; // Year 1-6
  storyType: 'fiction' | 'non_fiction';
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateStoryRequest = await request.json();
    const { theme, customTopic, gradeLevel, storyType } = body;

    // Get grade-specific configuration
    const gradeConfig = getGradeLevelConfig(gradeLevel);
    const vocabulary = getVocabularyForYear(gradeLevel);
    
    // Research the topic for factual accuracy
    const topic = customTopic || theme;
    const research = await researchTopicForStory(topic);
    
    // Create grade-specific story generation prompt
    const prompt = `Create an engaging ${storyType} story for children in Year ${gradeLevel} (age ${gradeConfig.age}, ${gradeConfig.readingLevel} reading level).

Topic: ${topic}
Target word count: ${gradeConfig.wordCount.recommended} words (${gradeConfig.wordCount.min}-${gradeConfig.wordCount.max} range)
Target audience: Year ${gradeLevel} children (age ${gradeConfig.age})

YEAR ${gradeLevel} REQUIREMENTS:
- Reading Level: ${gradeConfig.readingLevel}
- Average sentence length: ${gradeConfig.sentenceLength.average} words (max ${gradeConfig.sentenceLength.maxWords} words)
- Vocabulary: ${gradeConfig.vocabularyLevel.description}
- Plot complexity: ${gradeConfig.storyElements.plotComplexity}
- Maximum characters: ${gradeConfig.storyElements.characterCount}
- Subplots allowed: ${gradeConfig.storyElements.subplots ? 'Yes' : 'No'}
- Appropriate themes: ${gradeConfig.storyElements.themes.join(', ')}

VOCABULARY GUIDELINES:
- Use these topic-appropriate words: ${vocabulary.topics.join(', ')}
- Include these common words where appropriate: ${vocabulary.commonWords.join(', ')}
- Syllable complexity: Maximum ${gradeConfig.vocabularyLevel.syllableComplexity} syllables for new words
- ${gradeConfig.vocabularyLevel.commonWords ? 'Focus on high-frequency words' : 'Can use more varied vocabulary'}

STORY STRUCTURE:
- Break into 4-6 segments for interactive reading
- Each segment should end with a natural pause or mini-cliffhanger
- Make it fun and exciting, not boring or overly educational
- Include dialogue and action appropriate for Year ${gradeLevel}
- Plan for ${gradeConfig.questionsPerStory} comprehension questions

Please provide:
1. Story title
2. Brief description
3. Story segments (each segment should be clearly marked)
4. Suggested image prompts for each segment
5. Suggested comprehension questions (${gradeConfig.questionTypes.join(', ')} types)

RESEARCH CONTEXT (use this for factual accuracy):
${research}`;


    // Generate story using GPT-4.1 nano (gpt-4o-mini is the model name for GPT-4.1 nano)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a creative children's story writer who specializes in making reading fun and engaging for primary school students. You understand what kids actually want to read about and avoid boring, overly educational content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const storyContent = completion.choices[0]?.message?.content;
    
    if (!storyContent) {
      throw new Error('Failed to generate story content');
    }

    // Parse the generated content (you might want to make this more robust)
    const lines = storyContent.split('\n').filter(line => line.trim());
    
    // Extract title (assuming it's in the first few lines)
    const titleLine = lines.find(line => 
      line.toLowerCase().includes('title:') || 
      line.toLowerCase().includes('story title:')
    );
    const title = titleLine ? 
      titleLine.split(':')[1]?.trim().replace(/"/g, '') || 'Untitled Story' : 
      'Untitled Story';

    // Extract description
    const descriptionLine = lines.find(line => 
      line.toLowerCase().includes('description:') || 
      line.toLowerCase().includes('brief description:')
    );
    const description = descriptionLine ? 
      descriptionLine.split(':')[1]?.trim() || 'An exciting adventure story!' : 
      'An exciting adventure story!';

    // For now, return the raw content - in production you'd want better parsing
    const storyData = {
      title,
      description,
      content: storyContent,
      genre: theme,
      theme: topic,
      reading_level: gradeConfig.readingLevel,
      story_type: storyType,
      grade_level: gradeLevel,
      word_count: gradeConfig.wordCount.recommended,
      estimated_reading_time: Math.ceil(gradeConfig.wordCount.recommended / (gradeLevel * 20 + 40)), // Age-adjusted reading speed
      difficulty_rating: gradeConfig.questionComplexity,
      grade_config: {
        sentenceLength: gradeConfig.sentenceLength,
        vocabularyLevel: gradeConfig.vocabularyLevel,
        questionTypes: gradeConfig.questionTypes,
        questionsPerStory: gradeConfig.questionsPerStory,
        uiElements: gradeConfig.uiElements,
      },
    };

    return NextResponse.json({ 
      success: true, 
      story: storyData 
    });

  } catch (error) {
    console.error('Story generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate story. Please try again.' 
      },
      { status: 500 }
    );
  }
}