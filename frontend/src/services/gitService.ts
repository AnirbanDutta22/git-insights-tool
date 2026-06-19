/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CommitNodeData {
  id: string;
  hash: string;
  author: string;
  date: string;
  message: string;
}

const API_BASE_URL = "http://localhost:4321/api";

export const GitService = {
  // Fetches raw commit data from our local CLI Express engine
  async fetchCommits(): Promise<CommitNodeData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/commits`);
      if (!response.ok) {
        throw new Error("Failed to fetch repository logs");
      }
      const data = await response.json();

      // Map the backend structure to frontend usable data
      return data.commits.map((c: any) => ({
        id: c.hash,
        hash: c.hash.substring(0, 7), // Short SHA for UI display
        author: c.author,
        date: new Date(c.date).toLocaleString(),
        message: c.message,
      }));
    } catch (error) {
      console.error("API Fetch Error:", error);
      return [];
    }
  },

  // Fetches all branches
  async fetchBranches(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/branches`);
    const data = await response.json();
    return data.branches || [];
  },

  // Check merge conflicts
  async checkConflicts(
    target: string,
    source: string,
  ): Promise<{ conflictsFound: boolean; details: any[] }> {
    const response = await fetch(
      `${API_BASE_URL}/check-conflict?target=${target}&source=${source}`,
    );
    return await response.json();
  },
};
