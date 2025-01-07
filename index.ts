#!/usr/bin/env node

import { program }  from 'commander';
import Schemas from './schemas/schemas';
import readline from 'readline';

const ask = async (prompt : string, def : string = "") => {
    return new Promise( resolve => {
        let cin = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        cin.question(prompt + `[${def}] `, input => {
            cin.close();
            resolve(input)
        });
    });
}

const CREDENTIALS_PATH = './credentials.acm';

program
    .command('auth')
    .description('Authenticate to the ACM Xaverian Chapter API')
    .requiredOption('-e, --email <email>', 'College email for auth')
    .action(async ({ email }) => {
        console.log("Trying to login with " + email + "...");
        let token = "";
        const file = Bun.file(CREDENTIALS_PATH);
        await Bun.write(file, token);
        console.log("Token writed into ./credentials.acm");
    });

program
    .command('add')
    .argument('<schema>', 'Schema to create')
    .action( async (schema) => {
        const credentialsFile = Bun.file(CREDENTIALS_PATH);
        if (!(await credentialsFile.exists())) {
            console.log("Login first with acm-cli auth --email <email>");
            return;
        }

        if (Schemas[schema] === undefined) {
            console.log("That schema does not exist");
            return;
        }

        const obj = {};

        for (const field of Schemas[schema].keyof()._def.values) {
            obj[field] = await ask(`${field}? `);
        }
        
        const parsedData = Schemas[schema].safeParse(obj);
        if (!parsedData.success) {
            console.log("Something went wrong during the parsing");
            console.log(parsedData.error.errors);
            return
        }

        const data = parsedData.data;
        const token = await credentialsFile.text();

        // make the POST request
    });
program.parse();
