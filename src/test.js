#!/usr/bin/env node

import chalk from 'chalk';
import RentalPropertyChatbot from './chatbot.js';

/**
 * Simple test script for the Rental Property Chatbot
 * Tests basic functionality and performance
 */

async function runTests() {
  console.log(chalk.blue.bold('🧪 Running Rental Property Chatbot Tests'));
  console.log(chalk.gray('━'.repeat(50)));

  const chatbot = new RentalPropertyChatbot();
  let testsPassed = 0;
  let totalTests = 0;

  // Test 1: Initialization
  console.log(chalk.yellow('Test 1: Chatbot Initialization'));
  totalTests++;
  try {
    const initialized = await chatbot.initialize();
    if (initialized) {
      console.log(chalk.green('✅ Initialization successful'));
      testsPassed++;
    } else {
      console.log(chalk.red('❌ Initialization failed'));
    }
  } catch (error) {
    console.log(chalk.red('❌ Initialization error:'), error.message);
  }

  // Test 2: Status Check
  console.log(chalk.yellow('\nTest 2: Status Check'));
  totalTests++;
  try {
    const status = chatbot.getStatus();
    if (status.initialized && status.dataLoader && status.llmService) {
      console.log(chalk.green('✅ Status check passed'));
      console.log(chalk.cyan(`   Properties loaded: ${status.dataLoader.totalProperties}`));
      console.log(chalk.cyan(`   Countries: ${status.dataLoader.countries}`));
      console.log(chalk.cyan(`   Price range: $${status.dataLoader.priceRange.min}-$${status.dataLoader.priceRange.max}/night`));
      testsPassed++;
    } else {
      console.log(chalk.red('❌ Status check failed'));
    }
  } catch (error) {
    console.log(chalk.red('❌ Status check error:'), error.message);
  }

  // Test 3: Sample Questions
  if (chatbot.isInitialized) {
    const testQuestions = [
      "What properties do you have available?",
      "Show me the cheapest property",
      "I need a place with parking"
    ];

    for (let i = 0; i < testQuestions.length; i++) {
      const question = testQuestions[i];
      console.log(chalk.yellow(`\nTest ${3 + i}: Question "${question}"`));
      totalTests++;
      
      try {
        const startTime = Date.now();
        const response = await chatbot.askQuestion(question);
        const responseTime = Date.now() - startTime;
        
        if (response.answer && response.answer.length > 10) {
          console.log(chalk.green(`✅ Question answered in ${responseTime}ms`));
          console.log(chalk.gray(`   Answer preview: ${response.answer.substring(0, 100)}...`));
          testsPassed++;
        } else {
          console.log(chalk.red('❌ Invalid response received'));
        }
      } catch (error) {
        console.log(chalk.red('❌ Question failed:'), error.message);
      }
    }
  }

  // Test Results
  console.log(chalk.gray('\n' + '━'.repeat(50)));
  console.log(chalk.blue.bold('📊 Test Results'));
  console.log(chalk.white(`Tests passed: ${testsPassed}/${totalTests}`));
  
  if (testsPassed === totalTests) {
    console.log(chalk.green.bold('🎉 All tests passed!'));
    console.log(chalk.cyan('The chatbot is ready for use.'));
  } else {
    console.log(chalk.yellow.bold('⚠️  Some tests failed.'));
    console.log(chalk.gray('Please check your configuration and try again.'));
  }

  console.log(chalk.gray('━'.repeat(50)));
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    console.error(chalk.red('💥 Test runner error:'), error.message);
    process.exit(1);
  });
}