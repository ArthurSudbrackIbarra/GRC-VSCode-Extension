import * as vscode from "vscode";

export enum UserPreferences {
  showAuthenticationErrorMessages = "grc.showAuthenticationErrorMessages",
  showAuthenticationStatusBar = "grc.showAuthenticationStatusBar",
}

export function getConfig(key: UserPreferences): any {
  return vscode.workspace.getConfiguration().get(key);
}
