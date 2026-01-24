const https = require('https');

// Helper to fetch JSON from URL
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
			return {
				lastUpdated: new Date().toISOString(),
				source: 'LeekDuck',
				sourceUrl: 'https://leekduck.com/shiny/',
				totalShinies: 0,
				shinies: []
			};
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
				
				// If there's a custom filename, use it
				if (pokemon.fn) {
					filename = `${pokemon.fn}_shiny.png`;
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

				const imageUrl = `https://cdn.jsdelivr.net/gh/PokeMiners/pogo_assets/Images/Pokemon%20-%20256x256/${filename}`;

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

		return {
			lastUpdated: new Date().toISOString(),
			source: 'LeekDuck',
			sourceUrl: 'https://leekduck.com/shiny/',
			totalShinies: output.length,
			shinies: output
		};

	} catch (error) {
		console.error('Error fetching shiny data:', error.message);
		throw error;
	}
}

module.exports = scrapeShinies;
