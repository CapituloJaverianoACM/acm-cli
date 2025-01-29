import { info, readCredentialsFile, success, ups } from "../utils";
import Config from "../config";
import { input, password, select } from "@inquirer/prompts";

const addUserAction = async () => {

    const token = await readCredentialsFile();

    if (!token) {
        ups("Must logged first.");
        return;
    }

    info("Please, use institucional emails");
    const email = await input({message: "Type the email to register: "});
    const _password = await password({message: "Type the password: ", mask: true});

    try {
        const response = await fetch(`${Config.get('API_URL')}/users/create`, {
            method: 'POST',
            headers: {
                'Authorization': "Bearer " + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password: _password })
        });

        const responseJson : any = await response.json();

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
    const confirm = await input({message: "Type 'YES': "});

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

        const responseJson : any = await response.json();

        if (!response.ok) throw responseJson.error;

        success("User deleted.");
            
    } catch (e) {
        ups(e)
    }
}

export const injectUsers = async () => {
    const answer = await select({
        message: 'Select an option',
        choices: [
            {
                name: 'add',
                value: 'add',
                description: 'Register a user for access to this CLI',
            },
            {
                name: 'delete',
                value: 'delete',
                description: 'Delete a user to deny the access to this CLI',
            },
        ],
    });

    switch (answer) {
        case 'add':
            await addUserAction();
            break;
        case 'delete':
            const email = await input({ message: 'Type the email to deny the access:' });
            await deleteUserAction(email);
            break;
    }
}
