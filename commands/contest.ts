import { input } from "@inquirer/prompts";

import Config from "../config";
import chalk from "chalk";
import {
  success,
  ups,
  validateSession
} from "../utils";

export const injectContest = async () => {
  const token = await validateSession();
  if (!token) {
    return;
  }

  const contestID = await input({
    message: chalk.blue("Enter contest ID: ")
  });

  try {
    const response = await fetch(
      new URL(
        Config.get("API_URL") + `/matchmaking/create`
      ).toString(),
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contest_id: parseInt(contestID, 10),
        }),
      },
    );

    if (!response.ok) throw await response.text();

    const responseJson: any = await response.json();
    if (responseJson.error) throw responseJson.error;

    success(`Matchmaking tree created successfully for contest ${contestID}!`);
  } catch (e) {
    ups(e);
  }
}
