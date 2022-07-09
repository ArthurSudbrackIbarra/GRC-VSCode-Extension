import * as vscode from "vscode";
import { ExtensionCommands } from "../extension";
import { getUser } from "../grc/commands";
import { isGRCInstalled } from "../grc/installation";
import { UserPreferences, getConfig } from "../configurations/user-preferences";

const shouldShowMessages = getConfig(
  UserPreferences.showAuthenticationMessages
);

export function showAuthMessage(onlyOnFailure: boolean = false): boolean {
  const user = getUser();
  if (user) {
    if (!onlyOnFailure) {
      vscode.window.showInformationMessage(
        `(GRC) Authenticated as ${user.name} - ${user.username}.`
      );
    }
    return true;
  } else if (!user && isGRCInstalled()) {
    if (shouldShowMessages) {
      vscode.window
        .showErrorMessage(
          "(GRC) Authentication failed, your access token is either not configured yet or it has changed/expired.",
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
