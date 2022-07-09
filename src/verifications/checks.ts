import * as vscode from "vscode";
import { join } from "path";
import { ExtensionCommands } from "../extension";
import { getGRCExecutablePath, GRCExecutableErrors } from "../grc/executable";
import { getGRCVersion, getUser, updateGRC } from "../grc/commands";
import { getWorkingDirectory } from "../vscode-components/workspace";

// Both variables below (installationErrorFlag and showGRCNotInstalledMessage)
// are used not to check for GRC installation more than once.
let installationErrorFlag = true;

// This variable stores a function that is called when GRC is not installed.
// It is used to show a message to the user.
let showGRCNotInstalledMessage: (() => void) | null = null;

export function checkGRCInstallation(
  suppressErrorMessages: boolean = false
): boolean {
  if (!installationErrorFlag) {
    return true;
  }
  if (showGRCNotInstalledMessage) {
    showGRCNotInstalledMessage();
    return false;
  }
  const grcExecutablePath = getGRCExecutablePath();
  if (!grcExecutablePath.path) {
    const errorInfo = grcExecutablePath.errorInfo;
    switch (errorInfo) {
      case GRCExecutableErrors.grcNotInstalled:
        {
          showGRCNotInstalledMessage = () => {
            if (!suppressErrorMessages) {
              vscode.window
                .showErrorMessage(errorInfo, "Install GRC")
                .then((answer) => {
                  if (answer) {
                    vscode.commands.executeCommand(
                      ExtensionCommands.installGRC
                    );
                  }
                });
            }
          };
        }
        break;
      default:
        {
          showGRCNotInstalledMessage = () => {
            if (errorInfo) {
              if (!suppressErrorMessages) {
                vscode.window.showErrorMessage(errorInfo);
              }
            }
          };
        }
        break;
    }
    showGRCNotInstalledMessage();
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

const VALID_GRC_VERSION = "v3.0.2";

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
