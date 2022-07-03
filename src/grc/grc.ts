import { execSync } from "child_process";

export enum GRCErrorMessages {
  grcNotInstalled = "GitHub Repository Creator (GRC) is not installed.",
  unsupportedOS = "GitHub Repository Creator (GRC) is not supported on this OS.",
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
        errorInfo: GRCErrorMessages.grcNotInstalled,
      };
    }
    try {
      const executablePath = execSync("where grc.bat").toString().trim();
      return {
        path: executablePath,
        errorInfo: null,
      };
    } catch (error) {
      console.error(error);
      return {
        path: null,
        errorInfo: GRCErrorMessages.grcNotInstalled,
      };
    }
  } else if (process.platform === "linux" || process.platform === "darwin") {
    try {
      const executablePath = execSync("which grc").toString().trim();
      return {
        path: executablePath,
        errorInfo: null,
      };
    } catch (error) {
      console.error(error);
      return {
        path: null,
        errorInfo: GRCErrorMessages.grcNotInstalled,
      };
    }
  } else {
    return {
      path: null,
      errorInfo: GRCErrorMessages.unsupportedOS,
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
    return templates.filter((template) => template.includes(".yaml"));
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
      `${GRCCommands.chooseTemplate} ${templateName} -n "${repoName}" -d "${repoDescription}" -i true`,
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
    const repositories = execSync(`${GRCCommands.getRepoURL} ${repoName}`)
      .toString()
      .trim()
      .split("\n");
    return repositories.filter((repository) =>
      repository.startsWith("https://")
    )[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const availablePermissions = ["admin", "push", "pull"];

export function addCollaborator(
  repoName: string,
  collaborator: string,
  permission: string
): boolean {
  if (!isGRCInstalled()) {
    return false;
  }
  if (permission.length === 0 || !availablePermissions.includes(permission)) {
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
