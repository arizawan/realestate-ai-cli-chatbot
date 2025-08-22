#!/usr/bin/env node

/**
 * Configuration Validation Script
 * Validates environment configuration and dependencies
 */

import dotenv from 'dotenv';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

class ConfigValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = 0;
  }

  /**
   * Validate environment configuration
   */
  validateEnvironment() {
    console.log(chalk.blue.bold('\n🔍 Environment Configuration Validation'));
    console.log(chalk.gray('━'.repeat(50)));

    // Required variables
    const required = {
      'OPENAI_API_KEY': 'OpenAI API key for AI functionality',
    };

    // Optional but recommended variables
    const recommended = {
      'OPENAI_MODEL': 'AI model selection',
      'TEMPERATURE': 'AI response consistency',
      'MAX_TOKENS': 'Response length limit',
      'DATA_SOURCE': 'Data source configuration',
      'MAX_PROPERTIES': 'Property limit setting'
    };

    // Check required variables
    for (const [key, description] of Object.entries(required)) {
      if (!process.env[key]) {
        this.errors.push(`❌ Missing required: ${key} (${description})`);
      } else if (process.env[key] === 'your-openai-api-key-here') {
        this.errors.push(`❌ Default placeholder: ${key} needs actual value`);
      } else {
        console.log(chalk.green(`✅ ${key}: ${this.maskApiKey(process.env[key])}`));
        this.passed++;
      }
    }

    // Check recommended variables
    for (const [key, description] of Object.entries(recommended)) {
      if (!process.env[key]) {
        this.warnings.push(`⚠️ Missing recommended: ${key} (${description})`);
      } else {
        console.log(chalk.cyan(`✅ ${key}: ${process.env[key]}`));
        this.passed++;
      }
    }
  }

  /**
   * Validate file system dependencies
   */
  validateFiles() {
    console.log(chalk.blue.bold('\n📁 File System Validation'));
    console.log(chalk.gray('━'.repeat(50)));

    const requiredFiles = [
      'src/chatbot.js',
      'src/data-loader.js', 
      'src/llm-service.js',
      'src/cost-tracker.js',
      'src/thinking-animation.js',
      'data/properties.json'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(chalk.green(`✅ ${file} (${this.formatBytes(stats.size)})`));
        this.passed++;
      } else {
        this.errors.push(`❌ Missing file: ${file}`);
      }
    }
  }

  /**
   * Validate JSON data structure
   */
  validateDataStructure() {
    console.log(chalk.blue.bold('\n📊 Data Structure Validation'));
    console.log(chalk.gray('━'.repeat(50)));

    try {
      const dataPath = path.join(process.cwd(), 'data/properties.json');
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

      if (data.metadata) {
        console.log(chalk.green(`✅ Metadata: ${data.metadata.total_properties} properties`));
        console.log(chalk.green(`✅ Countries: ${data.metadata.countries}`));
        console.log(chalk.green(`✅ Price range: ${data.metadata.price_range}`));
        this.passed += 3;
      }

      if (data.properties && Array.isArray(data.properties)) {
        console.log(chalk.green(`✅ Properties array: ${data.properties.length} items`));
        
        // Validate property structure
        const sampleProperty = data.properties[0];
        const requiredFields = ['id', 'title', 'price', 'location', 'description'];
        
        for (const field of requiredFields) {
          if (sampleProperty[field]) {
            this.passed++;
          } else {
            this.warnings.push(`⚠️ Property missing field: ${field}`);
          }
        }
      } else {
        this.errors.push('❌ Invalid properties data structure');
      }

    } catch (error) {
      this.errors.push(`❌ JSON parsing error: ${error.message}`);
    }
  }

  /**
   * Validate AI model configuration
   */
  validateAIConfig() {
    console.log(chalk.blue.bold('\n🤖 AI Configuration Validation'));
    console.log(chalk.gray('━'.repeat(50)));

    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    const temperature = parseFloat(process.env.TEMPERATURE || '0.2');
    const maxTokens = parseInt(process.env.MAX_TOKENS || '400');

    // Validate model
    const validModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'];
    if (validModels.includes(model)) {
      console.log(chalk.green(`✅ Model: ${model}`));
      this.passed++;
    } else {
      this.warnings.push(`⚠️ Unusual model: ${model}`);
    }

    // Validate temperature
    if (temperature >= 0 && temperature <= 2) {
      console.log(chalk.green(`✅ Temperature: ${temperature}`));
      this.passed++;
    } else {
      this.errors.push(`❌ Invalid temperature: ${temperature} (must be 0-2)`);
    }

    // Validate max tokens
    if (maxTokens > 0 && maxTokens <= 4000) {
      console.log(chalk.green(`✅ Max tokens: ${maxTokens}`));
      this.passed++;
    } else {
      this.errors.push(`❌ Invalid max tokens: ${maxTokens} (must be 1-4000)`);
    }
  }

  /**
   * Generate validation report
   */
  generateReport() {
    console.log(chalk.blue.bold('\n📋 Validation Summary'));
    console.log(chalk.gray('━'.repeat(50)));

    console.log(chalk.green(`✅ Passed checks: ${this.passed}`));
    console.log(chalk.yellow(`⚠️ Warnings: ${this.warnings.length}`));
    console.log(chalk.red(`❌ Errors: ${this.errors.length}`));

    if (this.warnings.length > 0) {
      console.log(chalk.yellow('\n⚠️ Warnings:'));
      this.warnings.forEach(warning => console.log(`   ${warning}`));
    }

    if (this.errors.length > 0) {
      console.log(chalk.red('\n❌ Errors:'));
      this.errors.forEach(error => console.log(`   ${error}`));
      console.log(chalk.red('\n🚨 Please fix errors before deployment'));
      process.exit(1);
    } else {
      console.log(chalk.green('\n🎉 Configuration validation passed!'));
      console.log(chalk.cyan('Ready for deployment 🚀'));
    }
  }

  /**
   * Utility: Mask API key for display
   */
  maskApiKey(key) {
    if (!key) return 'Not set';
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
  }

  /**
   * Utility: Format file size
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Run all validations
   */
  async run() {
    console.log(chalk.blue.bold('🔍 Rental Property Chatbot - Configuration Validation'));
    console.log(chalk.gray('Ensuring production readiness...'));

    this.validateEnvironment();
    this.validateFiles();
    this.validateDataStructure();
    this.validateAIConfig();
    this.generateReport();
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ConfigValidator();
  validator.run().catch(console.error);
}

export default ConfigValidator;
