import * as vscode from "vscode";
import { ExtensionCommands } from "../extension";
import { UserPreferences, getConfig } from "../configurations/user-preferences";

const shouldShowStatusBar = getConfig(
  UserPreferences.showAuthenticationStatusBar
);

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
    statusBarItem.command = ExtensionCommands.authenticate;
  }
  statusBarItem.show();
}
