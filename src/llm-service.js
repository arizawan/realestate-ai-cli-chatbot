import OpenAI from 'openai';
import chalk from 'chalk';

/**
 * LLM Service for fast and accurate property question answering
 * Optimized for rental property queries with advanced prompt engineering
 */
class LLMService {
  constructor(apiKey, options = {}) {
    this.openai = new OpenAI({
      apiKey: apiKey
    });
    
    this.options = {
      model: options.model || 'gpt-3.5-turbo',
      temperature: options.temperature || 0.2,
      maxTokens: options.maxTokens || 400,
      responseTimeout: options.responseTimeout || 30000,
      cacheSystemPrompt: options.cacheSystemPrompt !== false,
      stream: false, // Ensure we get complete response quickly
      ...options
    };
    
    // Cache for system prompt if enabled
    this.cachedSystemPrompt = null;
    
    this.properties = [];
    console.log(chalk.green('🤖 LLM Service initialized with OpenAI'));
  }

  /**
   * Set property data for AI context
   */
  setProperties(properties) {
    this.properties = properties;
    console.log(chalk.blue(`📊 Loaded ${properties.length} properties into AI context`));
  }

  /**
   * Generate system prompt with property data
   */
  generateSystemPrompt() {
    const propertyData = this.properties.map(property => {
      return `Property ${property.index}: ${property.title}
- Location: ${property.location}
- Price: ${property.priceDisplay}
- Description: ${property.description}
- Facilities: ${property.facilitiesText}
- Address: ${property.address}`;
    }).join('\n\n');

    return `You are a helpful and knowledgeable rental property assistant. You have access to ${this.properties.length} rental properties and can answer questions about them quickly and accurately.

PROPERTY DATABASE:
${propertyData}

INSTRUCTIONS:
- Answer questions about rental properties using ONLY the data provided above
- Be concise but informative in your responses
- Always mention specific property details (price, location, facilities) when relevant
- If asked about properties not in the database, politely explain you only have information about the ${this.properties.length} properties listed
- For location-based queries, suggest the most relevant properties
- For budget-based queries, recommend properties within the specified price range
- For facility-based queries (bedrooms, bathrooms, parking), match user needs to property facilities
- Always format prices as shown (e.g., $123/night)
- Be helpful and enthusiastic about the properties

RESPONSE FORMAT:
- Keep responses under 200 words for quick reading and faster generation
- Use bullet points for multiple property recommendations
- Include property names, locations, and prices
- Mention key facilities that match the user's needs
- Be concise but helpful - prioritize speed and clarity
- Write in a friendly, conversational tone
- Use encouraging language and show genuine enthusiasm for helping
- Add personal touches like "Perfect for you!" or "You'll love this!"
- Show empathy if no exact matches found: "I understand you're looking for..."`;
  }

  /**
   * Process user question with advanced prompt engineering
   */
  async answerQuestion(userQuestion) {
    try {
      console.log(chalk.yellow('🧠 Processing question with AI...'));
      
      if (!this.properties || this.properties.length === 0) {
        throw new Error('No property data loaded. Please load properties first.');
      }

      // Use cached system prompt if enabled, otherwise generate fresh
      const systemPrompt = this.options.cacheSystemPrompt && this.cachedSystemPrompt 
        ? this.cachedSystemPrompt 
        : this.generateSystemPrompt();
      
      // Cache the system prompt for future use if caching is enabled
      if (this.options.cacheSystemPrompt && !this.cachedSystemPrompt) {
        this.cachedSystemPrompt = systemPrompt;
      }
      
      const response = await this.openai.chat.completions.create({
        model: this.options.model,
        temperature: this.options.temperature,
        max_tokens: this.options.maxTokens,
        stream: false, // Ensure we get usage data
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Question: ${userQuestion}`
          }
        ]
      });

      const answer = response.choices[0]?.message?.content;
      
      if (!answer) {
        throw new Error('No response received from AI');
      }

      console.log(chalk.green('✅ AI response generated successfully'));
      
      // Debug: Log usage data (only in debug mode)
      const isDebugMode = process.env.DEBUG_MODE === 'true';
      if (isDebugMode) {
        if (response.usage) {
          console.log(chalk.gray(`🔍 Tokens - Prompt: ${response.usage.prompt_tokens}, Completion: ${response.usage.completion_tokens}, Total: ${response.usage.total_tokens}`));
        } else {
          console.log(chalk.yellow('⚠️ No usage data received from OpenAI'));
        }
      }
      
      return {
        question: userQuestion,
        answer: answer.trim(),
        tokensUsed: response.usage?.total_tokens || 0,
        usage: response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        model: this.options.model,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(chalk.red('❌ Error processing question:'), error.message);
      
      // Return fallback response for better user experience
      return {
        question: userQuestion,
        answer: "I apologize, but I'm having trouble processing your question right now. Please try asking about specific properties, locations, price ranges, or facilities you're looking for.",
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get suggested questions based on available properties
   */
  getSuggestedQuestions() {
    if (!this.properties || this.properties.length === 0) {
      return [];
    }

    const locations = [...new Set(this.properties.map(p => p.location.split(',')[0]))];
    const prices = this.properties.map(p => p.price).filter(p => p > 0);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return [
      "What properties do you have available?",
      `Show me properties under $${Math.round((minPrice + maxPrice) / 2)}/night`,
      `What properties are available in ${locations[0]}?`,
      "I need a property with at least 2 bedrooms",
      "What's the cheapest property available?",
      "Show me luxury properties",
      "I need a place with parking",
      `Do you have anything in ${locations[1] || locations[0]}?`,
      "What properties have the most bathrooms?",
      "I'm looking for a romantic getaway"
    ];
  }

  /**
   * Validate API key and connection
   */
  async validateConnection() {
    try {
      console.log(chalk.yellow('🔑 Validating OpenAI connection...'));
      
      await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 1
      });
      
      console.log(chalk.green('✅ OpenAI connection validated'));
      return true;
      
    } catch (error) {
      console.error(chalk.red('❌ OpenAI connection failed:'), error.message);
      return false;
    }
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      model: this.options.model,
      temperature: this.options.temperature,
      maxTokens: this.options.maxTokens,
      propertiesLoaded: this.properties.length,
      lastUpdate: this.properties.length > 0 ? new Date().toISOString() : null
    };
  }
}

export default LLMService;