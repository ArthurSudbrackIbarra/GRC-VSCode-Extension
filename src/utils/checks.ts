import * as vscode from "vscode";
import { existsSync } from "fs";
import { join } from "path";
import { getGRCExecutablePath, GRCExecutableErrors } from "../grc/executable";
import { isAuthenticated } from "../grc/commands";
import { getWorkingDirectory } from "./other";

export function checkGRCInstallation(): boolean {
  const grcExecutablePath = getGRCExecutablePath();
  if (!grcExecutablePath.path) {
    const errorInfo = grcExecutablePath.errorInfo;
    switch (errorInfo) {
      case GRCExecutableErrors.grcNotInstalled: {
        vscode.window
          .showErrorMessage(errorInfo, "Install GRC")
          .then((answer) => {
            if (answer) {
              vscode.commands.executeCommand("grc.install-grc");
            }
          });
        break;
      }
      case GRCExecutableErrors.unsupportedOS: {
        vscode.window.showErrorMessage(errorInfo);
        break;
      }
    }
    return false;
  }
  return true;
}

export function checkUserAthenticated(): boolean {
  if (!isAuthenticated()) {
    vscode.window
      .showErrorMessage(
        "Error: You are not authenticated with GRC. Please authenticate first.",
        "Authenticate"
      )
      .then((answer) => {
        if (answer) {
          vscode.commands.executeCommand("grc.authenticate");
        }
      });
    return false;
  }
  return true;
}

export function checkIfAlreadyGitRepository(): boolean {
  const workingDirectory = getWorkingDirectory();
  if (!workingDirectory) {
    return false;
  }
  const gitPath = join(workingDirectory, ".git");
  return existsSync(gitPath);
}
