#!/usr/bin/env node

import { Command }  from 'commander'
import { injectAuthCommand  } from './commands/auth';
import { injectSchemaCommand  } from './commands/schema';
import { injectUsersCommand  } from './commands/users';
import { colors } from './utils';
import { injectFriendly } from './commands/friendly';
const figlet = require('figlet');

console.log( colors.yellow.bold(figlet.textSync('ACM-CLI', { horizontalLayout: 'full' })) );

console.log(colors.green.bold('Welcome to ACM CLI! - for manipulating website data'));

const program = new Command();

program
    .name('acm-cli')
    .description('ACM CLI for manipulating website data')
    .version('0.1.0');

// Auth Command group
const auth = program
                .command('auth')
                .description('Commands for manage auth');
injectAuthCommand(auth);

// Schemas command group
const schema = program
                .command('schema')
                .description('Commands for manage schemas/data');
injectSchemaCommand(schema);

const users = program
                .command('users')
                .description('[SUPER USER ONLY] Commands for manage allowed users to use this CLI');
injectUsersCommand(users);

// Friendly UI
program
    .command('friendly')
    .description('Friendly UI for the CLI')
    .action(injectFriendly);


program.parseAsync();