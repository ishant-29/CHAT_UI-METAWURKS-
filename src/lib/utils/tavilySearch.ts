export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface TavilyResponse {
  results: TavilySearchResult[];
  answer?: string;
}

/**
 * Determines if a query needs web search
 * Returns true for queries about current events, latest info, real-time data
 */
export function shouldUseWebSearch(query: string): boolean {
  const searchTriggers = [
    // Time-sensitive
    'latest', 'recent', 'current', 'today', 'now', 'this week', 'this month', 'this year',
    // News and events
    'news', 'update', 'announcement', 'release', 'launched',
    // Real-time data
    'weather', 'stock', 'price', 'score', 'result',
    // Factual lookups
    'what is', 'who is', 'where is', 'when did', 'how to',
    // Comparisons
    'vs', 'versus', 'compare', 'difference between',
    // Specific queries
    'website', 'official', 'documentation', 'guide',
  ];

  const lowerQuery = query.toLowerCase();
  return searchTriggers.some(trigger => lowerQuery.includes(trigger));
}

/**
 * Performs web search using Tavily API
 */
export async function searchWeb(query: string): Promise<TavilyResponse | null> {
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: query,
        search_depth: 'basic',
        include_answer: true,
        max_results: 5,
      }),
    });

    if (!response.ok) {
      console.error('Tavily API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Tavily search error:', error);
    return null;
  }
}

/**
 * Formats search results into context for LLM
 */
export function formatSearchContext(searchData: TavilyResponse): string {
  if (!searchData.results || searchData.results.length === 0) {
    return '';
  }

  const context = searchData.results
    .map((result, index) => {
      return `[${index + 1}] ${result.title}\n${result.content}\nSource: ${result.url}`;
    })
    .join('\n\n');

  return `Web Search Results:\n\n${context}\n\n---\n\n`;
}

/**
 * Extracts source citations from search results
 */
export function extractCitations(searchData: TavilyResponse): string[] {
  if (!searchData.results) return [];
  return searchData.results.map(r => r.url);
}
