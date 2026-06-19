import { simpleGit, type SimpleGit } from "simple-git";

export interface CommitData {
  hash: string;
  author: string;
  date: string;
  message: string;
}

export class GitParser {
  private git: SimpleGit;

  constructor(targetPath: string) {
    // Initialize simple-git to target the specific folder where the CLI was run
    this.git = simpleGit(targetPath);
  }

  // Check if the target is valid git repo
  async checkIsRepo(): Promise<boolean> {
    try {
      return await this.git.checkIsRepo();
    } catch {
      return false;
    }
  }

  // Extract the recent commit logs and parse them into structured data
  async getCommitHistory(limit = 20): Promise<CommitData[]> {
    try {
      // Running 'git-log' via simple-git
      const logSummary = await this.git.log({ maxCount: limit });

      // Map the raw array into structured format for frontend
      return logSummary.all.map((commit) => ({
        hash: commit.hash,
        author: commit.author_name,
        date: commit.date,
        message: commit.message,
      }));
    } catch (error) {
      console.error("error reading git logs:", error);
      return [];
    }
  }

  // Fetch all local branches
  async fetchLocalBranches(): Promise<string[]> {
    try {
      const branches = await this.git.branchLocal();
      return branches.all;
    } catch (error) {
      console.error("Failed to fetch braches", error);
      return [];
    }
  }

  /**
   * Simulates a merge between two branches without changing files on disk.
   * Returns null if clean, or an array of conflict details if it clashing.
   */
  async simulateMerge(
    targetBranch: string,
    sourceBranch: string,
  ): Promise<any> {
    try {
      // git merge-tree computes the merge and shows conflicts dynamically
      const result = await this.git.raw([
        "merge-tree",
        targetBranch,
        sourceBranch,
      ]);

      // If the output contains conflict markers, we parse them
      if (result.includes("<<<<<<<") || result.includes("CHANGED_IN_BOTH")) {
        return this.parseConflictOutput(result);
      }

      return { conflictsFound: false, details: [] };
    } catch (error: any) {
      if (
        error.message &&
        (error.message.includes("<<<<<<<") || error.message.includes("==="))
      ) {
        return this.parseConflictOutput(error.message);
      }
      throw error;
    }
  }

  // Helper to extract conflicting filenames and lines from raw string stream
  private parseConflictOutput(rawOutput: string) {
    const conflicts: Array<{ file: string; content: string }> = [];

    // A simplistic parser looking for file indicators and conflict zones
    // Real world output has file indicators preceded by 'Changed in both' or 'Conflict in'
    const lines = rawOutput.split("\n");
    let currentFile = "Unknown File";
    let trackingConflict = false;
    let conflictBlock: string[] = [];

    for (const line of lines) {
      if (line.startsWith("Conflict in ") || line.includes("CHANGED_IN_BOTH")) {
        currentFile = line.replace("Conflict in ", "").trim();
      }

      if (line.includes("<<<<<<<")) {
        trackingConflict = true;
      }

      if (trackingConflict) {
        conflictBlock.push(line);
      }

      if (line.includes(">>>>>>>")) {
        trackingConflict = false;
        conflicts.push({
          file: currentFile.split(" ")[0] as string, // clean up any extra text
          content: conflictBlock.join("\n"),
        });
        conflictBlock = [];
      }
    }

    return {
      conflictsFound: conflicts.length > 0,
      details: conflicts,
    };
  }
}
