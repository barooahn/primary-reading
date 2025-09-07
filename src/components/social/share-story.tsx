'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Share2, 
  Facebook, 
  Twitter, 
 
  MessageCircle, 
  Mail, 
  Download,
  Copy,
  Check,
  BookOpen,
  Heart,
  Printer
} from 'lucide-react';

interface ShareStoryProps {
  story: {
    id: string;
    title: string;
    description: string;
    content: string;
    grade_level: number;
    estimated_reading_time: number;
    created_by?: string;
  };
  showDownload?: boolean;
}

export function ShareStory({ story, showDownload = true }: ShareStoryProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const storyUrl = `${window.location.origin}/read/${story.id}`;
  const shareText = `Check out this amazing story I ${story.created_by ? 'created' : 'found'} on PrimaryReading! "${story.title}" - Perfect for Year ${story.grade_level} readers. 📚✨`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${storyUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareToSocial = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(storyUrl);
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      email: `mailto:?subject=${encodeURIComponent(story.title)}&body=${encodedText}%0A%0A${encodedUrl}`,
    };
    
    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };

  const printStory = () => {
    // Create a new window with print-friendly content
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${story.title} - PrimaryReading</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; font-family: Georgia, serif; }
              h1 { color: #333; border-bottom: 2px solid #4A90E2; padding-bottom: 10px; }
              .story-meta { background: #f5f5f5; padding: 10px; margin: 20px 0; border-radius: 5px; }
              .story-content { line-height: 1.6; font-size: 14px; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666; }
            }
            body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #4A90E2; padding-bottom: 10px; }
            .story-meta { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 8px; }
            .story-content { line-height: 1.8; font-size: 16px; margin: 30px 0; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 14px; color: #666; }
            .meta-item { margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>${story.title}</h1>
          
          <div class="story-meta">
            <div class="meta-item"><strong>Reading Level:</strong> Year ${story.grade_level}</div>
            <div class="meta-item"><strong>Estimated Reading Time:</strong> ${story.estimated_reading_time} minutes</div>
            ${story.created_by ? '<div class="meta-item"><strong>Created by:</strong> Student</div>' : ''}
          </div>

          <div class="story-content">
            ${story.content.split('\n').map(paragraph => 
              paragraph.trim() ? `<p>${paragraph}</p>` : ''
            ).join('')}
          </div>

          <div class="footer">
            <p>Printed from PrimaryReading - Making reading fun for kids!</p>
            <p>Visit us at: ${window.location.origin}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const downloadStoryToDesktop = async () => {
    setIsDownloading(true);
    try {
      // Create story content for download
      const storyContent = `
${story.title}
${'='.repeat(story.title.length)}

Created for Year ${story.grade_level} readers
Estimated reading time: ${story.estimated_reading_time} minutes

${story.description}

${'─'.repeat(50)}

${story.content}

${'─'.repeat(50)}
Created with PrimaryReading - Making reading fun for kids!
Visit: ${window.location.origin}
      `.trim();

      // Create blob and download
      const blob = new Blob([storyContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${story.title.replace(/[^a-zA-Z0-9]/g, '_')}_Year${story.grade_level}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Share2 className="h-5 w-5 text-primary" />
          <span>Share This Story</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Social Media Sharing */}
        <div>
          <h4 className="font-medium mb-3">Share on Social Media</h4>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => shareToSocial('facebook')}
              className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300"
            >
              <Facebook className="h-4 w-4 text-blue-600" />
              <span>Facebook</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => shareToSocial('twitter')}
              className="flex items-center space-x-2 hover:bg-sky-50 hover:border-sky-300"
            >
              <Twitter className="h-4 w-4 text-sky-600" />
              <span>Twitter</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => shareToSocial('whatsapp')}
              className="flex items-center space-x-2 hover:bg-green-50 hover:border-green-300"
            >
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span>WhatsApp</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => shareToSocial('email')}
              className="flex items-center space-x-2 hover:bg-gray-50 hover:border-gray-300"
            >
              <Mail className="h-4 w-4 text-gray-600" />
              <span>Email</span>
            </Button>
          </div>
        </div>

        {/* Copy Link */}
        <div>
          <h4 className="font-medium mb-3">Copy Link</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              value={storyUrl}
              readOnly
              className="flex-1 p-2 text-sm border border-border rounded-md bg-muted/20"
            />
            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="flex items-center space-x-1"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Print and Download */}
        <div>
          <h4 className="font-medium mb-3">Print & Save</h4>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={printStory}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Printer className="h-4 w-4" />
              <span>Print Story</span>
            </Button>
            
            {showDownload && (
              <Button
                onClick={downloadStoryToDesktop}
                disabled={isDownloading}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>{isDownloading ? 'Saving...' : 'Download'}</span>
              </Button>
            )}
          </div>
          <p className="text-xs text-muted mt-2">
            Print the story or save as a text file for offline reading
          </p>
        </div>

        {/* Story Stats for Sharing */}
        <div className="p-3 bg-primary/5 rounded-lg">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>Year {story.grade_level}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4 text-pink-500" />
              <span>{story.estimated_reading_time} min read</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}