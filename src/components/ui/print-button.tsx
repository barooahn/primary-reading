'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface PrintButtonProps {
  story: {
    id: string;
    title: string;
    content: string;
    grade_level?: number;
    estimated_reading_time?: number;
    created_by?: string;
  };
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export function PrintButton({ 
  story, 
  variant = 'outline', 
  size = 'md', 
  className = '', 
  showText = true 
}: PrintButtonProps) {
  
  const printStory = () => {
    // Create a new window with print-friendly content
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${story.title} - PrimaryReading</title>
          <meta charset="utf-8">
          <style>
            @media print {
              body { 
                margin: 0; 
                padding: 15px; 
                font-family: Georgia, serif; 
                font-size: 12pt;
                line-height: 1.5;
              }
              h1 { 
                color: #333; 
                border-bottom: 2px solid #4A90E2; 
                padding-bottom: 8px; 
                margin-bottom: 15px;
                font-size: 18pt;
              }
              .story-meta { 
                background: #f8f8f8; 
                padding: 8px; 
                margin: 15px 0; 
                border-radius: 4px; 
                font-size: 10pt;
              }
              .story-content { 
                line-height: 1.6; 
                font-size: 12pt; 
                margin: 20px 0;
              }
              .story-content p {
                margin: 8px 0;
              }
              .footer { 
                margin-top: 25px; 
                padding-top: 15px; 
                border-top: 1px solid #ccc; 
                font-size: 9pt; 
                color: #666; 
              }
              .meta-item { margin: 3px 0; }
            }
            body { 
              font-family: Georgia, serif; 
              max-width: 700px; 
              margin: 0 auto; 
              padding: 20px; 
              line-height: 1.6;
            }
            h1 { 
              color: #333; 
              border-bottom: 2px solid #4A90E2; 
              padding-bottom: 10px; 
              margin-bottom: 20px;
            }
            .story-meta { 
              background: #f5f5f5; 
              padding: 15px; 
              margin: 20px 0; 
              border-radius: 8px; 
            }
            .story-content { 
              line-height: 1.8; 
              font-size: 16px; 
              margin: 30px 0; 
            }
            .story-content p {
              margin: 12px 0;
            }
            .footer { 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 1px solid #ccc; 
              font-size: 14px; 
              color: #666; 
            }
            .meta-item { margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>${story.title}</h1>
          
          ${story.grade_level || story.estimated_reading_time ? `
          <div class="story-meta">
            ${story.grade_level ? `<div class="meta-item"><strong>Reading Level:</strong> Year ${story.grade_level}</div>` : ''}
            ${story.estimated_reading_time ? `<div class="meta-item"><strong>Estimated Reading Time:</strong> ${story.estimated_reading_time} minutes</div>` : ''}
            ${story.created_by ? '<div class="meta-item"><strong>Created by:</strong> Student</div>' : ''}
          </div>
          ` : ''}

          <div class="story-content">
            ${story.content.split('\n').map(paragraph => 
              paragraph.trim() ? `<p>${paragraph.trim()}</p>` : '<br>'
            ).join('')}
          </div>

          <div class="footer">
            <p>📚 Printed from PrimaryReading - Making reading fun for kids!</p>
            <p>Visit us at: ${window.location.origin}</p>
            <p>Printed on: ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      // Don't auto-close in case user wants to print again
    };
  };

  const buttonSize = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-2'
  }[size];

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  }[size];

  if (!showText) {
    return (
      <Button
        variant={variant}
        size="icon"
        onClick={printStory}
        className={className}
        title="Print story"
      >
        <Printer className={iconSize} />
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      onClick={printStory}
      className={`flex items-center space-x-2 ${buttonSize} ${className}`}
    >
      <Printer className={iconSize} />
      <span>Print</span>
    </Button>
  );
}