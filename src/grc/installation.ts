import * as vscode from "vscode";
import { execSync } from "child_process";
import { grcExecutablePath } from "./executable";

export function isGRCInstalled(): boolean {
  return grcExecutablePath.path !== null;
}

export enum GRCInstallationStatus {
  alreadyInstalled = "GitHub Repository Creator (GRC) is already installed.",
  success = "GitHub Repository Creator (GRC) was installed successfully.",
  error = "Error: Could not install GitHub Repository Creator (GRC).",
}

const GRC_DOWNLOAD_URL_WINDOWS =
  "https://raw.githubusercontent.com/ArthurSudbrackIbarra/GitHub-Repo-Creator/improve-unix-installation-process/grc-install.ps1";
const GRC_DOWNLOAD_URL_LINUX_MACOS =
  "https://raw.githubusercontent.com/ArthurSudbrackIbarra/GitHub-Repo-Creator/improve-unix-installation-process/grc-install.sh";

export function installGRC(
  targetDirectory: string | null
): GRCInstallationStatus {
  if (isGRCInstalled()) {
    return GRCInstallationStatus.alreadyInstalled;
  }
  if (process.platform === "win32" && targetDirectory) {
    try {
      execSync(
        `iex ((New-Object System.Net.WebClient).DownloadString('${GRC_DOWNLOAD_URL_WINDOWS}'))`,
        {
          cwd: targetDirectory,
          shell: "powershell.exe",
        }
      );
      return GRCInstallationStatus.success;
    } catch (error) {
      console.error(error);
      return GRCInstallationStatus.error;
    }
  } else if (process.platform === "linux" || process.platform === "darwin") {
    try {
      const terminal = vscode.window.createTerminal({
        name: "GRC Installer",
        shellPath: "/bin/bash",
      });
      terminal.sendText(
        `sudo -- sh -c 'wget ${GRC_DOWNLOAD_URL_LINUX_MACOS} && bash ./grc-install.sh && rm -f grc-install.sh'`
      );
      terminal.show();
      return GRCInstallationStatus.success;
    } catch (error) {
      console.error(error);
      return GRCInstallationStatus.error;
    }
  }
  return GRCInstallationStatus.error;
}
