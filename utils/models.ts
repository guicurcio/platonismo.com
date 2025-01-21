/** 
 * Represents the structure of the response returned by 
 * the OpenAI endpoint https://api.openai.com/v1/models.
 */
interface OpenAIModelList {
    object: string;
    data: {
      id: string;
      object: string;
      created: number;
      owned_by: string;
      permission: any[];
      root: string;
      parent: string | null;
    }[];
  }
  
  /**
   * Fetches all available model IDs from the OpenAI API.
   *
   * @param {string} apiKey - Your OpenAI API key.
   * @returns {Promise<string[]>} An array of available model IDs.
   * @throws Will throw an error if the request fails or the response is invalid.
   */
  export async function getAvailableModels(apiKey: string): Promise<string[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
  
      // Check if the response status indicates an error
      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(
          `Failed to fetch models. Status: ${response.status}. Details: ${errorDetails}`
        );
      }
  
      // Parse the JSON response
      const data: OpenAIModelList = await response.json();
      // Map the array of model objects to just their IDs, then sort them
      return data.data.map((model) => model.id).sort();
    } catch (error) {
      // Capture and rethrow the error with additional context
      throw new Error(`Error retrieving available models: ${error}`);
    }
  }
  
  /**
   * Filters the available models to only those used for Chat (GPT-based models).
   *
   * @param {string} apiKey - Your OpenAI API key.
   * @returns {Promise<string[]>} An array of GPT-based model IDs.
   * @throws Will throw an error if fetching or filtering models fails.
   */
  export async function getAvailableChatModels(apiKey: string): Promise<string[]> {
    try {
      const models = await getAvailableModels(apiKey);
      // Return only those model IDs that start with "gpt-"
      return models.filter((model) => model.startsWith('gpt-'));
    } catch (error) {
      throw new Error(`Error retrieving available chat models: ${error}`);
    }
  }
  