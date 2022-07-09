import * as vscode from "vscode";
import { join } from "path";
import { ExtensionCommands } from "../extension";
import { getGRCExecutablePath, GRCExecutableErrors } from "../grc/executable";
import { getGRCVersion, getUser, updateGRC } from "../grc/commands";
import { getWorkingDirectory } from "../vscode-components/workspace";
import { showInstallationErrorMessage } from "./actions";

let installationErrorFlag = true;
let installationError: GRCExecutableErrors | null = null;

export function checkGRCInstallation(
  suppressErrorMessages: boolean = false
): boolean {
  if (!installationErrorFlag) {
    return true;
  }
  if (installationError) {
    if (suppressErrorMessages) {
      return false;
    }
    showInstallationErrorMessage(installationError);
    return false;
  }
  const grcExecutablePath = getGRCExecutablePath();
  if (!grcExecutablePath.path) {
    installationError = grcExecutablePath.errorInfo;
    if (!suppressErrorMessages && installationError) {
      showInstallationErrorMessage(installationError);
    }
    return false;
  }
  installationErrorFlag = false;
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

export function checkUserAthenticated(
  suppressErrorMessages: boolean = false
): boolean {
  if (!getUser()) {
    if (!suppressErrorMessages) {
      vscode.window
        .showErrorMessage(
          "Error: You are not authenticated with GRC. Please authenticate first.",
          "Authenticate"
        )
        .then((answer) => {
          if (answer) {
            vscode.commands.executeCommand(ExtensionCommands.authenticate);
          }
        });
    }
    return false;
  }
  return true;
}

// This variable prevents the version from being checked again if it was already previously correct.
let grcVersion: string | null = null;

const VALID_GRC_VERSION = "v3.0.3";

export function checkGRCVersion(
  suppressErrorMessages: boolean = false
): boolean {
  if (grcVersion === VALID_GRC_VERSION) {
    return true;
  }
  grcVersion = getGRCVersion();
  if (!grcVersion || grcVersion.toLowerCase() !== VALID_GRC_VERSION) {
    if (!suppressErrorMessages) {
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
    }
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
    await vscode.workspace.fs.stat(
      vscode.Uri.file(join(workingDirectory, ".git"))
    );
    return true;
  } catch (error) {
    return false;
  }
}
