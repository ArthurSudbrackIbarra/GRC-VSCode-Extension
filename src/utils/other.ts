import * as vscode from "vscode";
import { getUser } from "../grc/commands";
import { isGRCInstalled } from "../grc/installation";

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
  return false;
}

export function updateStatusBarItem(
  statusBarItem: vscode.StatusBarItem,
  authenticated: boolean,
  text: string
) {
  statusBarItem.text = text;
  if (!authenticated) {
    statusBarItem.command = "grc.authenticate";
  }
  statusBarItem.show();
}
