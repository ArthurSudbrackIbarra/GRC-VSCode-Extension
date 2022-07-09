import * as vscode from "vscode";
import {
  installGRC,
  GRCInstallationStatus,
  isGRCInstalled,
} from "./grc/installation";
import {
  authenticate,
  getTemplates,
  chooseTemplate,
  getRepoURL,
  availablePermissions,
  addCollaborator,
  getUser,
  createTemplate,
} from "./grc/commands";
import { showAuthenticationMessage } from "./verifications/actions";
import {
  getPreference,
  UserPreferences,
} from "./configurations/user-preferences";
import {
  checkGRCInstallation,
  checkGRCVersion,
  setRestartVSCodeFlag,
  checkRestartVSCode,
  checkIfAlreadyGitRepository,
  checkUserAthenticated,
} from "./verifications/checks";
import { getWorkingDirectory } from "./vscode-components/workspace";
import { updateAuthenticationStatusBar } from "./vscode-components/status-bar";

export enum ExtensionCommands {
  installGRC = "grc.install-grc",
  authenticate = "grc.authenticate",
  startRepository = "grc.start-repository",
  createTemplate = "grc.create-template",
  addCollaborator = "grc.add-collaborator",
}

export function activate(context: vscode.ExtensionContext) {
  console.log("GRC extension activated.");
  /*
    On Startup.
  */
  if (showAuthenticationMessage(true)) {
    updateAuthenticationStatusBar(true, `GRC (${getUser()?.username})`);
  } else {
    updateAuthenticationStatusBar(false, `GRC (Not Authenticated)`);
  }
  // These checks on startup will later speed up the extension commands.
  if (getPreference(UserPreferences.allowPreChecksOnStartup)) {
    checkGRCInstallation(true);
    checkGRCVersion(true);
  }
  /*
    Command 1: Install GRC.
  */
  context.subscriptions.push(
    vscode.commands.registerCommand(ExtensionCommands.installGRC, async () => {
      if (isGRCInstalled()) {
        vscode.window.showInformationMessage("GRC is already installed.");
        return;
      }
      let folder: vscode.Uri[] | undefined = undefined;
      if (process.platform === "win32") {
        folder = await vscode.window.showOpenDialog({
          canSelectFiles: false,
          canSelectFolders: true,
          canSelectMany: false,
          openLabel: "Install GRC Here",
          title: "Install GRC",
        });
      }
      if (folder) {
        const targetDirectory = folder[0].fsPath;
        const installationStatus = installGRC(targetDirectory);
        if (installationStatus === GRCInstallationStatus.alreadyInstalled) {
          vscode.window.showInformationMessage(installationStatus);
        } else if (installationStatus === GRCInstallationStatus.error) {
          vscode.window.showErrorMessage(installationStatus);
        } else {
          setRestartVSCodeFlag(true);
        }
      } else {
        const installationStatus = installGRC(null);
        if (installationStatus === GRCInstallationStatus.alreadyInstalled) {
          vscode.window.showInformationMessage(installationStatus);
        } else if (installationStatus === GRCInstallationStatus.error) {
          vscode.window.showErrorMessage(installationStatus);
        } else {
          setRestartVSCodeFlag(true);
        }
      }
    })
  );
  /*
    Command 2: Authenticate.
  */
  context.subscriptions.push(
    vscode.commands.registerCommand(
      ExtensionCommands.authenticate,
      async () => {
        if (!checkRestartVSCode()) {
          return;
        }
        if (!checkGRCInstallation()) {
          return;
        }
        if (!checkGRCVersion()) {
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
          showAuthenticationMessage();
          updateAuthenticationStatusBar(true, `GRC (${getUser()?.username})`);
        } else {
          vscode.window.showErrorMessage(
            "(GRC) Authentication failed. Your access token is invalid."
          );
        }
      }
    )
  );
  /*
    Command 3: Start Repository.
  */
  context.subscriptions.push(
    vscode.commands.registerCommand(
      ExtensionCommands.startRepository,
      async () => {
        if (!checkRestartVSCode()) {
          return;
        }
        if (!checkGRCInstallation()) {
          return;
        }
        if (!checkGRCVersion()) {
          return;
        }
        if (!checkUserAthenticated()) {
          return;
        }
        if (await checkIfAlreadyGitRepository()) {
          vscode.window.showErrorMessage(
            "Error: Your current directory is already a git repository."
          );
          return;
        }
        const templates = getTemplates();
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
          placeHolder: `(${user?.username}) Enter a name for the repository:`,
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
              `Repository created successfully for account ${user?.username}: ${repoURL}.`,
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
      }
    )
  );
  /*
    Command 4: Create Template.
  */
  context.subscriptions.push(
    vscode.commands.registerCommand(ExtensionCommands.createTemplate, () => {
      if (!checkRestartVSCode()) {
        return;
      }
      if (!checkGRCInstallation()) {
        return;
      }
      if (!checkGRCVersion()) {
        return;
      }
      createTemplate();
    })
  );
  /*
    Command 5: Add Collaborator.
  */
  context.subscriptions.push(
    vscode.commands.registerCommand(
      ExtensionCommands.addCollaborator,
      async () => {
        if (!checkRestartVSCode()) {
          return;
        }
        if (!checkGRCInstallation()) {
          return;
        }
        if (!checkGRCVersion()) {
          return;
        }
        if (!checkUserAthenticated()) {
          return;
        }
        const repoName = await vscode.window.showInputBox({
          placeHolder: `(${getUser()?.username
            }) Enter the name of the remote repository:`,
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
      }
    )
  );
}

export function deactivate() {
  console.log("GRC extension deactivated.");
}
