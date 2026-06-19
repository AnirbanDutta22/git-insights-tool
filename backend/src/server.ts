import express from "express";
import { GitParser } from "./gitParser.js";
import path from "path";
import { fileURLToPath } from "url";

export function startServer(targetDirectory: string, port = 4321) {
  const app = express();
  const parser = new GitParser(targetDirectory);

  app.use(express.json());

  // 1. SERVE THE REACT FRONTEND FILES
  // This tells Express to look into the 'public' folder we just copied
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const publicPath = path.join(__dirname, "../public/dist");
  app.use(express.static(publicPath));

  // Middleware to handle CORS
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept",
    );
    next();
  });

  // API endpoint: Get commit history
  app.get("/api/commits", async (req, res) => {
    const isRepo = await parser.checkIsRepo();
    if (!isRepo) {
      return res.status(400).json({ error: "Not a valid Git repo" });
    }

    const commits = await parser.getCommitHistory();
    res.json({ commits });
  });

  // API Endpoint: Get list of local branches
  app.get("/api/branches", async (req, res) => {
    const branches = await parser.fetchLocalBranches();
    res.json({ branches });
  });

  // API Endpoint: Simulate a merge conflict check
  // Expects query parameters: ?target=main&source=feature-auth
  app.get("/api/check-conflict", async (req, res) => {
    const { target, source } = req.query;

    if (!target || !source) {
      return res
        .status(400)
        .json({ error: "Missing target or source branch queries" });
    }

    try {
      const evaluation = await parser.simulateMerge(
        target as string,
        source as string,
      );
      res.json(evaluation);
    } catch (err: any) {
      res.status(500).json({
        error: "Failed to process merge simulation",
        trace: err.message,
      });
    }
  });

  app.use((req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });

  app.listen(port, () => {
    console.log(`Git-Insight Engine active!`);
    console.log(`Reading repository at: ${targetDirectory}`);
    console.log(`Local API available at: http://localhost:${port}`);
  });
}
