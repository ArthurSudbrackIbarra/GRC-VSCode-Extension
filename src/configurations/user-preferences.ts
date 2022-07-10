import * as vscode from "vscode";

export enum UserPreferences {
  showAuthenticationErrorMessages = "grc.showAuthenticationErrorMessages",
  showAuthenticationStatusBar = "grc.showAuthenticationStatusBar",
  allowPreChecksOnStartup = "grc.allowPre-checksOnStartup",
  showCommandsBeingUsed = "grc.showCommandsBeingUsed",
}

export function getPreference(key: UserPreferences): any {
  return vscode.workspace.getConfiguration().get(key);
}
