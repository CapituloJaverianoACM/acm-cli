#!/usr/bin/env node

import { program }  from 'commander';
import Schemas from './schemas/schemas';
import readline from 'readline';
const passwordPrompt = require('password-prompt');

const API_URL = "http://localhost:3000";

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

const ups = (msg: any) => {
    console.log("\nUps, Something went bad");
    console.log(msg);
}

const CREDENTIALS_PATH = './credentials.acm';

program
    .command('auth')
    .description('Authenticate to the ACM Xaverian Chapter API')
    .requiredOption('-e, --email <email>', 'College email for auth')
    .action(async ({ email }) => {
        console.log("Trying to login with " + email + "...");
        const password = await passwordPrompt('Type yout password: ');

        let token = "";
        try {
            const response = await fetch(API_URL + "/auth/login", {
                headers: {
                    "Authorization": "Basic " + Buffer.from(`${email}:${password}`, 'binary').toString('base64')
                }
            });

            const responseJSON = await response.json();

            if (!response.ok) throw responseJSON.error;

            
            token = responseJSON.data.token;
        } catch (e) {
            ups(e);
            return;
        }

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

        try {
        } catch (e) {
        }
    });

program.parse();
