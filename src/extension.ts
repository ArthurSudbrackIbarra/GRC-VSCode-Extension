import * as vscode from "vscode";
import {
  getGRCTemplates,
  chooseTemplate,
  getRepoURL,
  availablePermissions,
  addCollaborator,
} from "./grc/grc";

export function activate(context: vscode.ExtensionContext) {
  console.log("GRC extension activated.");
  // [COMMAND 1: Start Repository].
  context.subscriptions.push(
    vscode.commands.registerCommand("grc.start-repository", async () => {
      const templates = getGRCTemplates();
      if (templates === null) {
        vscode.window.showErrorMessage("GRC is not installed.");
        return;
      }
      if (templates.length === 0) {
        vscode.window.showInformationMessage("You have no templates to use.");
        return;
      }
      const templateName = await vscode.window.showQuickPick(templates, {
        placeHolder: "Choose a template to use:",
      });
      if (!templateName) {
        return;
      }
      const repoName = await vscode.window.showInputBox({
        placeHolder: "Enter a name for the repository:",
      });
      if (!repoName) {
        return;
      }
      const repoDescription = await vscode.window.showInputBox({
        placeHolder: "Enter a description for the repository:",
      });
      if (!repoDescription) {
        return;
      }
      if (!vscode.workspace.workspaceFolders) {
        vscode.window.showErrorMessage("No workspace folder found.");
        return;
      }
      let workingDirectory = vscode.workspace.workspaceFolders[0].uri.path;
      if (workingDirectory.startsWith("/") && process.platform === "win32") {
        workingDirectory = workingDirectory.substring(1);
      }
      const created = chooseTemplate(
        templateName,
        repoName,
        repoDescription,
        workingDirectory
      );
      if (created) {
        const repoURL = getRepoURL(repoName);
        if (!repoURL) {
          vscode.window.showErrorMessage("Failed to get the repository URL.");
          return;
        }
        vscode.window
          .showInformationMessage(
            `Repository created successfully. ${repoURL}.`,
            "Open in Browser"
          )
          .then((answer) => {
            if (answer) {
              vscode.env.openExternal(vscode.Uri.parse(repoURL));
            }
          });
      } else {
        vscode.window.showErrorMessage(
          `Failed to create repository ${repoName}.`
        );
      }
    })
  );
  // [COMMAND 2: Add Collaborator].
  context.subscriptions.push(
    vscode.commands.registerCommand("grc.add-collaborator", async () => {
      const repoName = await vscode.window.showInputBox({
        placeHolder: "Enter the name of the remote repository:",
      });
      if (!repoName) {
        return;
      }
      const collaboratorName = await vscode.window.showInputBox({
        placeHolder: "Enter the name of the collaborator:",
      });
      if (!collaboratorName) {
        return;
      }
      const permission = await vscode.window.showQuickPick(
        availablePermissions,
        {
          placeHolder: `Choose the permission to give to ${collaboratorName}:`,
        }
      );
      if (!permission) {
        return;
      }
      const added = addCollaborator(repoName, collaboratorName, permission);
      if (added) {
        vscode.window.showInformationMessage(
          `Collaborator ${collaboratorName} added to ${repoName}.`
        );
      } else {
        vscode.window.showErrorMessage(
          `Failed to add ${collaboratorName} to ${repoName}.`
        );
      }
    })
  );
}

export function deactivate() {}
