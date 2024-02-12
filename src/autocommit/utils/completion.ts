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
    content: `Imagine you're crafting a commit message for a change in a Git repository. Your task is to create clear and concise commit messages following the conventional commit convention. I'll provide you with the output of the 'git diff --staged' command, and your job is to translate it into a commit message. Avoid prefacing the commit with any additional text and stick to using the present tense. Don't include any descriptions in the commit message, only the message itself. Please respond in English.`,
  },
  {
    role: ChatCompletionRequestMessageRoleEnum.User,
    content: `diff --git a/src/server.ts b/src/server.ts
    index ad4db42..f3b18a9 100644
    --- a/src/server.ts
    +++ b/src/server.ts
    @@ -10,7 +10,7 @@ import {
      initWinstonLogger();

      const app = express();
    -const port = 7799;
    +const PORT = 7799;

      app.use(express.json());

    @@ -34,6 +34,6 @@ app.use((_, res, next) => {
      // ROUTES
      app.use(PROTECTED_ROUTER_URL, protectedRouter);

    -app.listen(port, () => {
    -  console.log(\`Server listening on port \${port}\`);
    +app.listen(process.env.PORT || PORT, () => {
    +  console.log(\`Server listening on port \${PORT}\`);
      });`,
  },
  {
    role: ChatCompletionRequestMessageRoleEnum.Assistant,
    content: `fix(server.ts): change port variable case from lowercase port to uppercase PORT
        feat(server.ts): add support for process.env.PORT environment variable`,
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
