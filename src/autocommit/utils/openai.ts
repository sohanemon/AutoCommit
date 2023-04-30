/*
 * This code includes portions of code from the opencommit project, which is
 * licensed under the MIT License. Copyright (c) Dima Sukharev.
 * The original code can be found at https://github.com/di-sukharev/opencommit/blob/master/src/api.ts.
 */

import { Configuration, OpenAIApi } from 'openai';

import { generateCommitMessageChatCompletionPrompt } from './completion';
import { trimNewLines } from './text';

export const generateCommitMessage = async (
  apiKey: string,
  diff: string,
  delimeter?: string
) => {
  const messages = generateCommitMessageChatCompletionPrompt(diff);

  const openAI = new OpenAIApi(
    new Configuration({
      apiKey: apiKey,
    })
  );

  // async function createChatCompletion(diff: string): Promise<string> {
  //   const prompt = `Generate a commit message from the following diff:\n\n${diff}\n\nCommit message:`;
  //   const response = await openAI.Completion.create({
  //     engine: 'text-davinci-002',
  //     prompt,
  //     temperature: 0.5,
  //     max_tokens: 60,
  //     top_p: 0.9,
  //     frequency_penalty: 0,
  //     presence_penalty: 0,
  //   });

  //   // Parse response and extract generated commit message
  //   const message = _.trim(response.choices[0].text);
  //   const cleanedMessage = message.replace(/[^\x00-\x7F]+/g, ''); // Remove non-ASCII characters

  //   return cleanedMessage;
  // }

  const { data } = await openAI.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: messages,
    temperature: 0,
    ['top_p']: 0.9,
    ['max_tokens']: 60,
    ['frequency_penalty']: 0,
    ['presence_penalty']: 0,
  });

  const message = data?.choices[0].message;
  const commitMessage = message?.content.replace(/[^\x00-\x7F]+/g, '');

  if (commitMessage) {
    const alignedCommitMessage = trimNewLines(commitMessage, delimeter);
    return alignedCommitMessage;
  }

  return;
};
