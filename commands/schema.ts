import { Command } from "commander";
import {
    readCredentialsFile,
    success,
    ups,
    verifyJWTExpiration,
} from "../utils";
import Schemas from "../schemas/schemas";
import Config from "../config";
import { input, password, select } from "@inquirer/prompts";
import chalk from "chalk";
import { promises as fs } from "fs";

const checkSchemaExist = (schema: string) => Schemas[schema] !== undefined;


const addSchemaAction = async (schema: string) => {
    const token = await readCredentialsFile();
    if (!token) {
        ups("Log in first by selecting the auth option");
        return;
    }

    if (!(await verifyJWTExpiration())) {
        ups("Your token expired! Auth again.");
        return;
    }

    if (!checkSchemaExist(schema)) {
        ups("That schema does not exist");
        return;
    }

    const obj = {};
    const schemaShape = Schemas[schema].shape;
    for (const field of Schemas[schema].keyof()._def.values) {
        const description = schemaShape[field]?._def?.description;
        if (description) {
            console.log(
                chalk.red.italic(description)
            );
        }
        obj[field] = await input({ message: chalk.blue(`${field}:`) });
    }

    const parsedData = Schemas[schema].safeParse(obj);
    if (!parsedData.success) {
        ups(parsedData.error.errors);
        return;
    }

    const data = parsedData.data;

    try {
        const response = await fetch(
            Config.get("API_URL") + "/" + schema + "/create",
            {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            },
        );

        if (!response.ok) throw "Database broken (?)";

        success(`${schema} added!`);
    } catch (e) {
        ups(e);
    }
};

const bulkInsertSchemaAction = async (schema: string, filePath: string) => {
    const token = await readCredentialsFile();
    if (!token) {
        ups("Log in first by selecting the auth option");
        return;
    }

    if (!(await verifyJWTExpiration())) {
        ups("Your token expired! Auth again.");
        return;
    }

    if (!checkSchemaExist(schema)) {
        ups("That schema does not exist");
        return;
    }

    try {
        const content = await fs.readFile(filePath, "utf-8");
        const data = JSON.parse(content);

        if (!Array.isArray(data)) {
            ups("The JSON file must contain an array of records.");
            return;
        }

        const validated = data.map(item => Schemas[schema].safeParse(item));
        const invalids = validated.filter(v => !v.success);

        if (invalids.length > 0) {
            ups(`Found ${invalids.length} invalid records. Fix them before retrying.`);
            console.error(invalids.map(v => v.success ? null : v.error?.errors));
            return;
        }

        const parsedData = validated.map(v => (v as any).data);

        const response = await fetch(`${Config.get("API_URL")}/${schema}/createMany`, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(parsedData),
        });

        if (!response.ok) throw await response.text();
        success(`Bulk insert of ${schema} records successful! (Note: Only new records were inserted; existing ones were skipped)`);

    } catch (e) {
        ups("Error during bulk insert:");
        console.error(e);
    }
};

export const deleteSchemaAction = async (schema: string) => {
    if (!checkSchemaExist(schema)) {
        ups("That Schema do not exist.");
        return;
    }

    const token = await readCredentialsFile();
    if (!token) {
        ups("Must be logged!");
        return;
    }

    const id = await password({
        message: "Type the ID of the register:",
        mask: true,
    });

    try {
        const response = await fetch(`${Config.get("API_URL")}/${schema}/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + token,
            },
        });
        if (!response.ok) throw response.statusText;
        const responseJson: any = await response.json();
        if (responseJson.data.error) throw responseJson.data.error;

    } catch (e) {
        ups(e);
        return;
    }

    success(`${schema} deleted successfully`);
};

export const injectSchemaCommand = (program: Command) => {
    program
        .command("add")
        .description("Add a new schema into the database, You must be logged in.")
        .argument("<name>", "Schema to create")
        .action(addSchemaAction);
    program
        .command("bulk")
        .description("Insert multiple records into the database from a JSON file. You must be logged in.")
        .argument("<schema>", "Schema name")
        .argument("<file>", "Path to JSON file")
        .action(bulkInsertSchemaAction);
    program
        .command("delete")
        .argument("<name>", "Schema name according to the register to delete.")
        .description("Delete one schema or register from the website")
        .action(deleteSchemaAction);
};

export const injectSchema = async () => {
    const answer = await select({
        message: "Select an option",
        choices: [
            {
                name: "add",
                value: "add",
                description:
                    "Add a new schema into the database, You must be logged in.",
            },
            {
                name: "bulk",
                value: "bulk",
                description: "Insert multiple records into the database from a JSON file. You must be logged in.",
            },
            {
                name: "delete",
                value: "delete",
                description: "Delete one schema or register from the website",
            },
        ],
    });

    switch (answer) {
        case "add":
            const name = await select<string>({
                message: "Select a schema",
                choices: Object.keys(Schemas).map((schemaName) => {
                    return {
                        name: schemaName,
                        value: schemaName,
                    };
                }),
            });
            await addSchemaAction(name);
            break;
        case "bulk":
            const bulkSchema = await select<string>({
                message: "Select a schema",
                choices: Object.keys(Schemas).map((schemaName) => ({
                    name: schemaName,
                    value: schemaName,
                })),
            });

            let defaultPath = `./data/${bulkSchema}.json`;

            const filePath = await input({
                message: "Enter the path to the JSON file:",
                default: defaultPath,
            });
            await bulkInsertSchemaAction(bulkSchema, filePath);
            break;
        case "delete":
            const schema = await select<string>({
                message: "Select the schema name for elements deletion.",
                choices: Object.keys(Schemas).map((schemaName) => {
                    return {
                        name: schemaName,
                        value: schemaName,
                    };
                }),
            });
            await deleteSchemaAction(schema);
            break;
    }
};
