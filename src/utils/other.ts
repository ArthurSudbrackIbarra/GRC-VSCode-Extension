import * as vscode from "vscode";
import { getUser } from "../grc/commands";

export function getWorkingDirectory(): string | null {
  if (!vscode.workspace.workspaceFolders) {
    return null;
  }
  let workingDirectory = vscode.workspace.workspaceFolders[0].uri.path;
  if (workingDirectory.startsWith("/") && process.platform === "win32") {
    workingDirectory = workingDirectory.substring(1);
  }
  return workingDirectory;
}

export function showAuthMessage(onlyOnFailure: boolean = false): void {
  const user = getUser();
  if (user && !onlyOnFailure) {
    vscode.window.showInformationMessage(
      `(GRC) Authenticated as ${user.name} - ${user.username}.`
    );
  } else if (!user) {
    vscode.window.showErrorMessage(
      "(GRC) Authentication failed, your access token might have changed or expired."
    );
  }
}
