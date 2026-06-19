import { startServer } from "./server.js";

// Get the directory where the user typed 'git insight'
const targetDirectory = process.cwd();

console.log("Initializing Git-Insight CLI...");

startServer(targetDirectory);
