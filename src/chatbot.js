#!/usr/bin/env node

import dotenv from 'dotenv';
import readline from 'readline';
import chalk from 'chalk';
import PropertyDataLoader from './data-loader.js';
import LLMService from './llm-service.js';
import CostTracker from './cost-tracker.js';
import ThinkingAnimation from './thinking-animation.js';

// Load environment variables
dotenv.config();

/**
 * Fast and Accurate Rental Property Chatbot
 * Now using local JSON data for GitHub-ready deployment
 */
class RentalPropertyChatbot {
  constructor() {
    this.dataLoader = null;
    this.llmService = null;
    this.isInitialized = false;
    this.questionCount = 0;
    this.costTracker = new CostTracker();
    this.thinkingAnimation = new ThinkingAnimation();
    
    // Configuration from environment - Production ready
    this.config = {
      // AI Configuration
      openaiApiKey: process.env.OPENAI_API_KEY,
      openaiModel: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      temperature: parseFloat(process.env.TEMPERATURE) || 0.2,
      maxTokens: parseInt(process.env.MAX_TOKENS) || 400,
      
      // Data Configuration
      dataSource: process.env.DATA_SOURCE || 'json',
      maxProperties: parseInt(process.env.MAX_PROPERTIES) || 18,
      jsonDataPath: process.env.JSON_DATA_PATH || './data/properties.json',
      
      // Performance Configuration
      responseTimeout: parseInt(process.env.RESPONSE_TIMEOUT) || 30000,
      debugMode: process.env.DEBUG_MODE === 'true',
      enableCostTracking: process.env.ENABLE_COST_TRACKING !== 'false',
      cacheSystemPrompt: process.env.CACHE_SYSTEM_PROMPT !== 'false',
      
      // UX Configuration
      enableAnimations: process.env.ENABLE_ANIMATIONS !== 'false',
      animationStyle: process.env.ANIMATION_STYLE || 'brain',
      welcomeMessage: process.env.WELCOME_MESSAGE || 'default',
      showPerformanceMetrics: process.env.SHOW_PERFORMANCE_METRICS !== 'false'
    };
  }

  /**
   * Initialize chatbot with data and AI services
   */
  async initialize() {
    try {
      console.log(chalk.blue.bold('🚀 Initializing Rental Property Chatbot...'));
      console.log(chalk.gray('━'.repeat(50)));

      // Validate configuration
      if (!this.config.openaiApiKey) {
        throw new Error('OPENAI_API_KEY is required. Please set it in your .env file.');
      }

      // Initialize data loader (now uses JSON)
      console.log(chalk.yellow('📊 Setting up local data loader...'));
      this.dataLoader = new PropertyDataLoader(this.config.maxProperties);

      // Initialize LLM service (configurable)
      console.log(chalk.yellow(`🤖 Setting up AI service (${this.config.openaiModel})...`));
      this.llmService = new LLMService(this.config.openaiApiKey, {
        model: this.config.openaiModel,
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
        responseTimeout: this.config.responseTimeout,
        cacheSystemPrompt: this.config.cacheSystemPrompt
      });

      // Validate AI connection
      const isConnected = await this.llmService.validateConnection();
      if (!isConnected) {
        throw new Error('Failed to connect to OpenAI. Please check your API key.');
      }

      // Load property data from JSON
      console.log(chalk.yellow('🏠 Loading property data from JSON...'));
      const properties = await this.dataLoader.getProperties();
      
      if (!properties || properties.length === 0) {
        throw new Error('No property data available. Please check the JSON file.');
      }

      // Feed data to AI
      this.llmService.setProperties(properties);

      this.isInitialized = true;
      
      console.log(chalk.gray('━'.repeat(50)));
      console.log(chalk.green.bold('✅ Chatbot initialized successfully!'));
      
      const metadata = this.dataLoader.getMetadata();
      console.log(chalk.cyan(`🏠 Loaded ${properties.length} properties from JSON`));
      console.log(chalk.cyan(`🌍 Geographic coverage: ${[...new Set(properties.map(p => p.location.split(',')[1]?.trim()))].length} countries`));
      console.log(chalk.cyan(`📊 Price range: $${Math.min(...properties.map(p => p.price))}-$${Math.max(...properties.map(p => p.price))}/night`));
      
      // Show developer info and build details
      if (this.config.debugMode) {
        console.log(chalk.gray('━'.repeat(50)));
        console.log(chalk.gray('👨‍💻 Built by: Ahmed Rizawan'));
        console.log(chalk.gray('📝 For: Lamco MVP Hiring Process'));
        console.log(chalk.gray('🤖 AI Model: ' + this.config.openaiModel));
        console.log(chalk.gray('📊 Properties: ' + this.config.maxProperties));
        console.log(chalk.gray('💰 Cost Tracking: ' + (this.config.enableCostTracking ? 'Enabled' : 'Disabled')));
        console.log(chalk.gray('━'.repeat(50)));
      }
      
      return true;
      
    } catch (error) {
      console.error(chalk.red.bold('❌ Initialization failed:'), error.message);
      console.log(chalk.yellow('\n💡 Troubleshooting tips:'));
      console.log(chalk.gray('   1. Make sure you have copied .env.example to .env'));
      console.log(chalk.gray('   2. Add your OpenAI API key to the .env file'));
      console.log(chalk.gray('   3. Ensure data/properties.json exists and is valid'));
      console.log(chalk.gray('   4. Check your internet connection for OpenAI API'));
      
      return false;
    }
  }

  /**
   * Process user question with animations and cost tracking
   */
  async askQuestion(question) {
    if (!this.isInitialized) {
      throw new Error('Chatbot not initialized. Please call initialize() first.');
    }

    const startTime = Date.now();
    this.questionCount++;

    try {
      // Start thinking animation (if enabled)
      if (this.config.enableAnimations) {
        this.thinkingAnimation.start(this.config.animationStyle);
      }
      
      // Get AI response
      const response = await this.llmService.answerQuestion(question);
      const responseTime = Date.now() - startTime;
      
      // Stop animation
      if (this.config.enableAnimations) {
        this.thinkingAnimation.stop();
      }
      
      // Track costs (if enabled)
      let cost = null;
      if (this.config.enableCostTracking) {
        cost = this.costTracker.trackQuery(question, response, responseTime);
        
        // Display cost and performance info (if enabled)
        if (this.config.showPerformanceMetrics) {
          this.costTracker.displayQueryCost(cost, responseTime);
        }
      }

      return {
        ...response,
        responseTime: responseTime,
        questionNumber: this.questionCount,
        cost: cost
      };

    } catch (error) {
      // Stop animation on error (if enabled)
      if (this.config.enableAnimations) {
        this.thinkingAnimation.stop();
      }
      
      console.error(chalk.red('❌ Error processing question:'), error.message);
      
      return {
        question: question,
        answer: "I apologize, but I encountered an error while processing your question. Please try rephrasing your question or ask about specific properties, locations, or facilities.",
        error: error.message,
        responseTime: Date.now() - startTime,
        questionNumber: this.questionCount
      };
    }
  }

  /**
   * Display welcome message and instructions
   */
  displayWelcome() {
    const welcomeType = this.config.welcomeMessage;
    
    if (welcomeType === 'custom') {
      console.log(chalk.blue.bold('\n🏠 Welcome to Your Personal Property Assistant!'));
      console.log(chalk.gray('━'.repeat(55)));
      console.log(chalk.white('Hi there! I\'m here to help you discover amazing rental properties '));
      console.log(chalk.white('from our carefully curated collection of 18 global destinations.'));
      console.log(chalk.cyan('✨ What makes me special:'));
      console.log(chalk.gray('   • Lightning-fast AI responses (< 1.5s typical)'));
      console.log(chalk.gray('   • Real-time cost tracking (transparent pricing)'));
      console.log(chalk.gray('   • Smart recommendations based on your preferences'));
      console.log(chalk.gray('   • Coverage across 12 countries worldwide\n'));
      console.log(chalk.yellow('💡 Pro tip: Be specific about what you\'re looking for!'));
      console.log(chalk.white('   The more details you provide, the better I can help.\n'));
    } else {
      console.log(chalk.blue.bold('\n🏠 Welcome to the Rental Property Chatbot!'));
      console.log(chalk.gray('━'.repeat(50)));
      console.log(chalk.white('I can help you find the perfect rental property from our curated selection.'));
      console.log(chalk.white('Ask me about locations, prices, facilities, or specific preferences!'));
      console.log(chalk.cyan('✨ Features: Fast responses, cost tracking, 18 global properties\n'));
    }
    
    // Display suggested questions
    const suggestions = this.llmService.getSuggestedQuestions();
    if (suggestions.length > 0) {
      console.log(chalk.cyan('💡 Try asking questions like:'));
      suggestions.slice(0, 5).forEach((question, index) => {
        console.log(chalk.gray(`   ${index + 1}. ${question}`));
      });
      console.log('');
    }

    // Display stats
    const stats = this.dataLoader.getStats();
    if (stats) {
      console.log(chalk.yellow(`📊 Available Properties: ${stats.totalProperties} | Price Range: $${stats.priceRange.min}-$${stats.priceRange.max}/night | Countries: ${stats.countries}`));
      console.log(chalk.gray(`📂 Data Source: ${stats.dataSource}`));
    }
    
    console.log(chalk.gray('━'.repeat(50)));
    console.log(chalk.green('Type your question and press Enter. Type "exit" to quit.\n'));
  }

  /**
   * Start interactive CLI session
   */
  async startInteractiveSession() {
    if (!this.isInitialized) {
      console.error(chalk.red('❌ Chatbot not initialized. Please run initialize() first.'));
      return;
    }

    this.displayWelcome();

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.blue('🤔 Ask me anything: ')
    });

    rl.prompt();

    rl.on('line', async (input) => {
      const question = input.trim();

      // Handle exit commands
      if (['exit', 'quit', 'bye', 'goodbye'].includes(question.toLowerCase())) {
        console.log(chalk.green('\n👋 Thank you for using the Rental Property Chatbot!'));
        console.log(chalk.white('It was a pleasure helping you explore rental properties.'));
        console.log(chalk.cyan(`📊 Session Stats: ${this.questionCount} questions answered`));
        
        if (this.questionCount > 0) {
          console.log(chalk.yellow('🌟 Hope you found some amazing properties for your next adventure!'));
        }
        
        // Display cost summary (if cost tracking enabled)
        if (this.config.enableCostTracking && this.questionCount > 0) {
          this.costTracker.displaySessionSummary();
        }
        
        rl.close();
        return;
      }

      // Handle empty input
      if (!question) {
        rl.prompt();
        return;
      }

      // Handle help commands
      if (['help', '?'].includes(question.toLowerCase())) {
        const suggestions = this.llmService.getSuggestedQuestions();
        console.log(chalk.cyan('\n💡 Here are some things you can ask:'));
        suggestions.slice(0, 8).forEach((q, i) => {
          console.log(chalk.gray(`   • ${q}`));
        });
        console.log('');
        rl.prompt();
        return;
      }

      // Process the question (animation will show automatically)
      try {
        const response = await this.askQuestion(question);
        
        console.log(chalk.green('\n📝 Answer:'));
        console.log(chalk.white(response.answer));
        
      } catch (error) {
        console.log(chalk.red('\n❌ Sorry, I encountered an error processing your question.'));
        console.log(chalk.gray('Please try rephrasing your question or ask for help.'));
      }

      console.log('');
      rl.prompt();
    });

    rl.on('close', () => {
      console.log(chalk.blue('\n🏠 Goodbye! Happy property hunting!'));
      console.log(chalk.gray('Built with ❤️ for the Lamco MVP hiring process'));
      console.log(chalk.gray('Created by Ahmed Maher Algohary - Full Stack Developer'));
      
      // Show final cost summary if there were any queries and cost tracking enabled
      if (this.config.enableCostTracking && this.questionCount > 0) {
        this.costTracker.displaySessionSummary();
      }
      
      process.exit(0);
    });
  }

  /**
   * Get chatbot statistics and health info
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      questionsAnswered: this.questionCount,
      dataLoader: this.dataLoader?.getStats(),
      llmService: this.llmService?.getStats(),
      config: {
        maxProperties: this.config.maxProperties,
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
        dataSource: this.config.dataSource
      },
      timestamp: new Date().toISOString()
    };
  }
}

// Main execution for CLI usage
async function main() {
  const chatbot = new RentalPropertyChatbot();
  
  const initialized = await chatbot.initialize();
  if (!initialized) {
    process.exit(1);
  }

  await chatbot.startInteractiveSession();
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('💥 Fatal error:'), error.message);
    process.exit(1);
  });
}

export default RentalPropertyChatbot;