/*
 * This code includes portions of code from the aicommits project, which is
 * licensed under the MIT License. Copyright (c) Hassan El Mghari.
 * The original code can be found at https://github.com/Nutlope/aicommits/blob/develop/src/commands/aicommits.ts
 */

import * as vscode from 'vscode';

import { assertGitRepo, getStagedDiff, stageAllChanges } from './utils/git';
import { generateCommitMessage } from './utils/openai';
import { runTaskWithTimeout } from './utils/timer';

async function generateAICommitMessage(apiKey: string,apiUrl: string, delimeter?: string) {
  try {
    const assertResult = await assertGitRepo();

    if (!assertResult) {
      vscode.window.showErrorMessage(
        'The current directory must be a Git repository!'
      );
      return;
    }

    const staged = await getStagedDiff();

    if (!staged) {
      const result = await vscode.window.showQuickPick(['Yes', 'No'], {
        title: `Stage all changes now?`,
      });

      if (result !== 'Yes') {
        vscode.window.showErrorMessage('No staged changes found.');
        return;
      } else {
        await stageAllChanges();
        return;
      }
    }

    const commitMessage = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        cancellable: false,
        title: 'Generating AI Commit message',
      },
      async (progress) => {
        let increment = 0;

        runTaskWithTimeout(
          () => {
            progress.report({ increment: (increment += 1) });
          },
          5000,
          200
        );

        const commitMessage = await generateCommitMessage(
          apiKey,
          apiUrl,
          staged.diff,
          delimeter
        );

        return commitMessage;
      }
    );

    if (!commitMessage) {
      vscode.window.showErrorMessage(
        'No commit message were generated. Try again.'
      );
      return;
    }

    return commitMessage;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.error?.message;

    if (errorMessage) {
      vscode.window.showErrorMessage(errorMessage);
      return;
    }

    vscode.window.showErrorMessage('Something went wrong. Please try again.');
    return;
  }
}

export default generateAICommitMessage;
