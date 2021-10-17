import { join } from "path";

const config = {
    /**
     * Default prefix
     */
    PREFIX: "pls ",
    
    /**
     * Static files for CSS or other assets
     */
    files: {
        LOGS_CSS: join(__dirname, "../assets/dark-logs.css"),
    },
} as const;

export default config;
