

import { ExcludeEnum } from "discord.js";
import { ActivityTypes } from "discord.js/typings/enums";
import { Client } from "fero-dc";
import axios from "axios";
import { RandomFact } from "../interfaces/RandomFact";

const minutes = 1,
  YouTubers = [
    "Blackout the NightWing",
    "Scholastic",
    "Ferotiq",
    "ThatOneGuy",
    "Halbery"
  ],
  apiURL = "https://uselessfacts.jsph.pl/today.json?language=en";

export async function setPresence(client: Client) {
  const fotd: RandomFact = (await axios.get(apiURL)).data;

  const activitiesArray = [
    {
      type: "PLAYING",
      text: "Trivia"
    },
    {
      type: "WATCHING",
      text: "for !help"
    },
    {
      type: "LISTENING",
      text: `${client.users.cache.size} members`
    },
    {
      type: "LISTENING",
      text: "WoF Audiobooks"
    },
    {
      type: "WATCHING",
      text: `${
        YouTubers[Math.floor(Math.random() * YouTubers.length)]
      } on YouTube`
    },
    {
      type: "PLAYING",
      text: "Gayming"
    },
    {
      type: "PLAYING",
      text: `FOTD: ${fotd.text.replace(/`/g, "'")}`
    },
    {
      type: "PLAYING",
      text: "Mega Gay"
    }
  ];

  setInterval(() => {
    const activity = activitiesArray[
      Math.floor(Math.random() * activitiesArray.length)
    ] as { type: ExcludeEnum<typeof ActivityTypes, "CUSTOM">; text: string };

    if (!client.user) {
      return;
    }

    client.user.setPresence({
      status: "online",
      activities: [
        {
          name: activity.text,
          type: activity.type,
          url: "https://wingsoffire.fandom.com"
        }
      ]
    });
  }, minutes * 60 * 1000);
}
