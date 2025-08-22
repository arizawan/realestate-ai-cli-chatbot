import chalk from 'chalk';

/**
 * Cost tracking utility for OpenAI API usage
 * Tracks tokens and calculates costs per query and total session
 */
class CostTracker {
  constructor() {
    this.sessions = [];
    this.totalCost = 0;
    this.totalTokens = {
      input: 0,
      output: 0,
      total: 0
    };
    
    // OpenAI pricing (as of 2024) - GPT-3.5-turbo
    this.pricing = {
      input: 0.0015 / 1000,   // $0.0015 per 1K input tokens
      output: 0.002 / 1000    // $0.002 per 1K output tokens
    };
  }

  /**
   * Calculate cost for a query based on token usage
   */
  calculateQueryCost(inputTokens, outputTokens) {
    const inputCost = inputTokens * this.pricing.input;
    const outputCost = outputTokens * this.pricing.output;
    const totalCost = inputCost + outputCost;
    
    return {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      inputCost,
      outputCost,
      totalCost,
      formattedCost: `$${totalCost.toFixed(6)}`
    };
  }

  /**
   * Track a query with its costs
   */
  trackQuery(question, response, responseTime) {
    const usage = response.usage || {};
    let inputTokens = usage.prompt_tokens || 0;
    let outputTokens = usage.completion_tokens || 0;
    
    // Fallback: Estimate tokens if not provided by OpenAI
    if (inputTokens === 0 && outputTokens === 0) {
      // Rough estimation: ~4 characters per token
      inputTokens = Math.ceil((question.length + 1000) / 4); // question + system prompt estimation
      outputTokens = Math.ceil((response.answer?.length || 0) / 4);
      console.log(chalk.yellow('⚠️ Using estimated token counts (OpenAI usage data missing)'));
    }
    
    // Debug logging (only in debug mode)
    const isDebugMode = process.env.DEBUG_MODE === 'true';
    if (isDebugMode) {
      console.log(chalk.gray(`🔍 Cost tracking - Input: ${inputTokens}, Output: ${outputTokens}, Usage available: ${!!usage.prompt_tokens}`));
    }
    
    const cost = this.calculateQueryCost(inputTokens, outputTokens);
    
    const session = {
      question: question.substring(0, 50) + (question.length > 50 ? '...' : ''),
      responseTime,
      tokens: cost,
      timestamp: new Date().toISOString()
    };
    
    this.sessions.push(session);
    this.totalCost += cost.totalCost;
    this.totalTokens.input += inputTokens;
    this.totalTokens.output += outputTokens;
    this.totalTokens.total += cost.totalTokens;
    
    return cost;
  }

  /**
   * Get current session statistics
   */
  getSessionStats() {
    return {
      totalQueries: this.sessions.length,
      totalCost: this.totalCost,
      formattedTotalCost: `$${this.totalCost.toFixed(6)}`,
      totalTokens: this.totalTokens,
      averageCostPerQuery: this.sessions.length > 0 ? this.totalCost / this.sessions.length : 0,
      averageTokensPerQuery: this.sessions.length > 0 ? this.totalTokens.total / this.sessions.length : 0,
      sessions: this.sessions
    };
  }

  /**
   * Display cost information for a query
   */
  displayQueryCost(cost, responseTime) {
    const tokensInfo = cost.totalTokens > 0 ? 
      `Tokens: ${cost.totalTokens} (${cost.inputTokens}+${cost.outputTokens})` : 
      'Tokens: estimated';
    console.log(chalk.gray(`💰 Query cost: ${cost.formattedCost} | ${tokensInfo} | Time: ${responseTime}ms`));
  }

  /**
   * Display session summary on exit
   */
  displaySessionSummary() {
    const stats = this.getSessionStats();
    
    console.log(chalk.cyan('\n💰 Session Cost Summary'));
    console.log(chalk.gray('━'.repeat(40)));
    console.log(chalk.white(`Total Queries: ${stats.totalQueries}`));
    console.log(chalk.white(`Total Tokens: ${stats.totalTokens.total.toLocaleString()}`));
    console.log(chalk.gray(`  • Input: ${stats.totalTokens.input.toLocaleString()}`));
    console.log(chalk.gray(`  • Output: ${stats.totalTokens.output.toLocaleString()}`));
    console.log(chalk.green(`Total Cost: ${stats.formattedTotalCost}`));
    
    if (stats.totalQueries > 0) {
      console.log(chalk.yellow(`Average per query: $${stats.averageCostPerQuery.toFixed(6)}`));
      console.log(chalk.yellow(`Average tokens: ${Math.round(stats.averageTokensPerQuery)}`));
    }
    
    console.log(chalk.gray('━'.repeat(40)));
    
    // Cost comparison
    if (stats.totalCost > 0.01) {
      console.log(chalk.red('💡 Tip: Consider using shorter prompts to reduce costs'));
    } else if (stats.totalCost > 0.001) {
      console.log(chalk.yellow('💡 Good: Reasonable cost for this session'));
    } else {
      console.log(chalk.green('💡 Excellent: Very cost-effective session!'));
    }
  }

  /**
   * Get estimated cost for a given number of tokens
   */
  estimateCost(inputTokens, outputTokens = 0) {
    return this.calculateQueryCost(inputTokens, outputTokens);
  }
}

export default CostTracker;