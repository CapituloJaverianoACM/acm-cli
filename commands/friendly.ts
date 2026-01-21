import { select, Separator } from "@inquirer/prompts";
import { injectAuth } from "./auth";
import { injectSchema } from "./schema";
import { injectUsers } from "./users";
import { injectResult } from "./result";
import { injectStudent } from "./student";

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
            {
                name: 'result',
                value: 'result',
                description: 'Register a match result'
            },
            {
                name: 'student',
                value: 'student',
                description: 'Update student information (Codeforces handle or role)'
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
        case 'result':
            injectResult();
        case 'student':
            injectStudent();
        default:
            break;
    }
}