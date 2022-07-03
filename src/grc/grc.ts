import { execSync } from "child_process";

interface GRCExecutablePath {
  path: string | null;
  errorInfo: string | null;
}

export function getGRCExecutablePath(): GRCExecutablePath {
  let osCommand = undefined;
  if (process.platform === "win32") {
    osCommand = "where grc.bat";
  } else if (process.platform === "linux" || process.platform === "darwin") {
    osCommand = "which grc";
  } else {
    return {
      path: null,
      errorInfo: "Unsupported OS.",
    };
  }
  try {
    const executablePath = execSync(osCommand).toString().trim();
    return {
      path: executablePath,
      errorInfo: null,
    };
  } catch (error) {
    console.error(error);
    return {
      path: null,
      errorInfo: "GRC is not installed.",
    };
  }
}

const grcExecutablePath = getGRCExecutablePath();

function isGRCInstalled(): boolean {
  return grcExecutablePath.path !== null;
}

class GRCCommands {
  static readonly listTemplates = `${grcExecutablePath.path} temp list`;
  static readonly chooseTemplate = `${grcExecutablePath.path} temp choose`;
  static readonly getRepoURL = `${grcExecutablePath.path} remote url`;
  static readonly addCollaborator = `${grcExecutablePath.path} remote add-collab`;
}

export function getGRCTemplates(): string[] | null {
  if (!isGRCInstalled()) {
    return null;
  }
  try {
    const templates = execSync(GRCCommands.listTemplates)
      .toString()
      .trim()
      .split("\n");
    if (templates[0].toUpperCase().startsWith("NO ")) {
      return [];
    }
    return templates;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function chooseTemplate(
  templateName: string,
  repoName: string,
  repoDescription: string,
  workingDirectory: string
): boolean {
  if (!isGRCInstalled()) {
    return false;
  }
  try {
    execSync(
      `${GRCCommands.chooseTemplate} ${templateName} -n "${repoName}" -d "${repoDescription}"`,
      {
        cwd: workingDirectory,
      }
    );
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export function getRepoURL(repoName: string): string | null {
  if (!isGRCInstalled()) {
    return null;
  }
  try {
    return execSync(`${GRCCommands.getRepoURL} ${repoName}`).toString().trim();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function addCollaborator(
  repoName: string,
  collaborator: string,
  permission: string
): boolean {
  if (!isGRCInstalled()) {
    return false;
  }
  if (
    permission.length === 0 ||
    !["admin", "pull", "push"].includes(permission)
  ) {
    permission = "admin";
  }
  try {
    execSync(
      `${GRCCommands.addCollaborator} ${repoName} ${collaborator} ${permission}`
    );
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
