import * as vscode from "vscode";
import { existsSync } from "fs";
import { join } from "path";
import { getGRCExecutablePath, GRCExecutableErrors } from "../grc/executable";
import { getGRCVersion, isAuthenticated, updateGRC } from "../grc/commands";
import { getWorkingDirectory } from "./other";

export function checkGRCInstallation(): boolean {
  const grcExecutablePath = getGRCExecutablePath();
  if (!grcExecutablePath.path) {
    const errorInfo = grcExecutablePath.errorInfo;
    switch (errorInfo) {
      case GRCExecutableErrors.grcNotInstalled:
        {
          vscode.window
            .showErrorMessage(errorInfo, "Install GRC")
            .then((answer) => {
              if (answer) {
                vscode.commands.executeCommand("grc.install-grc");
              }
            });
        }
        break;
      case GRCExecutableErrors.unsupportedOS:
        {
          vscode.window.showErrorMessage(errorInfo);
        }
        break;
    }
    return false;
  }
  return true;
}

let restartVSCodeFlag = false;

export function setRestartVSCodeFlag(flag: boolean): void {
  restartVSCodeFlag = flag;
}
export function checkRestartVSCode(): boolean {
  if (restartVSCodeFlag) {
    vscode.window.showWarningMessage(
      "(GRC) Please restart Visual Studio Code before using GRC extension."
    );
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

const VALID_GRC_VERSION = "v3.0.2";

export function checkGRCVersion(): boolean {
  const grcVersion = getGRCVersion();
  if (!grcVersion || grcVersion.toLowerCase() !== VALID_GRC_VERSION) {
    vscode.window
      .showErrorMessage(
        `Error: GRC version is not supported. Expected: ${VALID_GRC_VERSION}, Actual: ${grcVersion}.`,
        "Update GRC"
      )
      .then((answer) => {
        if (answer) {
          const updated = updateGRC();
          if (updated) {
            vscode.window.showInformationMessage(`GRC version updated.`);
          } else {
            vscode.window.showErrorMessage(
              `Error: GRC version could not be updated.`
            );
          }
        }
      });
    return false;
  }
  return true;
}

export async function checkIfAlreadyGitRepository(): Promise<boolean> {
  const workingDirectory = getWorkingDirectory();
  if (!workingDirectory) {
    return false;
  }
  try {
    await vscode.workspace.fs.stat(vscode.Uri.file(join(workingDirectory, ".git")));
    return true;
  } catch (error) {
    return false;
  }
}
