import { Command } from "commander";
import { ask, info, readCredentialsFile, success, ups, verifyJWTExpiration } from "../utils";
import Schemas from '../schemas/schemas';
import { API_URL } from "../config";
const passwordPrompt = require('password-prompt');


const checkSchemaExist = (schema: string) => (Schemas[schema] !== undefined);

const addSchemaAction = async (schema: string) => {
    const token = await readCredentialsFile();
    if (!token) {
        ups("Login first with acm-cli auth --email <email>");
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
        obj[field] = await ask(`${field}? `);
    }
    
    const parsedData = Schemas[schema].safeParse(obj);
    if (!parsedData.success) {
        ups(parsedData.error.errors);
        return
    }

    const data = parsedData.data;

    try {
        const response = await fetch(API_URL + "/" + schema + "/create", {
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

    const id = await passwordPrompt("Type the ID of the register: ");

    try {

        const response = await fetch(`${API_URL}/${schema}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': "Bearer " + token
            }
        });
        const responseJson = await response.json();

        if (!response.ok) throw responseJson.error;
    } catch (e) {
        ups(e);
        return;
    }

    success(`${schema} deleted successfully`);
}

export const injectSchemaCommand = (program: Command) => {
    program
        .command('add')
        .description('Add a new schema into the database, You must be logged in.')
        .argument('<name>', 'Schema to create')
        .action(addSchemaAction);

    program
        .command('delete')
        .argument('<name>', 'Schema name according to the register to delete.')
        .description('Delete one schema or register from the website')
        .action(deleteSchemaAction);

}
