import * as vscode from "vscode";
import { grcExecutablePath } from "./executable";

export function isGRCInstalled(): boolean {
  return grcExecutablePath.path !== null;
}

export enum GRCInstallationStatus {
  alreadyInstalled = "GitHub Repository Creator (GRC) is already installed.",
  inProgress = "...",
  error = "Error: Could not install GitHub Repository Creator (GRC).",
}

const AUTHOR = "ArthurSudbrackIbarra";
const REPOSITORY = "GitHub-Repo-Creator";
const BRANCH = "main";

const GRC_DOWNLOAD_URL_WINDOWS = `https://raw.githubusercontent.com/${AUTHOR}/${REPOSITORY}/${BRANCH}/grc-install-windows.ps1`;
const GRC_DOWNLOAD_URL_LINUX = `https://raw.githubusercontent.com/${AUTHOR}/${REPOSITORY}/${BRANCH}/grc-install-linux.sh`;
const GRC_DOWNLOAD_URL_MACOS = `https://raw.githubusercontent.com/${AUTHOR}/${REPOSITORY}/${BRANCH}/grc-install-macos.sh`;

const WINDOWS_INSTALLATION_COMMAND = `iex ((New-Object System.Net.WebClient).DownloadString('${GRC_DOWNLOAD_URL_WINDOWS}'))`;
const LINUX_INSTALLATION_COMMAND = `sudo -- sh -c 'wget ${GRC_DOWNLOAD_URL_LINUX} && bash grc-install-linux.sh && rm -f grc-install-linux.sh'`;
const MACOS_INSTALLATION_COMMAND = `sudo -- sh -c 'curl ${GRC_DOWNLOAD_URL_MACOS} -O && bash grc-install-macos.sh && rm -f grc-install-macos.sh'`;

export function installGRC(
  targetDirectory: string | null
): GRCInstallationStatus {
  if (isGRCInstalled()) {
    return GRCInstallationStatus.alreadyInstalled;
  }
  if (process.platform === "win32" && targetDirectory) {
    try {
      const terminal = vscode.window.createTerminal({
        name: "GRC Installer",
        shellPath: "powershell.exe",
        cwd: targetDirectory,
      });
      terminal.sendText(WINDOWS_INSTALLATION_COMMAND);
      terminal.show();
      return GRCInstallationStatus.inProgress;
    } catch (error) {
      console.error(error);
      return GRCInstallationStatus.error;
    }
  } else if (process.platform === "linux" || process.platform === "darwin") {
    try {
      const terminal = vscode.window.createTerminal({
        name: "GRC Installer",
        shellPath: "/bin/bash",
        cwd: "/home",
      });
      const command =
        process.platform === "linux"
          ? LINUX_INSTALLATION_COMMAND
          : MACOS_INSTALLATION_COMMAND;
      terminal.sendText(command);
      terminal.show();
      vscode.window.showInformationMessage(
        "Please enter your sudo password to install GitHub Repository Creator (GRC)."
      );
      return GRCInstallationStatus.inProgress;
    } catch (error) {
      console.error(error);
      return GRCInstallationStatus.error;
    }
  }
  return GRCInstallationStatus.error;
}
