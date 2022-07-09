import * as vscode from "vscode";

export enum UserPreferences {
  showAuthenticationErrorMessages = "grc.showAuthenticationErrorMessages",
  showAuthenticationStatusBar = "grc.showAuthenticationStatusBar",
  allowPreChecksOnStartup = "grc.allowPre-checksOnStartup",
}

export function getPreference(key: UserPreferences): any {
  return vscode.workspace.getConfiguration().get(key);
}
