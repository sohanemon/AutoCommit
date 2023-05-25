import * as vscode from 'vscode';

import generateAICommitMessage from './autocommit';

async function getGitApi() {
  const gitEntension = vscode.extensions.getExtension('vscode.git');

  if (!gitEntension) {
    return;
  }

  if (!gitEntension.isActive) {
    await gitEntension.activate();
  }

  const gitApi = gitEntension.exports?.getAPI(1);

  return gitApi;
}

function getOpenAiApiKey() {
  const configuration = vscode.workspace.getConfiguration('autocommit');
  const apiKey = configuration.get<string>('openAI.apiKey');
  return apiKey;
}

async function setOpenAiApiKey(apiKey: string) {
  const configuration = vscode.workspace.getConfiguration('autocommit');
  await configuration.update(
    'openAI.apiKey',
    apiKey,
    vscode.ConfigurationTarget.Global
  );
}

function getOpenAiApiUrl() {
  const configuration = vscode.workspace.getConfiguration('autocommit');
  const apiUrl = configuration.get<string>('openAI.apiUrl');
  return apiUrl;
}

async function setOpenAiApiUrl(apiUrl: string) {
  const configuration = vscode.workspace.getConfiguration('autocommit');
  await configuration.update(
    'openAI.apiUrl',
    apiUrl,
    vscode.ConfigurationTarget.Global
  );
}

function getDelimeter() {
  const configuration = vscode.workspace.getConfiguration('autocommit');
  const delimeter = configuration.get<string>('appearance.delimeter');
  if (delimeter?.trim() === '') {
    return;
  }
  return delimeter;
}

async function setRepositoryCommitMessage(commitMessage: string) {
  const gitApi = await getGitApi();
  const respository = gitApi?.repositories[0];

  if (!respository) {
    return;
  }

  respository.inputBox.value = commitMessage;
}

async function generateAICommitCommand() {
  let apiKey = getOpenAiApiKey();

  if (!apiKey) {
    apiKey = await vscode.window.showInputBox({
      title: 'Please enter your OpenAi API Key',
    });

    if (!apiKey || apiKey.trim() === '') {
      vscode.window.showErrorMessage(
        'You should set OpenAi API Key before extension using!'
      );
      return;
    }

    await setOpenAiApiKey(apiKey);
  }
  let apiUrl = getOpenAiApiUrl();

  if (!apiUrl || !apiUrl.startsWith('https://')) {
    apiUrl = await vscode.window.showInputBox({
      title: 'Please enter your OpenAi Url starting with https://',
    });

    if (!apiUrl || apiUrl.trim() === '') {
      vscode.window.showErrorMessage(
        'You should set OpenAi API Url before extension using!'
      );
      return;
    }

    await setOpenAiApiUrl(apiUrl);
  }

  const delimeter = getDelimeter();
  const commitMessage = await generateAICommitMessage(apiKey, apiUrl, delimeter);

  if (!commitMessage) {
    return;
  }

  await setRepositoryCommitMessage(commitMessage);
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'autocommit.generateAICommit',
    generateAICommitCommand
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}
