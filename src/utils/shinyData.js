const fs = require('fs');
const path = require('path');

/**
 * Loads shiny data from the shinies.json file
 * @returns {Map<number, object>} Map of dex numbers to shiny data
 */
function loadShinyData() {
	try {
		const shinyFilePath = path.join(__dirname, '..', '..', 'data', 'shinies.json');
		
		if (!fs.existsSync(shinyFilePath)) {
			console.warn('shinies.json not found. Run the shinies scraper first.');
			return new Map();
		}
		
		const data = JSON.parse(fs.readFileSync(shinyFilePath, 'utf8'));
		const shinyMap = new Map();
		
		if (data.shinies && Array.isArray(data.shinies)) {
			data.shinies.forEach(entry => {
				shinyMap.set(entry.dexNumber, entry);
			});
		}
		
		return shinyMap;
	} catch (error) {
		console.error('Error loading shiny data:', error.message);
		return new Map();
	}
}

/**
 * Extracts dex number from LeekDuck image URL
 * @param {string} imageUrl - e.g., "https://cdn.leekduck.com/assets/img/pokemon_icons_crop/pm1.icon.png"
 * @returns {number|null} The dex number or null if not found
 */
function extractDexNumber(imageUrl) {
	if (!imageUrl) return null;
	
	const match = imageUrl.match(/pm(\d+)\.icon\.png/);
	return match ? parseInt(match[1], 10) : null;
}

/**
 * Checks if a Pokemon has a shiny variant based on dex number and form
 * @param {Map} shinyMap - The loaded shiny data map
 * @param {number} dexNumber - Pokemon dex number
 * @param {string|null} form - Pokemon form (optional)
 * @returns {boolean} Whether this Pokemon/form has a shiny variant
 */
function hasShiny(shinyMap, dexNumber, form = null) {
	if (!shinyMap || !dexNumber) return false;
	
	const shinyData = shinyMap.get(dexNumber);
	if (!shinyData) return false;
	
	// If no specific form requested, just check if Pokemon has any shiny
	if (!form) return shinyData.hasShiny;
	
	// Check if specific form has shiny
	// Note: This is a simplified check. You may need to adjust based on 
	// how forms map between LeekDuck names and PogoAssets form IDs
	return shinyData.hasShiny;
}

module.exports = {
	loadShinyData,
	extractDexNumber,
	hasShiny
};
