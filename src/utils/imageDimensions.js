/**
 * @fileoverview Image Dimensions Utility for Pokemon GO scrapers.
 * Fetches actual image dimensions from remote URLs by reading image headers.
 * Supports PNG, JPEG/JPG, GIF, WebP, SVG, BMP, ICO, and more formats.
 * Uses the image-size package which parses headers without downloading full images.
 * @module utils/imageDimensions
 */

const https = require('https');
const http = require('http');
const { imageSize } = require('image-size');

/**
 * @typedef {Object} ImageDimensions
 * @property {number} width - Image width in pixels
 * @property {number} height - Image height in pixels
 * @property {string} type - Image format type (e.g., "png", "jpg", "webp")
 */

/** @type {Map<string, ImageDimensions>} Cache to avoid redundant fetches */
const dimensionCache = new Map();

/**
 * Fetches image dimensions from a URL by reading image headers.
 * Results are cached to avoid redundant network requests.
 * 
 * @async
 * @param {string} url - The image URL to fetch dimensions for
 * @param {number} [timeout=5000] - Request timeout in milliseconds
 * @returns {Promise<ImageDimensions|null>} Dimensions object or null on failure
 * 
 * @example
 * const dims = await getImageDimensions('https://example.com/image.png');
 * if (dims) {
 *   console.log(`${dims.width}x${dims.height} ${dims.type}`);
 * }
 */
async function getImageDimensions(url, timeout = 5000) {
    if (!url) return null;
    
    // Check cache first
    if (dimensionCache.has(url)) {
        return dimensionCache.get(url);
    }
    
    try {
        const buffer = await fetchImageBuffer(url, timeout);
        if (!buffer || buffer.length === 0) {
            return null;
        }
        
        const dimensions = imageSize(buffer);
        if (dimensions && dimensions.width && dimensions.height) {
            const result = {
                width: dimensions.width,
                height: dimensions.height,
                type: dimensions.type || 'unknown'
            };
            
            // Cache the result
            dimensionCache.set(url, result);
            return result;
        }
        
        return null;
    } catch (err) {
        // Log in debug mode only
        if (process.env.DEBUG) {
            console.error(`Error getting dimensions for ${url}:`, err.message);
        }
        return null;
    }
}

/**
 * Fetches image data buffer from URL.
 * Only fetches enough bytes to determine dimensions (up to 128KB for safety).
 * Handles HTTP redirects automatically.
 * 
 * @param {string} url - The image URL to fetch
 * @param {number} timeout - Request timeout in milliseconds
 * @returns {Promise<Buffer|null>} Image data buffer or null on failure
 */
function fetchImageBuffer(url, timeout) {
    return new Promise((resolve) => {
        const protocol = url.startsWith('https') ? https : http;
        const maxBytes = 128 * 1024; // 128KB max (plenty for headers, SVGs may need more)
        
        const req = protocol.get(url, { timeout }, (response) => {
            // Handle redirects
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                resolve(fetchImageBuffer(response.headers.location, timeout));
                return;
            }
            
            if (response.statusCode !== 200) {
                resolve(null);
                return;
            }
            
            const chunks = [];
            let totalBytes = 0;
            
            response.on('data', (chunk) => {
                chunks.push(chunk);
                totalBytes += chunk.length;
                
                // Stop reading once we have enough bytes
                if (totalBytes >= maxBytes) {
                    response.destroy();
                    resolve(Buffer.concat(chunks));
                }
            });
            
            response.on('end', () => {
                resolve(Buffer.concat(chunks));
            });

            // Fallback for when destroy() is called and 'end' is not emitted
            response.on('close', () => {
                resolve(Buffer.concat(chunks));
            });
            
            response.on('error', () => {
                resolve(null);
            });
        });
        
        req.on('error', () => {
            resolve(null);
        });
        
        req.on('timeout', () => {
            req.destroy();
            resolve(null);
        });
    });
}

/**
 * Gets dimensions for multiple image URLs in parallel with batching.
 * Processes in batches to avoid overwhelming the network.
 * Deduplicates URLs and caches results.
 * 
 * @async
 * @param {string[]} urls - Array of image URLs to process
 * @param {number} [batchSize=10] - Number of concurrent requests per batch
 * @returns {Promise<Map<string, ImageDimensions>>} Map of URL to dimensions
 * 
 * @example
 * const urls = ['https://example.com/img1.png', 'https://example.com/img2.png'];
 * const dimsMap = await getMultipleImageDimensions(urls);
 * dimsMap.forEach((dims, url) => {
 *   console.log(`${url}: ${dims.width}x${dims.height}`);
 * });
 */
async function getMultipleImageDimensions(urls, batchSize = 10) {
    const results = new Map();
    const uniqueUrls = [...new Set(urls.filter(Boolean))];
    
    // Process in batches
    for (let i = 0; i < uniqueUrls.length; i += batchSize) {
        const batch = uniqueUrls.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(async (url) => {
                const dims = await getImageDimensions(url);
                return { url, dims };
            })
        );
        
        batchResults.forEach(({ url, dims }) => {
            if (dims) {
                results.set(url, dims);
            }
        });
    }
    
    return results;
}

/**
 * Clears the image dimension cache.
 * Useful between scrapes to free memory or force fresh fetches.
 * 
 * @returns {void}
 */
function clearCache() {
    dimensionCache.clear();
}

/**
 * Gets the current number of cached dimension entries.
 * 
 * @returns {number} Number of cached URLs
 */
function getCacheSize() {
    return dimensionCache.size;
}

module.exports = {
    getImageDimensions,
    getMultipleImageDimensions,
    clearCache,
    getCacheSize
};
