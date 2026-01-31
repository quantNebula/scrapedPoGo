/**
 * @fileoverview Shiny Pokemon data scraper for Pokemon GO.
 * Fetches shiny Pokemon information from LeekDuck's data files and
 * cross-references with PogoAssets for image URLs.
 * @module pages/shinies
 */

const https = require('https');

/**
 * @typedef {Object} ShinyForm
 * @property {string} name - Form name (e.g., "Male", "White Striped")
 * @property {string} imageUrl - URL to shiny form image
 * @property {number} width - Image width in pixels
 * @property {number} height - Image height in pixels
 */

/**
 * @typedef {Object} ShinyPokemon
 * @property {number} dexNumber - National Pokedex number
 * @property {string} name - Pokemon name with regional prefix if applicable
 * @property {string} imageUrl - URL to shiny sprite image
 * @property {string|null} releasedDate - Release date in "YYYY/MM/DD" format or null
 * @property {number|null} family - Evolution family ID or null
 * @property {string|null} typeCode - Regional type code (e.g., "_61" for Alolan) or null
 * @property {number} width - Image width in pixels (256)
 * @property {number} height - Image height in pixels (256)
 * @property {ShinyForm[]} [forms] - Array of alternate forms if applicable
 */

/**
 * Fetches JSON data from a URL.
 * 
 * @param {string} url - URL to fetch JSON from
 * @returns {Promise<Object>} Parsed JSON data
 * @throws {Error} On network failure or JSON parse error
 * 
 * @example
 * const data = await fetchJson('https://example.com/data.json');
 */
function fetchJson(url) {
	return new Promise((resolve, reject) => {
		https.get(url, (res) => {
			let body = '';
			res.on('data', (chunk) => { body += chunk; });
			res.on('end', () => {
				try {
					resolve(JSON.parse(body));
				} catch (error) {
					reject(error);
				}
			});
		}).on('error', reject);
	});
}

/**
 * Scrapes shiny Pokemon data from LeekDuck and PogoAssets.
 * 
 * Fetches both the Pokemon data file and English names file from LeekDuck,
 * filters for Pokemon with shiny releases, and constructs image URLs
 * using the PogoAssets CDN. Handles regional variants, gender forms,
 * and special forms like Mega and Gigantamax.
 * 
 * @async
 * @function scrapeShinies
 * @returns {Promise<ShinyPokemon[]>} Array of shiny Pokemon data sorted by dex number
 * @throws {Error} On network failure or data processing error
 * 
 * @example
 * const shinies = require('./pages/shinies');
 * const data = await shinies();
 * console.log(`Found ${data.length} shiny Pokemon`);
 */
async function scrapeShinies() {
	console.log('Fetching shiny Pokemon data from LeekDuck...');
	
	try {
		// Fetch the JSON data directly from LeekDuck's data files
		const dataUrl = 'https://leekduck.com/shiny/pms.json?v159';
		const namesUrl = 'https://leekduck.com/shiny/name.json?v159';
		
		const [pokemonData, namesData] = await Promise.all([
			fetchJson(dataUrl),
			fetchJson(namesUrl)
		]);

		// Filter for shiny pokemon: either has shiny_released flag OR has released_date
		const shinyPokemon = pokemonData.filter(p => p.shiny_released === true || p.released_date);
		
		console.log(`Found ${shinyPokemon.length} shiny Pokemon entries`);

		if (shinyPokemon.length === 0) {
			console.warn('No shiny Pokemon found in the data.');
			return [];
		}

		const entries = [];

		// Map type codes to regional names
		const typeMap = {
			'_61': 'Alolan',
			'_31': 'Galarian',
			'_51': 'Hisuian',
			'_52': 'Paldean'
		};
		
		// Map isotope codes to human-readable forms
		const isotopeMap = {
			'_Male': ' (Male)',
			'_Female': ' (Female)',
			'_WS': ' (White Striped)',
			'_RS': ' (Red Striped)',
			'_BS': ' (Blue Striped)',
			'_M': ' (M)', // Mega
			'_G': ' (G)'  // Gigantamax
		};

		for (const pokemon of shinyPokemon) {
			try {
				const dexNumber = pokemon.dex;
				const englishName = namesData[dexNumber]?.en || `Pokemon ${dexNumber}`;
				const typeCode = pokemon.type || null;
				const isotope = pokemon.isotope || null;
				
				// Build image URL based on the pattern from PokeMiners
				let typeFileCode = '00';
				if (typeCode && typeCode.startsWith('_')) {
					typeFileCode = typeCode.substring(1);
				} else if (typeCode) {
					typeFileCode = typeCode;
				}
				
				// If there's an aa_fn (alternative asset filename), extract form code
				if (pokemon.aa_fn) {
					const aaMatch = pokemon.aa_fn.match(/pm(\d+)\.f([A-Z_]+)/);
					if (aaMatch) {
						const formCode = aaMatch[2];
						const formToTypeCode = {
							'MALE': '11',
							'FEMALE': '12',
							'WHITE_STRIPED': '12',
							'RED_STRIPED': '01',
							'BLUE_STRIPED': '02'
						};
						if (formToTypeCode[formCode]) {
							typeFileCode = formToTypeCode[formCode];
						}
					}
				}
				
				let filename = `pokemon_icon_${String(dexNumber).padStart(3, '0')}_${typeFileCode}_shiny.png`;
				let basePath = 'Images/Pokemon%20-%20256x256';
				
				// Prefer aa_fn (Addressable Assets format) over fn for custom filenames
				if (pokemon.aa_fn) {
					// aa_fn format: "pm2.cJAN_2020_NOEVOLVE" -> add ".s.icon.png" for shiny
					filename = `${pokemon.aa_fn}.s.icon.png`;
					basePath = 'Images/Pokemon%20-%20256x256/Addressable%20Assets';
				} else if (pokemon.fn) {
					// Legacy fn format - try to convert to aa_fn format
					// fn format: "pm0025_00_pgo_fall2019" -> "pm25.fFALL_2019.s.icon.png"
					// Mapping table for fn suffixes to PokeMiners asset names
					const fnMapping = {
						'fall2019': 'fFALL_2019',
						'movie2020': 'fCOSTUME_2020',
						'4thanniversary': 'fFLYING_5TH_ANNIV',  // Close approximation
						'5thanniversary': 'fFLYING_5TH_ANNIV',
						'winter2020': 'cWINTER_2018',          // May need verification
						'copy2019': 'fCOPY_2019',
						'adventurehat2020': 'fADVENTURE_HAT_2020'
					};
					
					const fnMatch = pokemon.fn.match(/^pm(\d+)_\d+_pgo_(.+)$/);
					if (fnMatch) {
						const fnDex = parseInt(fnMatch[1], 10);
						const costumeSuffix = fnMatch[2].toLowerCase();
						const mappedName = fnMapping[costumeSuffix];
						
						if (mappedName) {
							filename = `pm${fnDex}.${mappedName}.s.icon.png`;
							basePath = 'Images/Pokemon%20-%20256x256/Addressable%20Assets';
						} else {
							// Try generic conversion: fall2019 -> FALL_2019, use 'f' prefix for forms
							const upperSuffix = costumeSuffix.toUpperCase().replace(/(\d{4})$/, '_$1');
							filename = `pm${fnDex}.f${upperSuffix}.s.icon.png`;
							basePath = 'Images/Pokemon%20-%20256x256/Addressable%20Assets';
						}
					} else {
						// Fallback to old format if can't parse
						filename = `${pokemon.fn}_shiny.png`;
					}
				}
				
				// Build full name with regional prefix
				let fullName = englishName;
				if (typeCode && typeMap[typeCode]) {
					fullName = `${typeMap[typeCode]} ${englishName}`;
				}
				
				// Add isotope suffix (gender, color forms, etc.)
				if (isotope && isotopeMap[isotope]) {
					fullName += isotopeMap[isotope];
				} else if (pokemon.name_suffix) {
					fullName += pokemon.name_suffix;
				} else if (isotope && !isotopeMap[isotope]) {
					fullName += isotope;
				}

				const imageUrl = `https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/${basePath}/${filename}`;

				entries.push({
					dexNumber,
					name: fullName,
					imageUrl,
					releasedDate: pokemon.released_date || null,
					family: pokemon.family || null,
					typeCode,
					width: 256,
					height: 256
				});

			} catch (error) {
				console.error(`Error processing pokemon ${pokemon.dex}: ${error.message}`);
			}
		}

		// Group by dex number and combine forms
		const grouped = {};
		for (const entry of entries) {
			const { dexNumber, name, releasedDate, family, typeCode, ...data } = entry;
			
			// Use typeCode as part of grouping key for regional variants
			const groupKey = typeCode ? `${dexNumber}_${typeCode}` : `${dexNumber}`;
			
			if (!grouped[groupKey]) {
				grouped[groupKey] = {
					dexNumber,
					name: name.replace(/[(_][^)_]*[)_]?$/, '').trim(), // Remove form suffix
					releasedDate,
					family,
					typeCode,
					forms: []
				};
			}

			// Check if this is a form variant
			const formMatch = name.match(/(.+?)[(_]([^)_]+)[)]?$/);
			if (formMatch && formMatch[1].trim() !== name.trim()) {
				grouped[groupKey].forms.push({
					name: formMatch[2],
					...data
				});
			} else if (!grouped[groupKey].imageUrl) {
				// Base form
				grouped[groupKey] = {
					...grouped[groupKey],
					...data
				};
			}
		}

		const output = Object.values(grouped).sort((a, b) => {
			if (a.dexNumber !== b.dexNumber) return a.dexNumber - b.dexNumber;
			if (!a.typeCode && b.typeCode) return -1;
			if (a.typeCode && !b.typeCode) return 1;
			if (!a.typeCode && !b.typeCode) return 0;
			return a.typeCode.localeCompare(b.typeCode);
		});

		console.log(`Successfully processed ${output.length} unique shiny Pokemon with ${entries.length} total forms`);

		return output;

	} catch (error) {
		console.error('Error fetching shiny data:', error.message);
		throw error;
	}
}

module.exports = scrapeShinies;
