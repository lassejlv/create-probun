#!/usr/bin/env bun

import chalk from 'chalk';
import ora from 'ora';
import child_process from 'child_process';
import fs from 'fs';
// @ts-ignore: No types available
import figlet from 'figlet';

let projectName;

if (process.argv.length > 2) {
    projectName = process.argv[2];

    if (fs.existsSync(projectName)) {
        console.log(chalk.red('A directory with the same name already exists'));
        process.exit(1);
    }
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
        child_process.execSync(`git clone https://github.com/benjamint08/probun-example ${projectName ? projectName : "probun-app"}`, { stdio: 'ignore' });
        loadingSpinner.succeed('Project setup complete');

        const installSpinner = ora(chalk.bold('Installing dependencies...')).start();
        child_process.execSync(`cd ${projectName ? projectName : "probun-app"} && bun install`, { stdio: 'ignore' });

        installSpinner.succeed('Dependencies installed');
        
        console.log(chalk.bold('\n\nNext steps:'));
        console.log(chalk.bold(`1. cd ${projectName ? projectName : "probun-app"}`));
        console.log(chalk.bold('2. bun dev'));

        console.log(chalk.bold('\n⚡️ Read the documentation at https://probun.dev'));

        console.log(chalk.bold('\nHappy Coding! 🧑‍💻'));

        process.exit(0);

    } catch (error: any) {      
        loadingSpinner.fail('Failed to setup project');
        process.exit(1);
    }
}