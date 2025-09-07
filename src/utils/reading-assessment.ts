import { getGradeLevelConfig } from '@/config/grade-levels';

interface ReadingAssessment {
  userYear: number;
  actualLevel: 'below' | 'at' | 'above';
  recommendedYear: number;
  strengths: string[];
  areasForImprovement: string[];
  confidenceScore: number; // 0-100
}

interface UserPerformanceData {
  userId: string;
  currentYear: number;
  storiesCompleted: number;
  averageScore: number;
  averageReadingTime: number; // in minutes
  questionAccuracy: {
    multiple_choice: number;
    true_false: number;
    short_answer: number;
    sequence: number;
    drag_drop: number;
  };
  vocabularyKnowledge: number; // 0-100
  comprehensionSpeed: number; // words per minute
}

export class ReadingLevelAssessment {
  
  /**
   * Assess a user's reading level based on their performance data
   */
  static assessReadingLevel(performanceData: UserPerformanceData): ReadingAssessment {
    getGradeLevelConfig(performanceData.currentYear); // Get config for validation
    const expectedReadingSpeed = this.calculateExpectedReadingSpeed(performanceData.currentYear);
    
    let levelScore = 0;
    const strengths: string[] = [];
    const areasForImprovement: string[] = [];

    // 1. Assess reading speed (25% weight)
    const speedRatio = performanceData.comprehensionSpeed / expectedReadingSpeed;
    if (speedRatio >= 1.2) {
      levelScore += 25;
      strengths.push('Excellent reading speed');
    } else if (speedRatio >= 0.8) {
      levelScore += 20;
      strengths.push('Good reading speed');
    } else {
      levelScore += 10;
      areasForImprovement.push('Reading speed could be improved');
    }

    // 2. Assess comprehension accuracy (40% weight)
    const avgAccuracy = Object.values(performanceData.questionAccuracy)
      .filter(score => score > 0)
      .reduce((sum, score) => sum + score, 0) / 
      Object.values(performanceData.questionAccuracy).filter(score => score > 0).length;
    
    if (avgAccuracy >= 90) {
      levelScore += 40;
      strengths.push('Excellent comprehension skills');
    } else if (avgAccuracy >= 80) {
      levelScore += 35;
      strengths.push('Strong comprehension skills');
    } else if (avgAccuracy >= 70) {
      levelScore += 25;
      strengths.push('Good comprehension skills');
    } else {
      levelScore += 15;
      areasForImprovement.push('Comprehension skills need practice');
    }

    // 3. Assess vocabulary knowledge (20% weight)
    if (performanceData.vocabularyKnowledge >= 85) {
      levelScore += 20;
      strengths.push('Strong vocabulary');
    } else if (performanceData.vocabularyKnowledge >= 70) {
      levelScore += 16;
      strengths.push('Good vocabulary');
    } else {
      levelScore += 10;
      areasForImprovement.push('Vocabulary development needed');
    }

    // 4. Assess consistency (15% weight)
    if (performanceData.storiesCompleted >= 10) {
      const consistencyScore = Math.min(performanceData.averageScore / 85, 1);
      levelScore += consistencyScore * 15;
      
      if (consistencyScore >= 0.9) {
        strengths.push('Consistent performance');
      } else if (consistencyScore < 0.7) {
        areasForImprovement.push('More consistent practice needed');
      }
    }

    // Determine reading level
    let actualLevel: 'below' | 'at' | 'above';
    let recommendedYear = performanceData.currentYear;

    if (levelScore >= 85) {
      actualLevel = 'above';
      recommendedYear = Math.min(performanceData.currentYear + 1, 6);
    } else if (levelScore >= 65) {
      actualLevel = 'at';
      recommendedYear = performanceData.currentYear;
    } else {
      actualLevel = 'below';
      recommendedYear = Math.max(performanceData.currentYear - 1, 1);
    }

    return {
      userYear: performanceData.currentYear,
      actualLevel,
      recommendedYear,
      strengths,
      areasForImprovement,
      confidenceScore: Math.round(levelScore),
    };
  }

  /**
   * Calculate expected reading speed for a given year level (words per minute)
   */
  private static calculateExpectedReadingSpeed(year: number): number {
    // Based on educational research for primary school reading speeds
    const baseSpeeds = {
      1: 30,  // 30 WPM for Year 1
      2: 50,  // 50 WPM for Year 2
      3: 70,  // 70 WPM for Year 3
      4: 90,  // 90 WPM for Year 4
      5: 110, // 110 WPM for Year 5
      6: 130, // 130 WPM for Year 6
    };
    
    return baseSpeeds[year as keyof typeof baseSpeeds] || 70;
  }

  /**
   * Get personalized recommendations based on assessment
   */
  static getPersonalizedRecommendations(assessment: ReadingAssessment): {
    storyRecommendations: string[];
    practiceAreas: string[];
    challenges: string[];
  } {
    const recommendations = {
      storyRecommendations: [] as string[],
      practiceAreas: [] as string[],
      challenges: [] as string[],
    };

    // Story recommendations based on level
    if (assessment.actualLevel === 'above') {
      recommendations.storyRecommendations = [
        `Try stories from Year ${assessment.recommendedYear} for a challenge`,
        'Explore more complex themes and vocabulary',
        'Try longer stories to build stamina',
      ];
    } else if (assessment.actualLevel === 'below') {
      recommendations.storyRecommendations = [
        `Focus on Year ${assessment.recommendedYear} stories to build confidence`,
        'Choose shorter stories to start with',
        'Pick familiar themes you enjoy',
      ];
    } else {
      recommendations.storyRecommendations = [
        'Continue with current year level stories',
        'Try a mix of different genres',
        'Challenge yourself with occasional harder stories',
      ];
    }

    // Practice areas based on weaknesses
    assessment.areasForImprovement.forEach(area => {
      if (area.includes('speed')) {
        recommendations.practiceAreas.push('Practice reading aloud daily');
        recommendations.practiceAreas.push('Try re-reading familiar stories for fluency');
      }
      if (area.includes('comprehension')) {
        recommendations.practiceAreas.push('Take time to think about questions before answering');
        recommendations.practiceAreas.push('Discuss stories with family or friends');
      }
      if (area.includes('vocabulary')) {
        recommendations.practiceAreas.push('Keep a vocabulary journal of new words');
        recommendations.practiceAreas.push('Use new words in your own sentences');
      }
    });

    // Challenges based on strengths
    assessment.strengths.forEach(strength => {
      if (strength.includes('speed')) {
        recommendations.challenges.push('Try speed reading exercises');
      }
      if (strength.includes('comprehension')) {
        recommendations.challenges.push('Try predicting what happens next in stories');
      }
      if (strength.includes('vocabulary')) {
        recommendations.challenges.push('Explore stories with more advanced vocabulary');
      }
    });

    return recommendations;
  }

  /**
   * Suggest appropriate stories based on assessment
   */
  static suggestStories(assessment: ReadingAssessment, availableStories: Array<{ grade_level: number; word_count: number; difficulty_rating: number; [key: string]: string | number | boolean }>): Array<{ grade_level: number; word_count: number; difficulty_rating: number; [key: string]: string | number | boolean }> {
    const targetConfig = getGradeLevelConfig(assessment.recommendedYear);
    
    return availableStories.filter(story => {
      // Match grade level
      if (story.grade_level !== assessment.recommendedYear) return false;
      
      // Prefer themes that match the target grade
      if (!targetConfig.storyElements.themes.some(theme => 
        story.genre?.toLowerCase().includes(theme.toLowerCase()) ||
        story.theme?.toLowerCase().includes(theme.toLowerCase())
      )) return false;
      
      return true;
    }).sort((a, b) => {
      // Prioritize based on user's performance patterns
      if (assessment.actualLevel === 'above') {
        // Prefer more challenging stories
        return (b.difficulty_rating || 0) - (a.difficulty_rating || 0);
      } else if (assessment.actualLevel === 'below') {
        // Prefer easier stories
        return (a.difficulty_rating || 0) - (b.difficulty_rating || 0);
      }
      // For 'at' level, prefer variety
      return Math.random() - 0.5;
    });
  }
}

/**
 * Helper function to calculate reading metrics from user answers
 */
export function calculateReadingMetrics(userAnswers: Array<{ score: number; [key: string]: string | number | boolean }>, readingSessions: Array<{ reading_time: number; [key: string]: string | number | boolean }>): Partial<UserPerformanceData> {
  if (!userAnswers.length || !readingSessions.length) {
    return {
      averageScore: 0,
      averageReadingTime: 0,
      questionAccuracy: {
        multiple_choice: 0,
        true_false: 0,
        short_answer: 0,
        sequence: 0,
        drag_drop: 0,
      },
      comprehensionSpeed: 0,
    };
  }

  // Calculate question accuracy by type
  const accuracyByType = userAnswers.reduce((acc, answer) => {
    const type = answer.question?.question_type || 'multiple_choice';
    if (!acc[type]) acc[type] = { correct: 0, total: 0 };
    
    acc[type].total++;
    if (answer.is_correct) acc[type].correct++;
    
    return acc;
  }, {} as Record<string, { correct: number; total: number }>);

  const questionAccuracy = Object.keys(accuracyByType).reduce((acc, type) => {
    acc[type as keyof typeof acc] = (accuracyByType[type].correct / accuracyByType[type].total) * 100;
    return acc;
  }, {
    multiple_choice: 0,
    true_false: 0,
    short_answer: 0,
    sequence: 0,
    drag_drop: 0,
  });

  // Calculate average score
  const averageScore = userAnswers.reduce((sum, answer) => sum + (answer.is_correct ? 100 : 0), 0) / userAnswers.length;

  // Calculate reading metrics
  const totalWordsRead = readingSessions.reduce((sum, session) => sum + (session.story?.word_count || 0), 0);
  const totalReadingTime = readingSessions.reduce((sum, session) => sum + (session.reading_time_minutes || 0), 0);
  
  const averageReadingTime = totalReadingTime / readingSessions.length;
  const comprehensionSpeed = totalReadingTime > 0 ? totalWordsRead / totalReadingTime : 0;

  return {
    averageScore,
    averageReadingTime,
    questionAccuracy,
    comprehensionSpeed,
  };
}