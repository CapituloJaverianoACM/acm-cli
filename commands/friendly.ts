import { select, Separator } from "@inquirer/prompts";
import { injectAuth } from "./auth";
import { injectSchema } from "./schema";
import { injectUsers } from "./users";


export const injectFriendly = async () => {

    const answer = await select({
        message: 'Select an option',
        choices: [
            {
                name: 'auth',
                value: 'auth',
                description: 'Commands for manage auth',
            },
            {
                name: 'schema',
                value: 'schema',
                description: 'Commands for manage schemas/data',
            },
            new Separator(),
            {
                name: 'users',
                value: 'users',
                description: '[SUPER USER ONLY] Commands for manage allowed users to use this CLI',
            },
        ],
    });

    switch (answer) {
        case 'auth':
            injectAuth();
            break;
        case 'schema':
            injectSchema();
            break;
        case 'users':
            injectUsers();
            break;
        default:
            break;
    }
}