import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Data loader for rental property data from local JSON file
 * Optimized for fast AI chatbot responses without external API dependency
 */
class PropertyDataLoader {
  constructor(maxProperties = 18) {
    this.maxProperties = maxProperties;
    this.properties = [];
    this.rawData = null;
    this.dataPath = join(__dirname, '..', 'data', 'properties.json');
  }

  /**
   * Load properties from local JSON file
   */
  loadPropertiesFromFile() {
    try {
      console.log(chalk.blue('📂 Loading property data from local JSON file...'));
      
      const fileContent = readFileSync(this.dataPath, 'utf8');
      this.rawData = JSON.parse(fileContent);
      
      if (!this.rawData.properties || !Array.isArray(this.rawData.properties)) {
        throw new Error('Invalid JSON structure: properties array not found');
      }

      console.log(chalk.green(`✅ Successfully loaded ${this.rawData.properties.length} properties from JSON`));
      console.log(chalk.cyan(`📊 Data source: ${this.rawData.metadata?.source || 'Local JSON file'}`));
      
      return this.rawData.properties;
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.error(chalk.red('❌ Properties JSON file not found at:'), this.dataPath);
        console.log(chalk.yellow('💡 Make sure the data/properties.json file exists'));
      } else {
        console.error(chalk.red('❌ Error loading properties:'), error.message);
      }
      throw error;
    }
  }

  /**
   * Select diverse subset of properties for optimal AI performance
   */
  selectDiverseProperties(allProperties) {
    // Sort by various criteria to get diverse selection
    const sorted = [...allProperties].sort((a, b) => {
      // Prioritize properties with complete data
      const aComplete = this.isCompleteProperty(a);
      const bComplete = this.isCompleteProperty(b);
      
      if (aComplete !== bComplete) {
        return bComplete - aComplete;
      }
      
      // Then by price diversity
      return a.price - b.price;
    });

    // Select properties with geographic and price diversity
    const selected = [];
    const usedCountries = new Set();
    const priceRanges = {
      budget: { min: 0, max: 50, count: 0 },
      mid: { min: 50, max: 150, count: 0 },
      luxury: { min: 150, max: 1000, count: 0 }
    };

    for (const property of sorted) {
      if (selected.length >= this.maxProperties) break;
      
      const country = property.country?.toLowerCase();
      const price = property.price || 0;
      
      // Determine price range
      let priceRange = 'budget';
      if (price >= 150) priceRange = 'luxury';
      else if (price >= 50) priceRange = 'mid';
      
      // Select if we need this country or price range
      const needsCountry = !usedCountries.has(country);
      const needsPriceRange = priceRanges[priceRange].count < 3;
      
      if (needsCountry || needsPriceRange || selected.length < 5) {
        selected.push(property);
        if (country) usedCountries.add(country);
        priceRanges[priceRange].count++;
      }
    }

    console.log(chalk.yellow(`🎯 Selected ${selected.length} diverse properties for AI training`));
    return selected;
  }

  /**
   * Check if property has complete data for AI processing
   */
  isCompleteProperty(property) {
    return !!(
      property.title &&
      property.description &&
      property.price &&
      property.city &&
      property.country &&
      property.facilities
    );
  }

  /**
   * Normalize facility data (handle inconsistent field names)
   */
  normalizeFacilities(facilities) {
    if (!facilities) return { bedrooms: 0, bathrooms: 0, parking: 0 };
    
    return {
      bedrooms: parseInt(facilities.bedrooms) || 0,
      bathrooms: parseInt(facilities.bathrooms) || 0,
      parking: parseInt(facilities.parkings || facilities.parking) || 0
    };
  }

  /**
   * Format properties for AI consumption
   */
  formatPropertiesForAI(properties) {
    return properties.map((property, index) => {
      const facilities = this.normalizeFacilities(property.facilities);
      
      return {
        id: property.id,
        index: index + 1,
        title: property.title || 'Untitled Property',
        description: (property.description || '').substring(0, 300), // Limit for AI efficiency
        price: property.price || 0,
        priceDisplay: `$${property.price}/night`,
        location: `${property.city || 'Unknown'}, ${property.country || 'Unknown'}`,
        address: property.address || 'Address not provided',
        facilities: facilities,
        facilitiesText: `${facilities.bedrooms} bedrooms, ${facilities.bathrooms} bathrooms, ${facilities.parking} parking spaces`,
        hasImage: !!(property.image),
        summary: `${property.title} in ${property.city}, ${property.country} - $${property.price}/night`
      };
    });
  }

  /**
   * Get properties with smart loading from JSON
   */
  async getProperties(forceRefresh = false) {
    try {
      // Load fresh data from JSON file
      const allProperties = this.loadPropertiesFromFile();
      
      // Always use all available properties (no filtering)
      console.log(chalk.cyan(`📋 Using all ${allProperties.length} available properties`));
      
      // Format for AI
      this.properties = this.formatPropertiesForAI(allProperties);
      
      console.log(chalk.green('🏠 Property data ready for AI chatbot'));
      console.log(chalk.yellow(`🎯 All ${this.properties.length} properties loaded for comprehensive AI responses`));
      
      return this.properties;
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to load properties:'), error.message);
      throw error;
    }
  }

  /**
   * Get property statistics for debugging
   */
  getStats() {
    if (this.properties.length === 0) return null;
    
    const prices = this.properties.map(p => p.price).filter(p => p > 0);
    const countries = [...new Set(this.properties.map(p => p.location.split(',')[1]?.trim()))];
    
    return {
      totalProperties: this.properties.length,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
        avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      },
      countries: countries.length,
      countryList: countries,
      dataSource: 'Local JSON file',
      jsonMetadata: this.rawData?.metadata || null
    };
  }

  /**
   * Get metadata about the dataset
   */
  getMetadata() {
    return this.rawData?.metadata || {
      description: 'Local property dataset',
      source: 'JSON file'
    };
  }
}

export default PropertyDataLoader;