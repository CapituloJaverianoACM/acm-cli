import { input, select } from "@inquirer/prompts";

import Config from "../config";
import chalk from "chalk";
import {
    success,
    ups,
    validateSession
} from "../utils";
import Schemas from "../schemas/schemas";

export const injectResult = async () => {

    const token = await validateSession();
    if (!token) {
        return;
    }

    const contestID = await input({ message: chalk.blue(`Enter contest ID: `) });

    try {
        const responseContest = await fetch(
            new URL(
                Config.get("API_URL") + `/participation/contest/${contestID}`
            ).toString(),
            {
                method: "GET",
            },
        );

        if (!responseContest.ok) throw responseContest.statusText;
        const responseContestJson: any = await responseContest.json();

        const studentIds = responseContestJson.data.map(item => item.student_id);

        const responseParticipants = await fetch(
            new URL(`/students/bulk-query/id`, Config.get("API_URL")).toString(),
            {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ids: studentIds,
                }),
            },
        );
        if (!responseParticipants.ok) throw responseParticipants.statusText;
        const responseParticipantsJson: any = await responseParticipants.json();

        const participants = responseParticipantsJson.data;
        if (participants.length < 2) {
            throw new Error("Not enough participants found in the contest.");
        }

        console.log(chalk.green("List of participants:"));
        participants.forEach((student: any) => {
            console.log(`ID: ${student.id}, Name: ${student.name} ${student.surname}`);
        });

        const firstParticipantID = parseInt(await input({ message: chalk.blue("Input first participant ID: ") }), 10);

        if (!studentIds.includes(firstParticipantID)) {
            throw new Error(`Participant ID ${firstParticipantID} not found in contest participants.`);
        }

        const secondParticipantID = parseInt(await input({ message: chalk.blue("Input second participant ID: ") }), 10);

        if (!studentIds.includes(secondParticipantID) || firstParticipantID === secondParticipantID) {
            throw new Error(`Participant ID ${secondParticipantID} not found in contest participants or is the same as the first participant.`);
        }

        var firstParticipant = participants.find((student: any) => student.id === firstParticipantID);
        var secondParticipant = participants.find((student: any) => student.id === secondParticipantID);

        const winnerID = await select({
            message: chalk.blue("Select the winner: "),
            choices: [
                {
                    name: `Participant ${firstParticipant.name}`,
                    value: firstParticipantID,
                },
                {
                    name: `Participant ${secondParticipant.name}`,
                    value: secondParticipantID,
                },
            ],
        });

        const result = {
            local_id: firstParticipantID,
            visitant_id: secondParticipantID,
            winner_id: winnerID,
            contest_id: parseInt(contestID, 10),
        };
        const parsedResult = Schemas.results.safeParse(result);

        if (parsedResult.error) {
            throw new Error(parsedResult.error.message)
        }

        const responseCreateResult = await fetch(
            new URL(`/results/create`,
                Config.get("API_URL")
            ).toString(),
            {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(parsedResult.data),
            },
        );
        if (!responseCreateResult.ok) throw await responseCreateResult.text();

        success("Registrado el resultado")
    } catch (e) {
        ups(e);
    }
}