#!/usr/bin/env node

import { injectAuth } from './commands/auth';
import { injectSchema } from './commands/schema';
import { injectUsers } from './commands/users';
import { colors } from './utils';
import { select, Separator } from '@inquirer/prompts';
const figlet = require('figlet');

console.log( colors.yellow.bold(figlet.textSync('ACM-CLI', { horizontalLayout: 'full' })) );

console.log(colors.green.bold('Welcome to ACM CLI! - for manipulating website data'));

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
