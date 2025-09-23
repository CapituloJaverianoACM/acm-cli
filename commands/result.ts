import { input, password, select } from "@inquirer/prompts";

import Config from "../config";
import chalk from "chalk";
import {
    readCredentialsFile,
    success,
    ups,
    verifyJWTExpiration,
} from "../utils";
import Schemas from "../schemas/schemas";

async function validateSession(): Promise<string | null> {
    const token = await readCredentialsFile();
    if (!token) {
        ups("Log in first by selecting the auth option");
        return null;
    }
    if (!(await verifyJWTExpiration())) {
        ups("Your token expired! Auth again.");
        return null;
    }
    return token;
}

export const injectResult = async () => {

    const token = await validateSession();
    if (!token) {
        return;
    }

    //Se pide el ID del contest
    const contestID = await input({ message: chalk.blue(`Enter match ID: `) });

    // console.log(`Contest ID is: ${contestID}`)

    try {
        /**
         * Se piden todos los registros de la tabla "participation" asociadas
         * al contestID. 
         */
        const response = await fetch(
            new URL(
                Config.get("API_URL") + `/participation?contest_id=${contestID}`
            ).toString(),
            {
                method: "GET",
            },
        );
        /**
         * Si se rompe (que no deberia) tira un error
         */
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }

        //Aca establecemos el formato del response con un esquema creado
        const respuesta = await response.json();
        const responseData = Schemas.participationArray.parse(respuesta);

        //Extraemos unicamente los student_id
        const studentIds = responseData.data.map(item => item.student_id)
        console.log(studentIds)

        //Pedimos el primer ID
        const firstParticipantID = parseInt(await input({ message: chalk.blue("Input first participant ID: ") }), 10);

        //Revisamos si esta en la lista anterior, si no lo está tira un error
        if (!studentIds.includes(firstParticipantID)) {
            throw new Error(`Participant ID ${firstParticipantID} not found in contest participants.`);
        }

        //Pedimos el segundo ID
        const secondParticipantID = parseInt(await input({ message: chalk.blue("Input second participant ID: ") }), 10);

        //Revisamos si esta en la lista anterior, si no lo está tira un error
        if (!studentIds.includes(secondParticipantID) || firstParticipantID === secondParticipantID) {
            throw new Error(`Participant ID ${secondParticipantID} not found in contest participants or is the same as the first participant.`);
        }

        //Se consulta en la API y se traen todos los datos de ambos participantes
        const completeFirstParticipant = await fetch(
            new URL(
                Config.get("API_URL") + `/students/${firstParticipantID}`
            ).toString(),
            {
                method: "GET",
            },
        );
        if (!completeFirstParticipant.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        //Aca establecemos el formato del response
        const responseFirstParticipant = Schemas.studentObject.parse(await completeFirstParticipant.json())

        const completeSecondParticipant = await fetch(
            new URL(
                Config.get("API_URL") + `/students/${secondParticipantID}`
            ).toString(),
            {
                method: "GET",
            },
        );
        if (!completeSecondParticipant.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const responseSecondParticipant = Schemas.studentObject.parse(await completeSecondParticipant.json())

        //Elegir la respuesta con las flechas
        const answer = await select({
            message: chalk.blue("Select the winner: "),
            choices: [
                {
                    name: `Participant ${responseFirstParticipant.data[0].name}`,
                    value: firstParticipantID,
                },
                {
                    name: `Participant ${responseSecondParticipant.data[0].name}`,
                    value: secondParticipantID,
                },
            ],
        });
        //Variable para poner el ID del ganador
        var winnerID;

        //Actualizar el contador de partidas de cada uno de los participantes
        responseFirstParticipant.data[0].matches_count = (responseFirstParticipant.data[0].matches_count ?? 0) + 1;
        responseSecondParticipant.data[0].matches_count = (responseSecondParticipant.data[0].matches_count ?? 0) + 1;
        switch (answer) {
            case firstParticipantID:
                winnerID = firstParticipantID;
                responseFirstParticipant.data[0].victory_count = (responseFirstParticipant.data[0].victory_count ?? 0) + 1;
                break;
            case secondParticipantID:
                winnerID = secondParticipantID;
                responseSecondParticipant.data[0].victory_count = (responseSecondParticipant.data[0].victory_count ?? 0) + 1;
                break;
            default:
                throw new Error("Invalid selection");
        }

        //Crear el objeto para los resultados
        const resultsData = {
            local_id: firstParticipantID,
            visitant_id: secondParticipantID,
            winner_id: winnerID,
            contest_id: contestID
        }

        //Crear las variables que solo tengan los datos que nos interesan
        const updatedFirstParticipant = responseFirstParticipant.data[0];
        const updatedSecondParticipant = responseSecondParticipant.data[0];

        //Actualizar el registro del estudiante
        //Sospecho que será por algun tema de permisos pero realmente no sabria
        try {
            await fetch(
                new URL(`${Config.get("API_URL")}/students/${firstParticipantID}`).toString(),
                {
                    method: "PUT",
                    headers: {
                        Authorization: "Bearer " + token,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedFirstParticipant),
                }
            );
        } catch (e) {
            ups(e);
        }

        try {
            await fetch(
                new URL(`${Config.get("API_URL")}/students/${secondParticipantID}`).toString(),
                {
                    method: "PUT",
                    headers: {
                        Authorization: "Bearer " + token,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedSecondParticipant),
                }
            );
        } catch (e) {
            ups(e);
        }
        /**
         * Este es el que no me está dejando crear
         */
        const validate = Schemas.results.safeParse(resultsData);
        try {
            const send = await fetch(
                new URL(
                    Config.get("API_URL") + `/results/create`,

                ).toString(),
                {
                    method: "POST",
                    headers: {
                        Authorization: "Bearer " + token,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(validate.data),
                },
            );

        }
        catch (e) {
            ups(e);
        }
    } catch (e) {
        ups(e);
    }
    console.log("Registrado el resultado")
}