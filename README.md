# GitInsights

> Real-time repository intelligence, interactive Graph visualization, and ahead-of-time merge conflict prediction.

GitInsights bridges the gap between complex terminal branch histories and clean visual understanding. It launches a local Node.js engine that watches your active git repository, parses branch configurations, and serves an interactive React-powered canvas mapping out branches, commits, and potential merge code collisions.

## Key Features

* **Interactive Commit Graph:** Renders real-time branches and commit trees using an optimized React Flow network engine.
* **Smart Conflict Predictor:** Performs in-memory 3-way structural merges (`git merge-tree`) to find line-by-line file conflicts before you actually execute a merge.
* **Instant Inspector Panel:** Click any commit node to parse full SHAs, deep-dive into author details, timestamps, and commit messages.
* **Reactive Engine:** Built with Node.js filesystem watchers and WebSockets to update your browser UI instantly when you run a git command in your terminal.

---

## Architecture Layout

```text
├── backend/          # Node.js Server Engine & CLI Harness
│   ├── src/              # TypeScript server source (Git parsing, Socket.io)
│   ├── dist/             # Compiled production backend assets
│   └── package.json      
└── frontend/             # React & Tailwind UI (React Flow Canvas)
```

## Local Development & Contribution Setup
If you want to contribute to the engine or run the project locally from the source files, follow these steps:

## 1. Clone the Repository
```bash
git clone https://github.com/AnirbanDutta22/git-insights-tool.git
cd git-insights-tool
```

## 2. Set Up the Frontend UI
Navigate to the frontend directory, install dependencies, and build the distribution assets:

```bash
cd frontend
npm install
npm run build
```
Note: Make sure to move or copy the resulting dist/ production bundle into your backend/dist/ subfolder so the backend server can host it.

## 3. Set Up the Backend Engine
Navigate to the backend, install dependencies, compile the TypeScript layers, and link it locally:

```bash
cd ../backend
npm install
npm run build
npm link
```

## 4. Run in Development Mode
You can start the backend engine in live-reloading mode within any test git repository:

```bash
npm run dev
```
Contributing
We welcome community optimization! If you have ideas for advanced graph rendering layouts or deeper git plumbing integration:

Fork the Project.

Create your Feature Branch (git checkout -b feature/AmazingFeature).

Commit your Changes (git commit -m 'Add some AmazingFeature').

Push to the Branch (git push origin feature/AmazingFeature).

Open a Pull Request.

📄 License
Distributed under the MIT License. See LICENSE for more information.
