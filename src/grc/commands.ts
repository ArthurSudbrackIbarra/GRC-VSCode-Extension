import { execSync } from "child_process";
import { grcExecutablePath } from "./executable";
import { isGRCInstalled } from "./installation";

class GRCCommands {
  static readonly authenticate = `${grcExecutablePath.path} authenticate`;
  static readonly userInfo = `${grcExecutablePath.path} user`;
  static readonly listTemplates = `${grcExecutablePath.path} temp list`;
  static readonly chooseTemplate = `${grcExecutablePath.path} temp choose`;
  static readonly getRepoURL = `${grcExecutablePath.path} remote url`;
  static readonly addCollaborator = `${grcExecutablePath.path} remote add-collab`;
}

/*
  Authentication.
*/

export function isAuthenticated(): boolean {
  try {
    const result = execSync(`${GRCCommands.getRepoURL} XXXXX`)
      .toString()
      .trim();
    return !result.toUpperCase().includes("NOT AUTHENTICATED");
  } catch (error) {
    console.error(error);
    return false;
  }
}

export function authenticate(accessToken: string): boolean {
  try {
    const result = execSync(`${GRCCommands.authenticate} ${accessToken}`);
    return !result.toString().toUpperCase().includes("ERROR");
  } catch (error) {
    console.error(error);
    return false;
  }
}

/*
  User Information.
*/

interface GitHubUser {
  username: string;
  email: string;
  name: string;
  avatarURL: string;
}

export function getUser(): GitHubUser | null {
  if (!isGRCInstalled() || !isAuthenticated()) {
    return null;
  }
  try {
    const userInfoLines = execSync(GRCCommands.userInfo)
      .toString()
      .trim()
      .split("\n");
    const user: GitHubUser = {
      username: "",
      email: "",
      name: "",
      avatarURL: "",
    };
    for (const line of userInfoLines) {
      const splittedLine = line.split(":", 2);
      switch (splittedLine[0].toUpperCase()) {
        case "USERNAME":
          {
            user.username = splittedLine[1].trim();
          }
          break;
        case "E-MAIL":
          {
            user.email = splittedLine[1].trim();
          }
          break;
        case "NAME":
          {
            user.name = splittedLine[1].trim();
          }
          break;
        case "AVATAR URL":
          {
            user.avatarURL = splittedLine[1].trim();
          }
          break;
      }
    }
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/*
  Templates.
*/

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

/*
  Repository.
*/

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
