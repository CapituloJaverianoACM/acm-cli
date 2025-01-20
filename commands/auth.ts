import { Command } from "commander";
import { API_URL, CREDENTIALS_PATH } from "../config";
import { info, success, ups } from "../utils";
const passwordPrompt = require('password-prompt');

const loginAction = async ({ email } : { email : string }) => {
    info("Trying to login with " + email + "...");
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
    success("Token writed into ./credentials.acm");
}

export const injectAuthCommand = (program: Command) : void => {

    program
        .command('login')
        .description('Authenticate to the ACM Xaverian Chapter API')
        .requiredOption('-e, --email <email>', 'College email for auth')
        .action(loginAction);
}
