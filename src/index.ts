#!/usr/bin/env bun

import chalk from "chalk";
import ora from "ora";
import child_process from "child_process";
import fs from "fs";
import { $ } from "bun";

let projectName = "my-probun-app";
let templateName: string | undefined;

const templates: { name: string; url: string }[] = [
  {
    name: "default",
    url: "https://github.com/lassejlv/probun-clean-template",
  },
  {
    name: "frogdb",
    url: "https://github.com/lassejlv/probun-template-frogdb",
  },
  {
    name: "advanced",
    url: "https://github.com/benjamint08/probun-example",
  },
];

// Everything before --template = <template-name> is the project name
if (process.argv.length < 3) {
  console.log(chalk.red("Please provide a project name"));
  process.exit(1);
}

projectName = process.argv[2];
// Find --template = <template-name>
const args = process.argv.slice(2);
const templateIndex = args.findIndex((arg) => arg === "--template");
const withPrisma = args.includes("--with-prisma");

if (templateIndex !== -1) {
  templateName = args[templateIndex + 1];
}

if (!templateName) {
  templateName = "default";
} else if (templateName === "frogdb") {
  templateName = "frogdb";
} else if (!templates.find((t) => t.name === templateName)) {
  console.log(chalk.red(`Template ${templateName} not found`));
  process.exit(1);
}

// Checks if the directory already exists
if (fs.existsSync(projectName)) {
  console.log(chalk.red("Directory already exists"));
  process.exit(1);
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log(`\nWelcome to ${chalk.bold("create-probun")}, let get you started...\n`);

const gitInstallSpinner = ora(chalk.bold("Checking if git is installed...")).start();

let gitInstalled = false;

wait(1000);

try {
  child_process.execSync("git --version", { stdio: "ignore" });
  gitInstalled = true;
} catch (e) {
  gitInstallSpinner.fail("Git is not installed");
}

if (gitInstalled) {
  gitInstallSpinner.succeed("Git is installed");

  const loadingSpinner = ora(chalk.bold("Setting up your project...")).start();

  try {
    const gitUrl = templates.find((t) => t.name === templateName)?.url;

    child_process.execSync(`git clone ${gitUrl} ${projectName ? projectName : "probun-app"}`, { stdio: "ignore" });
    loadingSpinner.succeed("Project setup complete");

    const installSpinner = ora(chalk.bold("Installing dependencies...")).start();
    child_process.execSync(`cd ${projectName ? projectName : "probun-app"} && bun install`, { stdio: "ignore" });

    installSpinner.succeed("Dependencies installed");

    if (withPrisma) {
      const prismaSpinner = ora("Setting up Prisma...").start();

      // prettier-ignore
      await $`cd ${projectName ? projectName : "probun-app"} && bunx prisma init --datasource-provider=sqlite`.quiet();

      // prettier-ignore
      await $`cd ${projectName ? projectName : "probun-app"}/src/utils && touch db.ts`.quiet();

      const prismaConfig = `import { PrismaClient } from "@prisma/client";

interface CustomNodeJsGlobal {
    db: PrismaClient;
}
      
declare const global: CustomNodeJsGlobal;
      
const db = global.db || new PrismaClient();
      
if (process.env.NODE_ENV === "development") global.db = db;
      
export default db;`;

      await Bun.write(`${projectName ? projectName : "probun-app"}/src/utils/db.ts`, prismaConfig);

      prismaSpinner.succeed("Prisma setup complete");
    }

    console.log(chalk.bold("\n\nNext steps:"));
    console.log(chalk.gray(`1. cd ${projectName ? projectName : "probun-app"}`));
    console.log(chalk.grey("2. bun dev"));

    console.log(chalk.grey("3. Used template: " + templateName));

    if (withPrisma) {
      console.log(chalk.grey('4. Prisma setup complete, run "bunx prisma db push" to get started with your database'));
    }

    console.log(
      chalk.bold(`\n${chalk.yellow("⚡️")}Read the documentation at ${chalk.underline.blue(`https://probun.dev`)}`)
    );

    process.exit(0);
  } catch (error: any) {
    console.log(error);

    loadingSpinner.fail("Failed to setup project, did you provide valid syntax in the command?");
    process.exit(1);
  }
}
