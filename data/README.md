# Property Data

This directory contains the complete property dataset for the rental property chatbot.

## File Structure

- `properties.json` - Complete property dataset with all 18 listings

## Data Overview

### Complete Property Collection (18 Total)

#### **European Properties**

1. **Historic Maltings Loft** - London, UK ($123/night)
   - 5 bedrooms, 8 bathrooms, 5 parking spaces
   - Historic 19th century building near Tower Bridge

2. **La Mansarda Suite** - Venice, Italy ($97/night)
   - 5 bedrooms, 3 bathrooms, 2 parking spaces
   - 18th century Venetian palace penthouse

3. **Cosy Copenhagen Condo** - Copenhagen, Denmark ($81/night)
   - 2 bedrooms, 2 bathrooms, 3 parking spaces
   - Renovated 1869 condo in popular café area

4. **Beautiful Shoreditch Room** - London, UK ($79/night)
   - 4 bedrooms, 3 bathrooms, 1 parking space
   - Trendy Spitalfields location with galleries and shops

5. **Aberdeen Quiet Room** - Aberdeen, UK ($42/night)
   - 10 bedrooms, 7 bathrooms, 2 parking spaces
   - Large house with garden views and free parking

6. **Toulon Apartment Room** - Provence-Alpes-Côte d'Azur, France ($31/night)
   - 3 bedrooms, 2 bathrooms, 1 parking space
   - Breakfast included, near beaches and city center

7. **Levallois Large Bedroom** - Île-de-France, France ($86/night)
   - 4 bedrooms, 5 bathrooms, 1 parking space
   - Spacious apartment with full amenities

8. **Elegant Copenhagen Room** - Copenhagen, Denmark ($97/night)
   - 2 bedrooms, 3 bathrooms, 1 parking space
   - Meatpacking District with shared living spaces

9. **Romantic London Room** - London, UK ($177/night)
   - 4 bedrooms, 4 bathrooms, 1 parking space
   - Covent Garden location with private garden

#### **Asian Properties**

10. **Bangkok Residence** - Bangkok, Thailand ($139/night)
    - 12 bedrooms, 3 bathrooms, 2 parking spaces
    - Thai-contemporary shophouse with temple views

11. **Joglo Villa Bali** - Bali, Indonesia ($32/night)
    - 4 bedrooms, 5 bathrooms, 1 parking space
    - Traditional Javanese architecture with tropical garden

12. **Delhi Family Room** - Delhi, India ($32/night)
    - 4 bedrooms, 5 bathrooms, 1 parking space
    - Private room in family home, centrally located

13. **Simple Bali Villa** - Bali, Indonesia ($22/night)
    - 3 bedrooms, 2 bathrooms, 1 parking space
    - Peaceful and centrally-located place

#### **American Properties**

14. **Brooklyn Modern Space** - New York, USA ($255/night)
    - 4 bedrooms, 5 bathrooms, 1 parking space
    - Full kitchen, washer/dryer, near Manhattan trains

15. **Miami Luxury Condo** - Florida, USA ($129/night)
    - 4 bedrooms, 5 bathrooms, 1 parking space
    - Ocean views with optional car rental included

16. **Rio Beach House** - Rio de Janeiro, Brazil ($18/night)
    - 4 bedrooms, 5 bathrooms, 1 parking space
    - Beachfront location with breakfast included

#### **African Properties**

17. **Marrakech Riad** - Morocco ($92/night)
    - 2 bedrooms, 2 bathrooms, 1 parking space
    - Authentic Médina experience with full services

#### **Oceanian Properties**

18. **Melbourne University Room** - Melbourne, Australia ($44/night)
    - 5 bedrooms, 2 bathrooms, 1 parking space
    - Near RMIT and Melbourne University, CBD location

## Statistics

### Geographic Distribution
- **Countries**: 11 different countries
- **Continents**: 5 continents represented (Europe, Asia, North America, South America, Africa, Oceania)
- **Cities**: 15 different cities worldwide

### Pricing
- **Minimum**: $18/night (Rio de Janeiro, Brazil)
- **Maximum**: $255/night (Brooklyn, New York, USA)
- **Average**: ~$89/night
- **Median**: $86/night

### Accommodation Types
- Historic buildings and converted spaces
- Modern apartments and condos
- Traditional villas and unique architecture
- Private rooms in shared accommodations
- Luxury properties with premium services

### Facilities Range
- **Bedrooms**: 2-12 bedrooms available
- **Bathrooms**: 2-8 bathrooms available  
- **Parking**: 1-5 parking spaces available

### Data Source
Original data sourced from: `https://real-estate-server-depi.vercel.app/api/residency/allresd`
Complete dataset preserved for comprehensive AI chatbot training.

### Usage
The JSON file is automatically loaded by the chatbot's data loader (`src/data-loader.js`).
All 18 properties are available for AI responses, providing maximum variety and options for users.