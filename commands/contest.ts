import { input, select } from "@inquirer/prompts";

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
    // Obtener los datos actuales del contest
    const responseGet = await fetch(
      new URL(
        Config.get("API_URL") + `/contests/${contestID}`
      ).toString(),
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      },
    );

    if (!responseGet.ok) throw await responseGet.text();

    const responseGetJson: any = await responseGet.json();
    if (responseGetJson.error) throw responseGetJson.error;

    const contestData = Array.isArray(responseGetJson.data)
      ? responseGetJson.data[0]
      : responseGetJson.data;

    if (!contestData) {
      throw new Error(`Contest with ID ${contestID} not found.`);
    }

    // Mostrar información del contest
    console.log(chalk.green("\nContest information:"));
    console.log(`ID: ${contestData.id || contestData._id}`);
    console.log(`Name: ${contestData.name || "Not set"}`);
    console.log(`Date: ${contestData.date || "Not set"}`);
    console.log(`Start hour: ${contestData.start_hour || "Not set"}`);
    console.log(`Final hour: ${contestData.final_hour || "Not set"}`);
    console.log(`Level: ${contestData.level || "Not set"}\n`);

    // Preguntar qué acción quiere realizar
    const action = await select({
      message: chalk.blue("Select an action: "),
      choices: [
        {
          name: "Start contest (create matchmaking tree)",
          value: "start",
        },
        {
          name: "Finish contest (update final_hour)",
          value: "finish",
        },
      ],
    });

    if (action === "start") {
      // Iniciar el contest creando el árbol de matchmaking
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
    } else if (action === "finish") {
      // Finalizar el contest actualizando el final_hour
      const now = new Date();
      // Formato ISO 8601: yyyy-mm-ddThh:mm:ssZ (sin milisegundos)
      const finalHour = now.toISOString().slice(0, 19) + "Z";

      const updatedData = {
        final_hour: finalHour,
      };

      const responseUpdate = await fetch(
        new URL(
          Config.get("API_URL") + `/contests/${contestID}`
        ).toString(),
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        },
      );

      if (!responseUpdate.ok) throw await responseUpdate.text();

      const responseUpdateJson: any = await responseUpdate.json();
      if (responseUpdateJson.error) throw responseUpdateJson.error;

      success(`Contest ${contestID} finished successfully! Final hour set to ${finalHour}`);
    }
  } catch (e) {
    ups(e);
  }
}
