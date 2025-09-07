import { NextRequest, NextResponse } from 'next/server';
import openai from '@/utils/openai/client';

interface GenerateImageRequest {
  prompt: string;
  storyTitle?: string;
  style?: 'cartoon' | 'realistic' | 'illustration';
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateImageRequest = await request.json();
    const { prompt, style = 'illustration' } = body;

    // Enhance the prompt for child-friendly, engaging images
    const enhancedPrompt = `Child-friendly ${style} style: ${prompt}. 
    
Make it colorful, engaging, and appropriate for primary school children. 
The image should be welcoming and not scary. 
Use bright colors and clear, simple compositions that children would find appealing.
High quality, detailed, safe for children.`;

    // Generate image using DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid",
    });

    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('Failed to generate image');
    }

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      originalPrompt: prompt,
      enhancedPrompt
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate image. Please try again.' 
      },
      { status: 500 }
    );
  }
}