import { Command } from "commander";
import { ask, info, readCredentialsFile, success, ups } from "../utils";
import Config from "../config";
const passwordPrompt = require('password-prompt');


const addUserAction = async () => {

    const token = await readCredentialsFile();

    if (!token) {
        ups("Must logged first.");
        return;
    }

    info("Please, use institucional emails");
    const email = await ask("Type the email to register: ");
    const password = await passwordPrompt("Type the password: ");

    try {
        const response = await fetch(`${Config.get('API_URL')}/users/create`, {
            method: 'POST',
            headers: {
                'Authorization': "Bearer " + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const responseJson = await response.json();

        if (!response.ok) throw responseJson.error;

        success("User added!");

    } catch(e) {
        ups(e);
    }

}

const deleteUserAction = async (email: string) => {

    const token = await readCredentialsFile();

    if (!token) {
        ups("Must be logged.");
        return;
    }

    info("Sure to continue?");
    const confirm = await ask("Type 'YES': ");

    if (confirm.toLowerCase() !== 'yes') {
        ups("It's ok, return when your ready :)");
        return;
    }

    try {
        const response = await fetch(`${Config.get('API_URL')}/users/${email}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token 
            }
        });

        const responseJson = await response.json();

        if (!response.ok) throw responseJson.error;

        success("User deleted.");
            
    } catch (e) {
        ups(e)
    }
}

export const injectUsersCommand = (program: Command) => {

    program
        .command('add')
        .description('Register a user for access to this CLI')
        .action(addUserAction);
    
    program
        .command('delete')
        .description('Delete a user to deny the access to this CLI')
        .argument('<email>', 'Email to deny the access')
        .action(deleteUserAction);

}
