import { UselessFactsResponse } from "./types";
import apiUrls from "../config/api-urls.json" assert { type: "json" };

export async function getFactOfTheDay(): Promise<
  UselessFactsResponse | undefined
> {
  const response = await fetch(apiUrls.uselessFacts.daily);
  const factOfTheDay: UselessFactsResponse = await response.json();

  const factId = factOfTheDay.id;
  if (apiUrls.uselessFacts.bannedIds.includes(factId)) {
    return;
  }

  return factOfTheDay;
}

export async function getRandomFact(): Promise<
  UselessFactsResponse | undefined
> {
  const response = await fetch(apiUrls.uselessFacts.random);
  const randomFact: UselessFactsResponse = await response.json();

  const factId = randomFact.id;
  if (apiUrls.uselessFacts.bannedIds.includes(factId)) {
    return;
  }

  return randomFact;
}
