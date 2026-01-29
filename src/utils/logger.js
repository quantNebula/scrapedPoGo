/**
 * @fileoverview CLI Logger utility for standardized, colorful output.
 * Provides methods for info, success, warning, error, and start messages
 * with consistent emoji and color formatting.
 * @module utils/logger
 */

// Check if colors should be enabled (TTY support and NO_COLOR not set)
const colorsEnabled = process.stdout.isTTY && !process.env.NO_COLOR;

const colors = colorsEnabled ? {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m"
} : {
    reset: "",
    red: "",
    green: "",
    yellow: "",
    blue: "",
    cyan: ""
};

const logger = {
    /**
     * Log an info message.
     * @param {...any} args - Arguments to log
     */
    info: (...args) => {
        console.log(`${colors.blue}ℹ️  INFO:${colors.reset}`, ...args);
    },

    /**
     * Log a success message.
     * @param {...any} args - Arguments to log
     */
    success: (...args) => {
        console.log(`${colors.green}✅ SUCCESS:${colors.reset}`, ...args);
    },

    /**
     * Log a warning message.
     * @param {...any} args - Arguments to log
     */
    warn: (...args) => {
        console.warn(`${colors.yellow}⚠️  WARNING:${colors.reset}`, ...args);
    },

    /**
     * Log an error message.
     * @param {...any} args - Arguments to log
     */
    error: (...args) => {
        console.error(`${colors.red}❌ ERROR:${colors.reset}`, ...args);
    },

    /**
     * Log a start/process message.
     * @param {...any} args - Arguments to log
     */
    start: (...args) => {
        console.log(`${colors.cyan}🚀 START:${colors.reset}`, ...args);
    }
};

module.exports = logger;
