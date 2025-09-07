// Web search utility using SERP API for topic research
interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

interface SearchResponse {
  organic_results: SearchResult[];
  search_metadata: {
    status: string;
    query: string;
  };
}

export async function searchTopic(query: string, numResults: number = 5): Promise<SearchResult[]> {
  try {
    const apiKey = process.env.SERP_API_KEY;
    if (!apiKey) {
      throw new Error('SERP API key not configured');
    }

    const searchUrl = new URL('https://serpapi.com/search');
    searchUrl.searchParams.append('engine', 'google');
    searchUrl.searchParams.append('q', query);
    searchUrl.searchParams.append('api_key', apiKey);
    searchUrl.searchParams.append('num', numResults.toString());
    searchUrl.searchParams.append('safe', 'active'); // Safe search for children
    searchUrl.searchParams.append('lr', 'lang_en'); // English results only

    const response = await fetch(searchUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }

    const data: SearchResponse = await response.json();
    
    return data.organic_results || [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function researchTopicForStory(topic: string): Promise<string> {
  try {
    // Search for factual information about the topic
    const factualQuery = `${topic} facts for kids children educational`;
    const results = await searchTopic(factualQuery, 3);
    
    if (results.length === 0) {
      return `Topic: ${topic} - No additional research found, using general knowledge.`;
    }

    // Combine search results into research summary
    const researchSummary = results
      .map(result => `${result.title}: ${result.snippet}`)
      .join('\n\n');

    return `Research for "${topic}":\n\n${researchSummary}`;
  } catch (error) {
    console.error('Topic research error:', error);
    return `Topic: ${topic} - Research unavailable, using general knowledge.`;
  }
}