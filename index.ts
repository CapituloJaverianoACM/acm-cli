#!/usr/bin/env node

import { Command }  from 'commander';
import { injectAuthCommand } from './commands/auth';
import { injectSchemaCommand } from './commands/schema';

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

program.parseAsync();
