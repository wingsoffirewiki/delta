/** @format */

import { Message, PartialMessage } from "discord.js";
import bannedWords from "../config/bannedWords.json";

const bannedWordsArray = Object.keys(bannedWords);

const exceptionWords = ["jap", "coon", "ree", "psycho"];

const whitelist = ["japanese", "japan", "raccoon", "tycoon", "cocoon"];

export function getBannedWord(
  message: Message | PartialMessage
): keyof typeof bannedWords | undefined {
  if (!message.content) return;

  const newContent = message.content.toLowerCase().replace(/[^a-zA-Z]+/g, " ");

  const bwOriginal = bannedWordsArray.find(bw =>
    message.content?.toLowerCase().includes(bw)
  ) as keyof typeof bannedWords;

  if (bwOriginal) {
    if (exceptionWords.includes(bwOriginal)) {
      // Get all the words of the content
      const word = newContent
        .split(" ")
        .find(w => w.includes(bwOriginal)) as string;

      if (bwOriginal === "ree" && word !== bwOriginal) {
        // If there are trailing Es, fail it, otherwise don't because it's likely a word that isn't offensive
        if (word.charAt(word.indexOf(bwOriginal) + 3) === "e")
          return bwOriginal;

        return;
        // Psycho and psychopath are really the only words containing "psycho" that are offensive
      } else if (bwOriginal === "psycho" && word !== bwOriginal) return;
      else {
        // Whitelist some words
        if (whitelist.includes(word)) return;

        return bwOriginal;
      }
    } else return bwOriginal;
  } else return;
}
