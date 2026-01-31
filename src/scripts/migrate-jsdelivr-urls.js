#!/usr/bin/env node

/**
 * @fileoverview Migrate jsDelivr URLs to raw.githubusercontent.com URLs
 * jsDelivr blocks repos >50MB, PokeMiners/pogo_assets is too large
 * 
 * This script:
 * 1. Reads all JSON files in data directory
 * 2. Replaces cdn.jsdelivr.net/gh/PokeMiners/pogo_assets URLs with raw.githubusercontent.com equivalents
 * 3. Writes back to the same files
 * 
 * @usage node src/scripts/migrate-jsdelivr-urls.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const DATA_DIR = path.join(__dirname, '..', '..', 'data');

/**
 * Convert jsDelivr URL to raw.githubusercontent.com URL
 * @param {string} url - jsDelivr URL
 * @returns {string} raw.githubusercontent.com URL
 */
function migrateUrl(url) {
    // Pattern: https://cdn.jsdelivr.net/gh/PokeMiners/pogo_assets/path/to/file.png
    // Target:  https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/path/to/file.png
    
    const jsdelivrPattern = /https:\/\/cdn\.jsdelivr\.net\/gh\/PokeMiners\/pogo_assets\/(.+)/;
    const match = url.match(jsdelivrPattern);
    
    if (match) {
        const filePath = match[1];
        return `https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/${filePath}`;
    }
    
    return url; // Return unchanged if not a matching URL
}

/**
 * Recursively migrate URLs in an object/array
 * @param {any} obj - Object to process
 * @returns {any} Processed object with migrated URLs
 */
function migrateObjectUrls(obj) {
    if (!obj) return obj;
    
    if (typeof obj === 'string') {
        return migrateUrl(obj);
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => migrateObjectUrls(item));
    }
    
    if (typeof obj === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = migrateObjectUrls(value);
        }
        return result;
    }
    
    return obj;
}

/**
 * Process a single JSON file
 * @param {string} filePath - Path to JSON file
 * @returns {Object} Stats about the migration
 */
function processJsonFile(filePath) {
    const stats = {
        file: path.relative(DATA_DIR, filePath),
        urlsFound: 0,
        urlsMigrated: 0
    };
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        // Count URLs before migration
        const countUrls = (obj) => {
            if (!obj) return 0;
            if (typeof obj === 'string' && obj.includes('cdn.jsdelivr.net/gh/PokeMiners/pogo_assets')) {
                return 1;
            }
            if (Array.isArray(obj)) {
                return obj.reduce((sum, item) => sum + countUrls(item), 0);
            }
            if (typeof obj === 'object') {
                return Object.values(obj).reduce((sum, value) => sum + countUrls(value), 0);
            }
            return 0;
        };
        
        stats.urlsFound = countUrls(data);
        
        if (stats.urlsFound > 0) {
            // Migrate URLs
            const migratedData = migrateObjectUrls(data);
            stats.urlsMigrated = stats.urlsFound;
            
            if (!DRY_RUN) {
                // Write minified version
                if (filePath.endsWith('.min.json')) {
                    fs.writeFileSync(filePath, JSON.stringify(migratedData));
                } else {
                    // Write formatted version
                    fs.writeFileSync(filePath, JSON.stringify(migratedData, null, 2));
                }
            }
        }
    } catch (err) {
        stats.error = err.message;
    }
    
    return stats;
}

/**
 * Find all JSON files recursively
 * @param {string} dir - Directory to search
 * @param {string[]} files - Accumulator array
 * @returns {string[]} Array of JSON file paths
 */
function findJsonFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
            findJsonFiles(fullPath, files);
        } else if (entry.name.endsWith('.json') && !entry.name.includes('blob-url-map')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

/**
 * Main migration process
 */
async function main() {
    console.log('🔄 jsDelivr → raw.githubusercontent.com URL Migration');
    console.log(`   Mode: ${DRY_RUN ? '🧪 DRY RUN' : '📝 LIVE MIGRATION'}\n`);
    
    // Find all JSON files
    const jsonFiles = findJsonFiles(DATA_DIR);
    console.log(`📁 Found ${jsonFiles.length} JSON files\n`);
    
    // Process each file
    const allStats = [];
    let totalUrls = 0;
    let totalMigrated = 0;
    
    for (const file of jsonFiles) {
        const stats = processJsonFile(file);
        allStats.push(stats);
        
        if (stats.urlsFound > 0) {
            const status = DRY_RUN ? '[DRY]' : '✓';
            console.log(`  ${status} ${stats.file}: ${stats.urlsMigrated} URLs migrated`);
            totalUrls += stats.urlsFound;
            totalMigrated += stats.urlsMigrated;
        }
        
        if (stats.error) {
            console.error(`  ✗ ${stats.file}: ${stats.error}`);
        }
    }
    
    // Summary
    console.log('\n' + '━'.repeat(50));
    console.log('📊 Summary');
    console.log('━'.repeat(50));
    console.log(`   📦 Files processed:     ${jsonFiles.length}`);
    console.log(`   🔗 URLs found:          ${totalUrls}`);
    console.log(`   ✓  URLs migrated:       ${totalMigrated}`);
    
    if (DRY_RUN) {
        console.log('\n💡 Run without --dry-run to apply changes');
    } else {
        console.log('\n✅ Migration complete!');
    }
}

// Run main function
main().catch((err) => {
    console.error('\n❌ Fatal error:', err.message);
    process.exit(1);
});
