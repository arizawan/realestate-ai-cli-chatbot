#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import readline from 'readline';
import chalk from 'chalk';

/**
 * Setup script for Rental Property Chatbot
 * Guides users through installation and configuration
 */

async function setup() {
  console.log(chalk.blue.bold('🏠 Rental Property Chatbot Setup'));
  console.log(chalk.gray('━'.repeat(50)));
  console.log(chalk.white('Welcome! This script will help you set up the chatbot.\n'));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askQuestion = (question) => {
    return new Promise((resolve) => {
      rl.question(question, resolve);
    });
  };

  try {
    // Check if .env exists
    if (!existsSync('.env')) {
      console.log(chalk.yellow('📝 Setting up environment configuration...'));
      
      // Copy .env.example to .env
      const envExample = readFileSync('.env.example', 'utf8');
      writeFileSync('.env', envExample);
      console.log(chalk.green('✅ Created .env file from template'));

      // Ask for OpenAI API key
      console.log(chalk.cyan('\n🔑 OpenAI API Key Required'));
      console.log(chalk.gray('You need an OpenAI API key to use this chatbot.'));
      console.log(chalk.gray('Get one at: https://platform.openai.com/api-keys\n'));

      const apiKey = await askQuestion(chalk.blue('Enter your OpenAI API key: '));
      
      if (apiKey.trim()) {
        // Update .env file with the API key
        let envContent = readFileSync('.env', 'utf8');
        envContent = envContent.replace('your-openai-api-key-here', apiKey.trim());
        writeFileSync('.env', envContent);
        console.log(chalk.green('✅ API key saved to .env file'));
      console.log(chalk.cyan('ℹ️  Note: This chatbot uses local JSON data, no external API required'));
      } else {
        console.log(chalk.yellow('⚠️  No API key provided. You can add it later to the .env file.'));
      }
    } else {
      console.log(chalk.green('✅ Environment file already exists'));
    }

    // Check if node_modules exists
    if (!existsSync('node_modules')) {
      console.log(chalk.yellow('\n📦 Installing dependencies...'));
      console.log(chalk.gray('This may take a moment...\n'));
      
      try {
        execSync('npm install', { stdio: 'inherit' });
        console.log(chalk.green('✅ Dependencies installed successfully'));
      } catch (error) {
        console.log(chalk.red('❌ Failed to install dependencies'));
        console.log(chalk.gray('Please run "npm install" manually'));
      }
    } else {
      console.log(chalk.green('✅ Dependencies already installed'));
    }

    // Final instructions
    console.log(chalk.gray('\n' + '━'.repeat(50)));
    console.log(chalk.green.bold('🎉 Setup Complete!'));
    console.log(chalk.white('\nYou can now run the chatbot with:'));
    console.log(chalk.cyan('   npm start'));
    console.log(chalk.white('\nOr run tests with:'));
    console.log(chalk.cyan('   npm test'));
    console.log(chalk.gray('\n' + '━'.repeat(50)));

  } catch (error) {
    console.error(chalk.red('❌ Setup failed:'), error.message);
  } finally {
    rl.close();
  }
}

// Run setup if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setup();
}