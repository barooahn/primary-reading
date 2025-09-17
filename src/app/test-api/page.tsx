'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { StoryGenerationResponse, ImageGenerationResponse } from '@/types/api';

export default function TestAPIPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyResult, setStoryResult] = useState<StoryGenerationResponse | null>(null);
  const [imageResult, setImageResult] = useState<ImageGenerationResponse | null>(null);
  const [error, setError] = useState<string>('');

  const testStoryGeneration = async () => {
    setIsGenerating(true);
    setError('');
    setStoryResult(null);

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: 'Detective Mystery',
          customTopic: 'A detective cat solving the case of missing fish',
          gradeLevel: 3,
          storyType: 'fiction',
        }),
      });

      const data = await response.json();
      setStoryResult(data);
    } catch (err) {
      setError('Failed to generate story: ' + (err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const testImageGeneration = async () => {
    setIsGenerating(true);
    setError('');
    setImageResult(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'A friendly detective cat wearing a small detective hat, looking for clues',
          style: 'illustration',
        }),
      });

      const data = await response.json();
      setImageResult(data);
    } catch (err) {
      setError('Failed to generate image: ' + (err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">API Testing Dashboard</h1>
      
      <div className="grid gap-6">
        {/* Story Generation Test */}
        <Card>
          <CardHeader>
            <CardTitle>Test Story Generation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testStoryGeneration} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? 'Generating Story...' : 'Generate Test Story'}
            </Button>
            
            {storyResult && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800">Story Generated Successfully!</h3>
                <p className="text-green-700 mt-2">
                  <strong>Title:</strong> {storyResult.story?.title}
                </p>
                <p className="text-green-700">
                  <strong>Description:</strong> {storyResult.story?.description}
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-green-800 font-semibold">
                    View Full Content
                  </summary>
                  <pre className="mt-2 text-sm bg-white p-2 rounded border overflow-auto max-h-60">
                    {storyResult.story?.content}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Image Generation Test */}
        <Card>
          <CardHeader>
            <CardTitle>Test Image Generation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testImageGeneration} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? 'Generating Image...' : 'Generate Test Image'}
            </Button>
            
            {imageResult && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800">Image Generated Successfully!</h3>
                {imageResult.imageUrl && (
                  <Image 
                    src={imageResult.imageUrl} 
                    alt="Generated image" 
                    width={400}
                    height={400}
                    className="mt-2 max-w-full h-auto rounded border"
                  />
                )}
                <p className="text-blue-700 text-sm mt-2">
                  <strong>Original Prompt:</strong> {imageResult.originalPrompt}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200">
            <CardContent className="p-4 bg-red-50">
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Database Setup Instructions:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Go to your Supabase dashboard</li>
          <li>Open the SQL Editor</li>
          <li>Copy and paste the content from <code>supabase_schema.sql</code></li>
          <li>Run the query to create all tables and policies</li>
          <li>Your database will be ready for the PrimaryReading app!</li>
        </ol>
      </div>
    </div>
  );
}