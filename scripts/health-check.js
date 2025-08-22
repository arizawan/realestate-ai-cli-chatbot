#!/usr/bin/env node

/**
 * Health Check Script
 * Validates system health and connectivity
 */

import dotenv from 'dotenv';
import chalk from 'chalk';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

class HealthChecker {
  constructor() {
    this.checks = [];
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0
    };
  }

  /**
   * Check OpenAI API connectivity
   */
  async checkOpenAIConnection() {
    console.log(chalk.yellow('🔌 Testing OpenAI API connection...'));
    
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey || apiKey === 'your-openai-api-key-here') {
        throw new Error('Invalid or missing API key');
      }

      const openai = new OpenAI({ apiKey });
      
      // Test with a minimal request
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5,
        temperature: 0
      });

      if (response.choices && response.choices[0]) {
        console.log(chalk.green('✅ OpenAI API: Connected successfully'));
        console.log(chalk.gray(`   Model: ${response.model || 'Unknown'}`));
        console.log(chalk.gray(`   Tokens used: ${response.usage?.total_tokens || 'Unknown'}`));
        this.results.passed++;
        return true;
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.log(chalk.red('❌ OpenAI API: Connection failed'));
      console.log(chalk.red(`   Error: ${error.message}`));
      this.results.failed++;
      return false;
    }
  }

  /**
   * Check data loading performance
   */
  async checkDataLoading() {
    console.log(chalk.yellow('📊 Testing data loading performance...'));

    try {
      const startTime = Date.now();
      
      // Import and test data loader
      const { default: PropertyDataLoader } = await import('../src/data-loader.js');
      const dataLoader = new PropertyDataLoader(18);
      
      const properties = await dataLoader.getProperties();
      const loadTime = Date.now() - startTime;

      if (properties && properties.length > 0) {
        console.log(chalk.green('✅ Data Loading: Success'));
        console.log(chalk.gray(`   Properties loaded: ${properties.length}`));
        console.log(chalk.gray(`   Load time: ${loadTime}ms`));
        
        if (loadTime > 2000) {
          console.log(chalk.yellow('⚠️ Warning: Slow data loading (>2s)'));
          this.results.warnings++;
        }
        
        this.results.passed++;
        return true;
      } else {
        throw new Error('No properties loaded');
      }

    } catch (error) {
      console.log(chalk.red('❌ Data Loading: Failed'));
      console.log(chalk.red(`   Error: ${error.message}`));
      this.results.failed++;
      return false;
    }
  }

  /**
   * Check system resources
   */
  checkSystemResources() {
    console.log(chalk.yellow('💻 Checking system resources...'));

    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      console.log(chalk.green('✅ System Resources: Available'));
      console.log(chalk.gray(`   Memory RSS: ${Math.round(memUsage.rss / 1024 / 1024)}MB`));
      console.log(chalk.gray(`   Memory Heap: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`));
      console.log(chalk.gray(`   Node.js: ${process.version}`));
      console.log(chalk.gray(`   Platform: ${process.platform}`));

      // Check memory usage
      if (memUsage.rss > 100 * 1024 * 1024) { // > 100MB
        console.log(chalk.yellow('⚠️ Warning: High memory usage'));
        this.results.warnings++;
      }

      this.results.passed++;
      return true;

    } catch (error) {
      console.log(chalk.red('❌ System Resources: Check failed'));
      console.log(chalk.red(`   Error: ${error.message}`));
      this.results.failed++;
      return false;
    }
  }

  /**
   * Check environment configuration
   */
  checkEnvironment() {
    console.log(chalk.yellow('⚙️ Checking environment configuration...'));

    const requiredVars = ['OPENAI_API_KEY'];
    const optionalVars = ['OPENAI_MODEL', 'TEMPERATURE', 'MAX_TOKENS'];
    
    let configScore = 0;
    const totalConfig = requiredVars.length + optionalVars.length;

    // Check required variables
    for (const varName of requiredVars) {
      if (process.env[varName] && process.env[varName] !== 'your-openai-api-key-here') {
        configScore++;
      }
    }

    // Check optional variables
    for (const varName of optionalVars) {
      if (process.env[varName]) {
        configScore++;
      }
    }

    const configPercent = Math.round((configScore / totalConfig) * 100);

    if (configScore === totalConfig) {
      console.log(chalk.green('✅ Environment: Fully configured'));
      this.results.passed++;
    } else if (configScore >= requiredVars.length) {
      console.log(chalk.yellow(`⚠️ Environment: Partially configured (${configPercent}%)`));
      this.results.warnings++;
    } else {
      console.log(chalk.red('❌ Environment: Missing required configuration'));
      this.results.failed++;
    }

    console.log(chalk.gray(`   Configuration score: ${configScore}/${totalConfig}`));
    return configScore >= requiredVars.length;
  }

  /**
   * Generate health report
   */
  generateReport() {
    console.log(chalk.blue.bold('\n🏥 Health Check Summary'));
    console.log(chalk.gray('━'.repeat(50)));

    const total = this.results.passed + this.results.failed + this.results.warnings;
    const healthScore = Math.round((this.results.passed / total) * 100);

    console.log(chalk.green(`✅ Passed: ${this.results.passed}`));
    console.log(chalk.yellow(`⚠️ Warnings: ${this.results.warnings}`));
    console.log(chalk.red(`❌ Failed: ${this.results.failed}`));
    console.log(chalk.cyan(`📊 Health Score: ${healthScore}%`));

    if (this.results.failed === 0) {
      console.log(chalk.green('\n🎉 System is healthy and ready!'));
      if (this.results.warnings > 0) {
        console.log(chalk.yellow('💡 Consider addressing warnings for optimal performance'));
      }
    } else {
      console.log(chalk.red('\n🚨 System has critical issues'));
      console.log(chalk.red('Please fix failed checks before proceeding'));
      process.exit(1);
    }
  }

  /**
   * Run all health checks
   */
  async run() {
    console.log(chalk.blue.bold('🏥 Rental Property Chatbot - Health Check'));
    console.log(chalk.gray('Verifying system health and readiness...\n'));

    // Run checks in sequence
    this.checkEnvironment();
    await this.checkDataLoading();
    await this.checkOpenAIConnection();
    this.checkSystemResources();

    this.generateReport();
  }
}

// Run health check if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const healthChecker = new HealthChecker();
  healthChecker.run().catch(error => {
    console.error(chalk.red('Health check failed:'), error);
    process.exit(1);
  });
}

export default HealthChecker;
