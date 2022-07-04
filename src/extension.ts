import * as vscode from "vscode";
import { installGRC, GRCInstallationStatus } from "./grc/installation";
import {
  authenticate,
  getGRCTemplates,
  chooseTemplate,
  getRepoURL,
  availablePermissions,
  addCollaborator,
  getUser,
} from "./grc/commands";
import {
  checkGRCInstallation,
  checkIfAlreadyGitRepository,
  checkUserAthenticated,
} from "./utils/checks";
import { getWorkingDirectory, showAuthMessage } from "./utils/other";

export function activate(context: vscode.ExtensionContext) {
  console.log("GRC extension activated.");
  /*
    On Startup.
  */
  showAuthMessage(true);
  /*
    Command 1: Install GRC.
  */
  context.subscriptions.push(
    vscode.commands.registerCommand("grc.install-grc", () => {
      vscode.window
        .showOpenDialog({
          canSelectFiles: false,
          canSelectFolders: true,
          canSelectMany: false,
          openLabel: "Install GRC Here",
          title: "Install GRC",
        })
        .then((folder) => {
          if (folder) {
            const targetDirectory = folder[0].fsPath;
            const installationStatus = installGRC(targetDirectory);
            if (installationStatus === GRCInstallationStatus.alreadyInstalled) {
              vscode.window.showInformationMessage(installationStatus);
            } else if (installationStatus === GRCInstallationStatus.success) {
              vscode.window
                .showInformationMessage(
                  `${installationStatus} You need to restart VSCode for the changes to take effect.`,
                  "Close VSCode"
                )
                .then((answer) => {
                  if (answer) {
                    vscode.commands.executeCommand(
                      "workbench.action.closeWindow"
                    );
                  }
                });
            } else {
              vscode.window.showErrorMessage(installationStatus);
            }
          }
        });
    })
  );
  /*
    Command 2: Authenticate.
  */
  context.subscriptions.push(
    vscode.commands.registerCommand("grc.authenticate", async () => {
      if (!checkGRCInstallation()) {
        return;
      }
      const accessToken = await vscode.window.showInputBox({
        prompt: "Enter your GitHub access token:",
        password: true,
      });
      if (!accessToken) {
        return;
      }
      const authenticated = authenticate(accessToken);
      if (authenticated) {
        showAuthMessage();
      } else {
        vscode.window.showErrorMessage(
          "(GRC) Authentication failed. Your access token is invalid."
        );
      }
    })
  );
  /*
    Command 3: Start Repository.
  */
  context.subscriptions.push(
    vscode.commands.registerCommand("grc.start-repository", async () => {
      if (!checkGRCInstallation()) {
        return;
      }
      if (!checkUserAthenticated()) {
        return;
      }
      if (checkIfAlreadyGitRepository()) {
        vscode.window.showErrorMessage(
          "Error: Your current directory is already a git repository."
        );
        return;
      }
      const templates = getGRCTemplates();
      if (templates === null) {
        vscode.window.showErrorMessage(
          "Error: An unexpected error occurred. Try again later."
        );
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
      const user = getUser();
      const repoName = await vscode.window.showInputBox({
        placeHolder: `(${user?.name}) Enter a name for the repository:`,
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
      const workingDirectory = getWorkingDirectory();
      if (!workingDirectory) {
        vscode.window.showErrorMessage("Error: No workspace folder found.");
        return;
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
          vscode.window.showErrorMessage(
            "Error: Failed to get the repository URL."
          );
          return;
        }
        vscode.window
          .showInformationMessage(
            `Repository created successfully for account ${user?.name}: ${repoURL}.`,
            "Open in Browser"
          )
          .then((answer) => {
            if (answer) {
              vscode.env.openExternal(vscode.Uri.parse(repoURL));
            }
          });
      } else {
        vscode.window.showErrorMessage(
          `Error: Failed to create repository ${repoName}.`
        );
      }
    })
  );
  /*
    Command 4: Add Collaborator.
  */
  context.subscriptions.push(
    vscode.commands.registerCommand("grc.add-collaborator", async () => {
      if (!checkGRCInstallation()) {
        return;
      }
      if (!checkUserAthenticated()) {
        return;
      }
      const user = getUser();
      const repoName = await vscode.window.showInputBox({
        placeHolder: `(${user?.username}) Enter the name of the remote repository:`,
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
          `Error: Failed to add ${collaboratorName} to ${repoName}.`
        );
      }
    })
  );
}

export function deactivate() {
  console.log("GRC extension deactivated.");
}
