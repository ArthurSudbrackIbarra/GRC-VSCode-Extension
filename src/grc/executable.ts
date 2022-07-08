import { execSync } from "child_process";

export enum GRCExecutableErrors {
  grcNotInstalled = "Error: GitHub Repository Creator (GRC) is not installed.",
  unsupportedOS = "Error: GitHub Repository Creator (GRC) is not supported on this OS.",
}

interface GRCExecutablePath {
  path: string | null;
  errorInfo: string | null;
}

export function getGRCExecutablePath(): GRCExecutablePath {
  if (process.platform === "win32") {
    try {
      execSync("where grc.bat /Q");
    } catch (error) {
      console.error(error);
      return {
        path: null,
        errorInfo: GRCExecutableErrors.grcNotInstalled,
      };
    }
    try {
      const executablePaths = execSync("where grc.bat")
        .toString()
        .trim()
        .split("\n");
      for (const executablePath of executablePaths) {
        if (executablePath.toUpperCase().includes("GITHUB-REPO-CREATOR")) {
          return {
            path: executablePath,
            errorInfo: null,
          };
        }
      }
      return {
        path: null,
        errorInfo: GRCExecutableErrors.grcNotInstalled,
      };
    } catch (error) {
      console.error(error);
      return {
        path: null,
        errorInfo: GRCExecutableErrors.grcNotInstalled,
      };
    }
  } else if (process.platform === "linux" || process.platform === "darwin") {
    try {
      const executablePaths = execSync("which grc")
        .toString()
        .trim()
        .split("\n");
      for (const executablePath of executablePaths) {
        if (executablePath === "/usr/bin/grc") {
          return {
            path: executablePath,
            errorInfo: null,
          };
        }
      }
      return {
        path: null,
        errorInfo: GRCExecutableErrors.grcNotInstalled,
      };
    } catch (error) {
      console.error(error);
      return {
        path: null,
        errorInfo: GRCExecutableErrors.grcNotInstalled,
      };
    }
  } else {
    return {
      path: null,
      errorInfo: GRCExecutableErrors.unsupportedOS,
    };
  }
}

export const grcExecutablePath = getGRCExecutablePath();
