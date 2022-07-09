import * as vscode from "vscode";

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
