# 🚀 Deployment Guide

## Production Deployment Checklist

### 1. Pre-deployment Validation

```bash
# Run complete validation suite
npm run validate   # Configuration validation
npm run health     # System health check  
npm run benchmark  # Performance testing
```

### 2. Environment Setup

```bash
# Production environment
cp .env.production .env

# Configure for your environment
OPENAI_API_KEY=your-production-key
OPENAI_MODEL=gpt-3.5-turbo
DEBUG_MODE=false
SHOW_PERFORMANCE_METRICS=false
```

### 3. Security Configuration

```bash
# File permissions
chmod 600 .env
chmod +x scripts/*.js

# API key security
- Never commit .env files
- Use environment-specific keys
- Rotate keys regularly
- Monitor usage and costs
```

### 4. Performance Optimization

```bash
# Production optimizations
TEMPERATURE=0.1           # More consistent responses
MAX_TOKENS=350           # Faster generation
CACHE_SYSTEM_PROMPT=true # Better performance
ENABLE_ANIMATIONS=false  # Reduce overhead
```

### 5. Monitoring Setup

```bash
# Cost monitoring
ENABLE_COST_TRACKING=true

# Performance monitoring  
RESPONSE_TIMEOUT=15000

# Error tracking
DEBUG_MODE=false  # Clean logs in production
```

### 6. Scaling Considerations

**Horizontal Scaling:**
- Each instance is stateless
- No shared state between instances
- Local JSON data enables easy scaling

**Resource Requirements:**
- Memory: ~35MB per instance
- CPU: Low (mainly I/O bound)
- Storage: <1MB for application code

### 7. Backup and Recovery

```bash
# Essential files to backup
- data/properties.json (property data)
- .env (configuration)
- src/ (application code)
```

## Cloud Deployment Options

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### AWS Lambda

```bash
# Serverless deployment
- Package application with dependencies
- Configure environment variables
- Set timeout to 30 seconds
- Allocate 512MB memory
```

### Traditional VPS

```bash
# Process manager (PM2)
npm install -g pm2
pm2 start src/chatbot.js --name "property-chatbot"
pm2 startup
pm2 save
```

## Monitoring and Maintenance

### Health Checks

```bash
# Automated health monitoring
*/5 * * * * /path/to/project/scripts/health-check.js
```

### Cost Monitoring

```bash
# Daily cost reports
0 9 * * * /path/to/project/scripts/cost-report.js
```

### Log Management

```bash
# Log rotation
- Keep 7 days of logs
- Archive monthly
- Monitor error rates
```

## Emergency Procedures

### High Cost Alert

```bash
# If costs exceed budget
1. Check ENABLE_COST_TRACKING=true
2. Reduce MAX_TOKENS
3. Increase TEMPERATURE (more caching)
4. Monitor usage patterns
```

### Performance Issues

```bash
# If response times increase
1. Run benchmark script
2. Check OpenAI API status
3. Verify system resources
4. Review recent configuration changes
```

### API Key Compromise

```bash
# Immediate actions
1. Revoke compromised key
2. Generate new key
3. Update environment variables
4. Monitor usage for anomalies
```
