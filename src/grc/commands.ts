import * as vscode from "vscode";
import { execSync } from "child_process";
import { readdirSync } from "fs";
import { join } from "path";
import { grcExecutablePath } from "./executable";
import { isGRCInstalled } from "./installation";

class GRCCommands {
  static readonly authenticate = `"${grcExecutablePath.path}" authenticate`;
  static readonly getVersion = `"${grcExecutablePath.path}" version`;
  static readonly update = `"${grcExecutablePath.path}" update`;
  static readonly userInfo = `"${grcExecutablePath.path}" user`;
  static readonly chooseTemplate = `"${grcExecutablePath.path}" temp choose`;
  // generateTemplate is applied directly to the user's VSCode terminal.
  static readonly generateTemplate = "grc temp generate";
  static readonly mergeTemplates = `"${grcExecutablePath.path}" temp merge`;
  static readonly editTemplate = `"${grcExecutablePath.path}" temp edit`;
  static readonly getRepoURL = `"${grcExecutablePath.path}" remote url`;
  static readonly addCollaborator = `"${grcExecutablePath.path}" remote add-collab`;
}

/*
  Authentication.
*/

export function isAuthenticated(): boolean {
  if (!isGRCInstalled()) {
    return false;
  }
  try {
    execSync(GRCCommands.userInfo);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export function authenticate(accessToken: string): boolean {
  if (!isGRCInstalled()) {
    return false;
  }
  try {
    execSync(`${GRCCommands.authenticate} ${accessToken}`);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

/*
  Version.
*/

export function getGRCVersion(): string | null {
  if (!isGRCInstalled()) {
    return null;
  }
  try {
    const versionLines = execSync(GRCCommands.getVersion)
      .toString()
      .trim()
      .split("\n");
    for (const line of versionLines) {
      if (line.toUpperCase().includes("GRC VERSION")) {
        return line.split(" ")[2];
      }
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/*
  Update.
*/

export function updateGRC(): boolean {
  if (!isGRCInstalled()) {
    return false;
  }
  try {
    execSync(GRCCommands.update);
    return true;
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

let user: GitHubUser | null = null;

export function getUser(): GitHubUser | null {
  if (!isGRCInstalled() || !isAuthenticated()) {
    return null;
  }
  if (user) {
    return user;
  }
  try {
    const userInfoLines = execSync(GRCCommands.userInfo)
      .toString()
      .trim()
      .split("\n");
    user = {
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

function getTemplatesPath(): string | null {
  if (!isGRCInstalled() || !grcExecutablePath.path) {
    return null;
  }
  if (process.platform === "win32") {
    return join(grcExecutablePath.path, "..", "templates");
  } else if (process.platform === "linux" || process.platform === "darwin") {
    return "/opt/grc/GitHub-Repo-Creator/templates";
  } else {
    return null;
  }
}

export function getTemplates(): string[] | null {
  try {
    const templatesPath = getTemplatesPath();
    if (!templatesPath) {
      return null;
    }
    return readdirSync(templatesPath).filter((fileName) =>
      fileName.endsWith(".yaml")
    );
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
  if (!isGRCInstalled() || !isAuthenticated()) {
    return false;
  }
  try {
    execSync(
      `${GRCCommands.chooseTemplate} ${templateName} -n "${repoName}" -d "${repoDescription}" --include_content true`,
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

export function createTemplate(): boolean {
  if (!isGRCInstalled()) {
    return false;
  }
  try {
    const terminal = vscode.window.createTerminal({
      name: "Generate GRC Template",
    });
    terminal.sendText(GRCCommands.generateTemplate);
    terminal.show();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export function mergeTemplates(
  templateNames: string[],
  outputFileName: string
): boolean {
  if (!isGRCInstalled()) {
    return false;
  }
  try {
    execSync(
      `${GRCCommands.mergeTemplates} ${templateNames.join(
        " "
      )} -o ${outputFileName} --ignore_conflicts`
    );
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function editTemplate(templateName: string): Promise<boolean> {
  if (!isGRCInstalled()) {
    return false;
  }
  const templatesPath = getTemplatesPath();
  if (!templatesPath) {
    return false;
  }
  const document = await vscode.workspace.openTextDocument(
    join(templatesPath, templateName)
  );
  if (!document) {
    return false;
  }
  vscode.window.showTextDocument(document);
  return true;
}

/*
  Repository.
*/

export function getRepoURL(repoName: string): string | null {
  if (!isGRCInstalled() || !isAuthenticated()) {
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
  if (!isGRCInstalled() || !isAuthenticated()) {
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
