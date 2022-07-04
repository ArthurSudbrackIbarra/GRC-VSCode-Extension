<h1 align="center">GRC VSCode Extension</h1>

An extension for using [GRC](https://github.com/ArthurSudbrackIbarra/GitHub-Repo-Creator) inside Visual Studio Code. Automatically start GitHub repositories in your current workspace.
<br/>

## Table of Contents

- [Features](#features)
  - [GRC: Add Collaborator to Remote Repository](#grc-add-collaborator-to-remote-repository)
  - [GRC: Authenticate](#grc-authenticate)
  - [GRC: Install GRC](#grc-install-grc)
  - [GRC: Start GitHub Repository Here](#grc-start-github-repository-here)
- [Requirements](#requirements)
- [Known Issues](#known-issues)
- [Release Notes](#release-notes)
  - [0.0.1](#001)

## Features

Bellow, all the GRC extension features will be listed. To use GRC commands, press `ctrl` + `shift` + `p` or `⌘` + `shift` + `p` to open the command pallete.

<p align="center">
    <img src="assets/readme-images/grc-commands.png" alt="GRC Commands">
</p>

### GRC: Add Collaborator to Remote Repository

Use this command to add a collaborator to one of your remote GitHub repositories. You'll be asked to enter the repository name, the collaborator name and the permission of the collaborator.

<p align="center">
    <img src="assets/readme-images/grc-add-collaborator.png" alt="GRC Add Collaborator">
</p>

### GRC: Authenticate

Use this command to authenticate to GitHub with GRC. You must use this command before using any other commands that involve interaction with your GitHub account.

<p align="center">
    <img src="assets/readme-images/grc-authenticate.png" alt="GRC Authenticate">
</p>

### GRC: Install GRC

Use this command to install GRC in your machine in case you don't have it yet. You'll be asked to choose the directory where GRC will be installed.

<p align="center">
    <img src="assets/readme-images/grc-install-grc.png" alt="GRC Install GRC">
</p>

### GRC: Start GitHub Repository Here

Use this command to create a remote GitHub repository and then connect your current workspace to it. The extension will list your GRC templates and ask you to choose a template, as well as the repository name and the repository description.

<p align="center">
    <img src="assets/readme-images/grc-start-repository.png" alt="Grc Start Repository">
</p>

## Requirements

In order to use GRC extension, you need to have GRC installed in your machine. You can download it by using the [install-grc](#grc-install-grc) command or by following the [installation guide](https://github.com/ArthurSudbrackIbarra/GitHub-Repo-Creator#installation-windows) of the official GRC repository.

## Known Issues

None yet.

## Release Notes

GRC release notes:

### 0.0.1

Added Add Collaborator, Authenticate, Install GRC and Start Repository commands.
