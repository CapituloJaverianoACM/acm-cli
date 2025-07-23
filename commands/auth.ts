import { Command } from "commander";
import Config from "../config";
import { info, success, ups } from "../utils";
import { input, password, select } from '@inquirer/prompts';

const loginAction = async ({ email } : { email : string }) => {
    info("Trying to login with " + email + "...");
    const _password = await password({message: "Type your password:", mask: true});

    let token = "";
    try {
        const response = await fetch(new URL(
            "/auth/login", 
            Config.get('API_URL')
        ).toString(), {
            headers: {
                "Authorization": "Basic " + Buffer.from(`${email}:${_password}`, 'binary').toString('base64')
            }
        });

        const responseJSON : any = await response.json();

        if (!response.ok) throw responseJSON.error;

        
        token = responseJSON.data.token;
    } catch (e) {
        ups(e);
        return;
    }

    Config.set('jwt', token);
    success("Token saved.");
}

export const injectAuthCommand = (program: Command) : void => {
    program
        .command('login')
        .description('Authenticate to the ACM Xaverian Chapter API')
        .requiredOption('-e, --email <email>', 'College email for auth')
        .action(loginAction);
}

export const injectAuth = async () => {
    const answer = await select({
        message: 'Select an option',
        choices: [
            {
                name: 'login',
                value: 'login',
                description: 'Authenticate to the ACM Xaverian Chapter API',
            },
        ],
    });

    switch (answer) {
        case 'login':
            const email = await input({ message: 'Type your college email:' });
            await loginAction({ email });
            break;
    }
}
