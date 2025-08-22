import chalk from 'chalk';

/**
 * Animated thinking indicator for better user experience
 * Shows various thinking animations while AI processes queries
 */
class ThinkingAnimation {
  constructor() {
    this.isAnimating = false;
    this.animationInterval = null;
    this.currentFrame = 0;
    
    // Different animation styles
    this.animations = {
      dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
      brain: ['🧠   ', ' 🧠  ', '  🧠 ', '   🧠', '  🧠 ', ' 🧠  '],
      gears: ['⚙️ ', '⚙️⚙️', '⚙️⚙️⚙️', '⚙️⚙️', '⚙️ ', '  '],
      pulse: ['💭', '💭💭', '💭💭💭', '💭💭', '💭', '  '],
      search: ['🔍   ', ' 🔍  ', '  🔍 ', '   🔍', '  🔍 ', ' 🔍  ']
    };
    
    this.messages = [
      'Analyzing properties...',
      'Processing your request...',
      'Searching database...',
      'Finding best matches...',
      'Preparing response...',
      'Almost ready...'
    ];
  }

  /**
   * Start the thinking animation
   */
  start(style = 'dots') {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.currentFrame = 0;
    const frames = this.animations[style] || this.animations.dots;
    const message = this.messages[Math.floor(Math.random() * this.messages.length)];
    
    // Hide cursor
    process.stdout.write('\x1B[?25l');
    
    this.animationInterval = setInterval(() => {
      const frame = frames[this.currentFrame % frames.length];
      const spinner = chalk.cyan(frame);
      const text = chalk.yellow(message);
      
      // Clear current line and write animation
      process.stdout.write(`\r${spinner} ${text}`);
      
      this.currentFrame++;
    }, 120); // 120ms for smooth animation
  }

  /**
   * Stop the animation and clear the line
   */
  stop() {
    if (!this.isAnimating) return;
    
    this.isAnimating = false;
    
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
    
    // Clear the animation line
    process.stdout.write('\r\x1B[K');
    
    // Show cursor
    process.stdout.write('\x1B[?25h');
  }

  /**
   * Run animation for a specific duration
   */
  async animate(duration = 1000, style = 'dots') {
    return new Promise((resolve) => {
      this.start(style);
      setTimeout(() => {
        this.stop();
        resolve();
      }, duration);
    });
  }

  /**
   * Show different animation during different phases
   */
  async showPhase(phase, duration = 800) {
    const phaseAnimations = {
      'loading': 'dots',
      'thinking': 'brain', 
      'searching': 'search',
      'processing': 'gears',
      'finalizing': 'pulse'
    };
    
    const style = phaseAnimations[phase] || 'dots';
    await this.animate(duration, style);
  }

  /**
   * Quick thinking animation (for fast responses)
   */
  async quickThink() {
    await this.animate(300, 'pulse');
  }

  /**
   * Multi-phase thinking animation
   */
  async multiPhaseThinking() {
    await this.showPhase('loading', 400);
    await this.showPhase('thinking', 600);
    await this.showPhase('searching', 500);
    await this.showPhase('finalizing', 300);
  }
}

export default ThinkingAnimation;