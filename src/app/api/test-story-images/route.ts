import { NextRequest, NextResponse } from "next/server";
import { generateStoryImages, extractImagePrompts } from "@/utils/images/story-images";

const testStoryContent = `**Story Title:** The Magical Garden Adventure

**Brief Description:** Join Luna and her cat Whiskers as they discover a secret garden where plants can talk and magic happens every day!

---

### **Segment 1: The Hidden Door**

Luna was playing in her backyard when she noticed something unusual behind the old oak tree. There was a small, wooden door covered in glowing moss!

"Meow!" said Whiskers, her orange tabby cat, pointing with his paw at the mysterious door.

Luna carefully opened the door and gasped. Beyond it was the most beautiful garden she had ever seen!

**[Image Prompt: A young girl with her orange cat discovering a glowing wooden door behind a large oak tree in a backyard]**

---

### **Segment 2: The Talking Flowers**

As Luna stepped into the magical garden, the flowers began to speak!

"Welcome, young visitor!" chirped a bright sunflower. "We've been waiting for someone like you!"

The roses giggled, and the daisies danced in the gentle breeze. Whiskers purred with delight.

"This is incredible!" Luna exclaimed, her eyes wide with wonder.

**[Image Prompt: A magical garden with talking sunflowers, roses, and daisies, with Luna and her cat looking amazed]**

---

### **Segment 3: The Garden's Secret**

The wise old sunflower explained that the garden was magical because it was cared for with kindness and love.

"Every plant here grows stronger when children visit and show them care," the sunflower said.

Luna learned that she could help the garden by watering the plants and singing to them. The flowers bloomed brighter with every song!

**[Image Prompt: Luna watering colorful flowers while singing, with musical notes floating in the air and flowers glowing brighter]**

---

### Suggested Comprehension Questions

1. **Multiple Choice:** What did Luna discover behind the oak tree?
   - A) A treasure chest
   - B) A magical door  
   - C) A bird's nest
   - D) A sandbox

2. **True/False:** The flowers in the garden could talk.

3. **Multiple Choice:** How could Luna help the magical garden grow?
   a) By watering the plants
   b) By ignoring the garden
   c) By picking all the flowers
   d) By running away

   (Correct answer: a)`;

export async function POST(request: NextRequest) {
  try {
    const { testImages = true } = await request.json().catch(() => ({}));
    
    if (!testImages) {
      // Just extract prompts without generating images
      const prompts = extractImagePrompts(testStoryContent, "The Magical Garden Adventure");
      
      return NextResponse.json({
        success: true,
        prompts,
        message: "Image prompts extracted successfully"
      });
    }
    
    // Generate actual images
    console.log("Starting image generation test...");
    
    const images = await generateStoryImages(
      testStoryContent,
      "The Magical Garden Adventure",
      {
        generateAll: false, // Only generate cover image for testing
        maxImages: 1,
        style: 'illustration'
      }
    );
    
    return NextResponse.json({
      success: true,
      images,
      message: `Generated ${images.length} images successfully`,
      testStoryContent
    });
    
  } catch (error) {
    console.error("Test story images error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Just return the extracted prompts for quick testing
    const prompts = extractImagePrompts(testStoryContent, "The Magical Garden Adventure");
    
    return NextResponse.json({
      success: true,
      prompts,
      story: testStoryContent,
      message: "Image prompts extracted from test story"
    });
  } catch (error) {
    console.error("Test story images error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}