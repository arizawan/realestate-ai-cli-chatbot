#!/usr/bin/env node

/**
 * Performance Benchmark Script
 * Tests chatbot performance under various conditions
 */

import dotenv from 'dotenv';
import chalk from 'chalk';

// Load environment variables
dotenv.config();

class PerformanceBenchmark {
  constructor() {
    this.results = {
      dataLoading: [],
      aiResponses: [],
      memoryUsage: [],
      totalQueries: 0
    };
  }

  /**
   * Benchmark data loading performance
   */
  async benchmarkDataLoading(iterations = 5) {
    console.log(chalk.yellow(`📊 Benchmarking data loading (${iterations} iterations)...`));

    const { default: PropertyDataLoader } = await import('../src/data-loader.js');

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      const startMemory = process.memoryUsage();

      const dataLoader = new PropertyDataLoader(18);
      const properties = await dataLoader.getProperties();

      const endTime = Date.now();
      const endMemory = process.memoryUsage();

      const result = {
        iteration: i + 1,
        loadTime: endTime - startTime,
        propertiesLoaded: properties.length,
        memoryDelta: endMemory.heapUsed - startMemory.heapUsed
      };

      this.results.dataLoading.push(result);
      process.stdout.write(chalk.gray(`.`));
    }

    console.log(chalk.green(' ✅ Data loading benchmark complete'));
  }

  /**
   * Benchmark AI response performance
   */
  async benchmarkAIResponses(iterations = 3) {
    console.log(chalk.yellow(`🤖 Benchmarking AI responses (${iterations} iterations)...`));

    try {
      const { default: RentalPropertyChatbot } = await import('../src/chatbot.js');
      const chatbot = new RentalPropertyChatbot();
      
      // Initialize chatbot
      await chatbot.initialize();

      const testQueries = [
        "What properties do you have under $50/night?",
        "Show me properties in Brazil",
        "I need a property with at least 2 bedrooms"
      ];

      for (let i = 0; i < iterations; i++) {
        for (const query of testQueries) {
          const startTime = Date.now();
          const startMemory = process.memoryUsage();

          const response = await chatbot.askQuestion(query);

          const endTime = Date.now();
          const endMemory = process.memoryUsage();

          const result = {
            iteration: i + 1,
            query: query.substring(0, 30) + '...',
            responseTime: endTime - startTime,
            tokensUsed: response.tokensUsed || 0,
            cost: response.cost?.totalCost || 0,
            memoryDelta: endMemory.heapUsed - startMemory.heapUsed
          };

          this.results.aiResponses.push(result);
          this.results.totalQueries++;
          process.stdout.write(chalk.gray(`.`));
        }
      }

      console.log(chalk.green(' ✅ AI response benchmark complete'));

    } catch (error) {
      console.log(chalk.red(` ❌ AI benchmark failed: ${error.message}`));
    }
  }

  /**
   * Monitor memory usage over time
   */
  async benchmarkMemoryUsage() {
    console.log(chalk.yellow('💾 Monitoring memory usage...'));

    const initialMemory = process.memoryUsage();
    this.results.memoryUsage.push({
      phase: 'initial',
      ...initialMemory,
      timestamp: Date.now()
    });

    // Memory usage after data loading
    const { default: PropertyDataLoader } = await import('../src/data-loader.js');
    const dataLoader = new PropertyDataLoader(18);
    await dataLoader.getProperties();

    const afterDataMemory = process.memoryUsage();
    this.results.memoryUsage.push({
      phase: 'after_data_loading',
      ...afterDataMemory,
      timestamp: Date.now()
    });

    console.log(chalk.green('✅ Memory usage monitoring complete'));
  }

  /**
   * Calculate statistics
   */
  calculateStatistics() {
    const stats = {
      dataLoading: this.calculateDataLoadingStats(),
      aiResponses: this.calculateAIResponseStats(),
      memory: this.calculateMemoryStats()
    };

    return stats;
  }

  /**
   * Calculate data loading statistics
   */
  calculateDataLoadingStats() {
    if (this.results.dataLoading.length === 0) return null;

    const loadTimes = this.results.dataLoading.map(r => r.loadTime);
    const memoryDeltas = this.results.dataLoading.map(r => r.memoryDelta);

    return {
      iterations: this.results.dataLoading.length,
      averageLoadTime: Math.round(loadTimes.reduce((a, b) => a + b) / loadTimes.length),
      minLoadTime: Math.min(...loadTimes),
      maxLoadTime: Math.max(...loadTimes),
      averageMemoryDelta: Math.round(memoryDeltas.reduce((a, b) => a + b) / memoryDeltas.length / 1024 / 1024),
      propertiesLoaded: this.results.dataLoading[0]?.propertiesLoaded || 0
    };
  }

  /**
   * Calculate AI response statistics
   */
  calculateAIResponseStats() {
    if (this.results.aiResponses.length === 0) return null;

    const responseTimes = this.results.aiResponses.map(r => r.responseTime);
    const tokens = this.results.aiResponses.map(r => r.tokensUsed).filter(t => t > 0);
    const costs = this.results.aiResponses.map(r => r.cost).filter(c => c > 0);

    return {
      totalQueries: this.results.aiResponses.length,
      averageResponseTime: Math.round(responseTimes.reduce((a, b) => a + b) / responseTimes.length),
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      averageTokens: tokens.length > 0 ? Math.round(tokens.reduce((a, b) => a + b) / tokens.length) : 0,
      totalCost: costs.reduce((a, b) => a + b, 0),
      averageCostPerQuery: costs.length > 0 ? costs.reduce((a, b) => a + b) / costs.length : 0
    };
  }

  /**
   * Calculate memory statistics
   */
  calculateMemoryStats() {
    if (this.results.memoryUsage.length === 0) return null;

    const initial = this.results.memoryUsage.find(m => m.phase === 'initial');
    const afterData = this.results.memoryUsage.find(m => m.phase === 'after_data_loading');

    return {
      initialMemory: Math.round(initial?.heapUsed / 1024 / 1024) || 0,
      afterDataLoading: Math.round(afterData?.heapUsed / 1024 / 1024) || 0,
      memoryIncrease: afterData && initial ? 
        Math.round((afterData.heapUsed - initial.heapUsed) / 1024 / 1024) : 0
    };
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const stats = this.calculateStatistics();

    console.log(chalk.blue.bold('\n📊 Performance Benchmark Report'));
    console.log(chalk.gray('━'.repeat(50)));

    // Data Loading Performance
    if (stats.dataLoading) {
      console.log(chalk.cyan('\n📊 Data Loading Performance:'));
      console.log(chalk.white(`   Average load time: ${stats.dataLoading.averageLoadTime}ms`));
      console.log(chalk.white(`   Range: ${stats.dataLoading.minLoadTime}ms - ${stats.dataLoading.maxLoadTime}ms`));
      console.log(chalk.white(`   Properties loaded: ${stats.dataLoading.propertiesLoaded}`));
      console.log(chalk.white(`   Memory impact: ${stats.dataLoading.averageMemoryDelta}MB`));

      // Performance assessment
      if (stats.dataLoading.averageLoadTime < 1000) {
        console.log(chalk.green('   Assessment: Excellent (< 1s)'));
      } else if (stats.dataLoading.averageLoadTime < 2000) {
        console.log(chalk.yellow('   Assessment: Good (< 2s)'));
      } else {
        console.log(chalk.red('   Assessment: Needs optimization (> 2s)'));
      }
    }

    // AI Response Performance  
    if (stats.aiResponses) {
      console.log(chalk.cyan('\n🤖 AI Response Performance:'));
      console.log(chalk.white(`   Total queries tested: ${stats.aiResponses.totalQueries}`));
      console.log(chalk.white(`   Average response time: ${stats.aiResponses.averageResponseTime}ms`));
      console.log(chalk.white(`   Range: ${stats.aiResponses.minResponseTime}ms - ${stats.aiResponses.maxResponseTime}ms`));
      console.log(chalk.white(`   Average tokens: ${stats.aiResponses.averageTokens}`));
      console.log(chalk.white(`   Total cost: $${stats.aiResponses.totalCost.toFixed(6)}`));
      console.log(chalk.white(`   Cost per query: $${stats.aiResponses.averageCostPerQuery.toFixed(6)}`));

      // Performance assessment
      if (stats.aiResponses.averageResponseTime < 1500) {
        console.log(chalk.green('   Assessment: Excellent (< 1.5s)'));
      } else if (stats.aiResponses.averageResponseTime < 3000) {
        console.log(chalk.yellow('   Assessment: Good (< 3s)'));
      } else {
        console.log(chalk.red('   Assessment: Needs optimization (> 3s)'));
      }
    }

    // Memory Usage
    if (stats.memory) {
      console.log(chalk.cyan('\n💾 Memory Usage:'));
      console.log(chalk.white(`   Initial memory: ${stats.memory.initialMemory}MB`));
      console.log(chalk.white(`   After data loading: ${stats.memory.afterDataLoading}MB`));
      console.log(chalk.white(`   Memory increase: ${stats.memory.memoryIncrease}MB`));

      // Memory assessment
      if (stats.memory.afterDataLoading < 50) {
        console.log(chalk.green('   Assessment: Excellent (< 50MB)'));
      } else if (stats.memory.afterDataLoading < 100) {
        console.log(chalk.yellow('   Assessment: Good (< 100MB)'));
      } else {
        console.log(chalk.red('   Assessment: High memory usage (> 100MB)'));
      }
    }

    // Overall assessment
    console.log(chalk.blue.bold('\n🎯 Overall Performance:'));
    const overallScore = this.calculateOverallScore(stats);
    
    if (overallScore >= 80) {
      console.log(chalk.green(`   Performance Score: ${overallScore}% - Excellent`));
      console.log(chalk.green('   🚀 Ready for production deployment'));
    } else if (overallScore >= 60) {
      console.log(chalk.yellow(`   Performance Score: ${overallScore}% - Good`));
      console.log(chalk.yellow('   💡 Consider optimizations for better performance'));
    } else {
      console.log(chalk.red(`   Performance Score: ${overallScore}% - Needs improvement`));
      console.log(chalk.red('   🔧 Optimization required before production'));
    }
  }

  /**
   * Calculate overall performance score
   */
  calculateOverallScore(stats) {
    let score = 0;
    let factors = 0;

    // Data loading score (30% weight)
    if (stats.dataLoading) {
      if (stats.dataLoading.averageLoadTime < 1000) score += 30;
      else if (stats.dataLoading.averageLoadTime < 2000) score += 20;
      else score += 10;
      factors++;
    }

    // AI response score (40% weight)
    if (stats.aiResponses) {
      if (stats.aiResponses.averageResponseTime < 1500) score += 40;
      else if (stats.aiResponses.averageResponseTime < 3000) score += 25;
      else score += 10;
      factors++;
    }

    // Memory score (30% weight)
    if (stats.memory) {
      if (stats.memory.afterDataLoading < 50) score += 30;
      else if (stats.memory.afterDataLoading < 100) score += 20;
      else score += 10;
      factors++;
    }

    return factors > 0 ? Math.round(score / factors * 100 / 100) : 0;
  }

  /**
   * Run complete benchmark suite
   */
  async run() {
    console.log(chalk.blue.bold('📊 Rental Property Chatbot - Performance Benchmark'));
    console.log(chalk.gray('Testing system performance under various conditions...\n'));

    await this.benchmarkMemoryUsage();
    await this.benchmarkDataLoading();
    await this.benchmarkAIResponses();

    this.generateReport();
  }
}

// Run benchmark if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const benchmark = new PerformanceBenchmark();
  benchmark.run().catch(error => {
    console.error(chalk.red('Benchmark failed:'), error);
    process.exit(1);
  });
}

export default PerformanceBenchmark;
