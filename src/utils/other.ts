import * as vscode from "vscode";
import { getUser } from "../grc/commands";
import { isGRCInstalled } from "../grc/installation";
import { SettingsJSON, getConfig } from "../configurations/settingsJSON";

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

const shouldShowMessages = getConfig(SettingsJSON.showAuthenticationMessages);

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
            vscode.commands.executeCommand("grc.authenticate");
          }
        });
    }
  }
  return false;
}

const shouldShowStatusBar = getConfig(SettingsJSON.showAuthenticationStatusBar);

const statusBarItem = shouldShowStatusBar
  ? vscode.window.createStatusBarItem(
      `GRC Authentication`,
      vscode.StatusBarAlignment.Right,
      1
    )
  : null;

export function updateAuthenticationStatusBar(
  authenticated: boolean,
  text: string
): void {
  if (!statusBarItem) {
    return;
  }
  statusBarItem.text = text;
  if (!authenticated) {
    statusBarItem.command = "grc.authenticate";
  }
  statusBarItem.show();
}
