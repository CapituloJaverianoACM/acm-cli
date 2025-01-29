import { readCredentialsFile, success, ups, verifyJWTExpiration } from "../utils";
import Schemas from '../schemas/schemas';
import Config from "../config";
import { input, password, select } from "@inquirer/prompts";

const checkSchemaExist = (schema: string) => (Schemas[schema] !== undefined);

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

    for (const field of Schemas[schema].keyof()._def.values) {
        obj[field] = await input({message: `Type the ${field}:`});
    }
    
    const parsedData = Schemas[schema].safeParse(obj);
    if (!parsedData.success) {
        ups(parsedData.error.errors);
        return
    }

    const data = parsedData.data;

    try {
        const response = await fetch(Config.get('API_URL') + "/" + schema + "/create", {
            method: 'POST',
            headers: {
                'Authorization': "Bearer " + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw "Database broken (?)";

        success(`${schema} added!`);
    } catch (e) {
        ups(e);
    }

}

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

    const id = await password({message: "Type the ID of the register:", mask: true});

    try {

        const response = await fetch(`${Config.get('API_URL')}/${schema}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': "Bearer " + token
            }
        });
        const responseJson : any = await response.json();

        if (!response.ok) throw responseJson.error;
    } catch (e) {
        ups(e);
        return;
    }

    success(`${schema} deleted successfully`);
}

export const injectSchema = async () => {
    const answer = await select({
        message: 'Select an option',
        choices: [
            {
                name: 'add',
                value: 'add',
                description: 'Add a new schema into the database, You must be logged in.',
            },
            {
                name: 'delete',
                value: 'delete',
                description: 'Delete one schema or register from the website',
            },
        ],
    });

    switch (answer) {
        case 'add':
            const name = await input({ message: 'Type the schema name:' });
            await addSchemaAction(name);
            break;
        case 'delete':
            const schema = await input({ message: 'Type the schema name to delete:' });
            await deleteSchemaAction(schema);
            break;
    }
}
