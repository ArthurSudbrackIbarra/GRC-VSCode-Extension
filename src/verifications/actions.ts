import * as vscode from "vscode";
import { ExtensionCommands } from "../extension";
import { getUser } from "../grc/commands";
import { isGRCInstalled } from "../grc/installation";
import {
  UserPreferences,
  getPreference,
} from "../configurations/user-preferences";
import { GRCExecutableErrors } from "../grc/executable";

const shouldShowMessages = getPreference(
  UserPreferences.showAuthenticationErrorMessages
);

export function showInstallationErrorMessage(error: GRCExecutableErrors): void {
  switch (error) {
    case GRCExecutableErrors.grcNotInstalled:
      {
        vscode.window.showErrorMessage(error, "Install GRC").then((answer) => {
          if (answer) {
            vscode.commands.executeCommand(ExtensionCommands.installGRC);
          }
        });
      }
      break;
    default:
      {
        vscode.window.showErrorMessage(error);
      }
      break;
  }
}

export function showAuthenticationMessage(
  onlyOnFailure: boolean = false
): boolean {
  const user = getUser();
  if (user) {
    if (!onlyOnFailure) {
      vscode.window.showInformationMessage(
        `Authenticated as ${user.username}.`
      );
    }
    return true;
  } else if (!user && isGRCInstalled()) {
    if (shouldShowMessages) {
      vscode.window
        .showErrorMessage(
          "Authentication failed, your access token is either not configured yet or it has changed/expired.",
          "Authenticate"
        )
        .then((answer) => {
          if (answer) {
            vscode.commands.executeCommand(ExtensionCommands.authenticate);
          }
        });
    }
  }
  return false;
}
