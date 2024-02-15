/*
 * This code includes portions of code from the opencommit project, which is
 * licensed under the MIT License. Copyright (c) Dima Sukharev.
 * The original code can be found at https://github.com/di-sukharev/opencommit/blob/master/src/generateCommitMessageFromGitDiff.ts.
 */

import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from 'openai';

const initMessagesPrompt: Array<ChatCompletionRequestMessage> = [
  {
    role: ChatCompletionRequestMessageRoleEnum.System,
    content: `Compose a succinct and informal commit message following this format: "<type>(<scope>): <description>". The "type" represents the purpose of the commit and can be: 1. feat (a new feature or significant change), 2. fix (a bug fix), 3. docs (documentation changes), 4. style (code style changes), 5. refactor (code refactoring), 6. test (test modifications), 7. chore (routine tasks or maintenance). The "scope" (optional) indicates the project area affected. The "description" should be a brief, four-word maximum summary of the changes, written in present tense.

Based on the 'git diff --staged' output I give you, translate it into a commit message. Your response should strictly be the commit message in English. Avoid extraneous text and keep it easily comprehensible.`,
  },
  {
    role: ChatCompletionRequestMessageRoleEnum.User,
    content: `diff --git a/src/header.js b/src/header.js
index ad4db42..f3b18a9 100644
--- a/src/header.js
+++ b/src/header.js
@@ -10,7 +10,7 @@ import {
const app = express();
-const title = 'Old Title';
+const title = 'New Title';

diff --git a/src/signup.js b/src/signup.js
index ad4db42..f3b18a9 100644
--- a/src/signup.js
+++ b/src/signup.js
@@ -10,7 +10,7 @@ import {
-const signUp = 'Sign Up';
+const register = 'Register';
`,
  },
  {
    role: ChatCompletionRequestMessageRoleEnum.Assistant,
    content: `refactor(header.js): updated 'Old Title' to 'New Title'
    feat(signup.js): renamed 'Sign Up' to 'Register'`,
  },
];

export const generateCommitMessageChatCompletionPrompt = (
  diff: string
): Array<ChatCompletionRequestMessage> => {
  const chatContextAsCompletionRequest = [...initMessagesPrompt];

  chatContextAsCompletionRequest.push({
    role: ChatCompletionRequestMessageRoleEnum.User,
    content: `${diff}`,
  });

  return chatContextAsCompletionRequest;
};
