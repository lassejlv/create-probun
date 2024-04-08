#!/usr/bin/env bun

import chalk from 'chalk';
import ora from 'ora';
import child_process from 'child_process';
// @ts-ignore: No types available
import figlet from 'figlet';
import fs from 'fs';

let projectName = "my-probun-app";
let templateName: string | undefined;

const templates: { name: string, url: string }[] = [
    {
        name: 'default',
        url: "https://github.com/benjamint08/probun-example",
    },
    {
        name: "frogdb",
        url: "https://github.com/lassejlv/probun-template-frogdb"
    }
]


// Everything before --template = <template-name> is the project name
if (process.argv.length < 3) {
    console.log(chalk.red('Please provide a project name'));
    process.exit(1);
}

projectName = process.argv[2];
// Find --template = <template-name>
const args = process.argv.slice(2);
const templateIndex = args.findIndex(arg => arg === '--template');
if (templateIndex !== -1) {
    templateName = args[templateIndex + 1];
}

if (!templateName) {
    templateName = "default";
} else if (templateName === 'frogdb') {
    templateName = 'frogdb';
} else if (!templates.find(t => t.name === templateName)) {
    console.log(chalk.red(`Template ${templateName} not found`));
    process.exit(1);
}


// Checks if the directory already exists
if (fs.existsSync(projectName)) {
    console.log(chalk.red('Directory already exists'));
    process.exit(1);
}



function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

figlet('Probun', (err: any, data: any) => {
    if (err) {
        console.error("Something went wrong...");
        console.dir(err);
        return;
      }

     console.log(`\n\n${chalk.bold(data)}\n\n`);
})

wait(1000);

const gitInstallSpinner = ora(chalk.bold('Checking if git is installed...')).start();

let gitInstalled = false;


wait(1000);

try {
    child_process.execSync('git --version', { stdio: 'ignore' });
    gitInstalled = true;
} catch (e) {
    gitInstallSpinner.fail('Git is not installed');
}

if (gitInstalled) {
    gitInstallSpinner.succeed('Git is installed');
   
    const loadingSpinner = ora(chalk.bold("Setting up your project...")).start();

    try {
       const gitUrl = templates.find(t => t.name === templateName)?.url;
        
        child_process.execSync(`git clone ${gitUrl} ${projectName ? projectName : "probun-app"}`, { stdio: 'ignore' });
        loadingSpinner.succeed('Project setup complete');

        const installSpinner = ora(chalk.bold('Installing dependencies...')).start();
        child_process.execSync(`cd ${projectName ? projectName : "probun-app"} && bun install`, { stdio: 'ignore' });

        installSpinner.succeed('Dependencies installed');
        
        console.log(chalk.bold('\n\nNext steps:'));
        console.log(chalk.green(`1. cd ${projectName ? projectName : "probun-app"}`));
        console.log(chalk.green('2. bun dev'));
        console.log(chalk.green('3. Used template: ' + templateName));

        console.log(chalk.bold(`\n${chalk.yellow("⚡️")}Read the documentation at https://probun.dev`));
        process.exit(0);

    } catch (error: any) {          
        loadingSpinner.fail('Failed to setup project, did you provide valid syntax in the command?');
        process.exit(1);
    }
}