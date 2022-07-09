import * as vscode from "vscode";

export enum SettingsJSON {
  showAuthenticationMessages = "grc.showAuthenticationErrorMessages",
  showAuthenticationStatusBar = "grc.showAuthenticationStatusBar",
}

export function getConfig(key: SettingsJSON): any {
  return vscode.workspace.getConfiguration().get(key);
}
