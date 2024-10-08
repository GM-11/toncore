#!/usr/bin/env node
import { Command } from "commander";
import path, { dirname } from "path";
const program = new Command();
import prompts from "prompts";
import * as fs from "fs-extra";
import { fileURLToPath } from "url";
import setupTailwind from "../utils/setupTailwind.js";
import setupSolidity from "../utils/setupSolidity.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
program
    .name("create-toncore-app")
    .description("Create a new toncore app")
    .argument("[project-name]", "Name of the new project")
    .action(async (projectName) => {
    if (!projectName) {
        // Ask for project name if not provided
        const response = await prompts({
            type: "text",
            name: "name",
            message: "Project Name: ",
            validate: (name) => (name ? true : "Project name is required"),
        });
        projectName = response.name;
    }
    const targetDir = path.join(process.cwd(), projectName);
    if (await fs.exists(targetDir)) {
        console.log(`Error: Directory ${projectName} already exists.`);
        process.exit(1);
    }
    const templateDir = path.join(__dirname, "../../template");
    const { useTailwind } = await prompts({
        type: "confirm",
        name: "useTailwind",
        message: "Do you want to use Tailwind CSS?",
        initial: true,
    });
    const { generateSolidity } = await prompts({
        type: "confirm",
        name: "generateSolidity",
        message: "Do you want to generate Solidity smart contract files?",
        initial: true,
    });
    try {
        console.log("Generating project");
        await fs.copy(templateDir, targetDir);
        console.log("Project generated successfully");
        // const packageJsonPath = path.join(targetDir, "package.json");
        // console.log(packageJsonPath);
        // const packageJson = await fs.readJSON(packageJsonPath);
        // packageJson.name = projectName;
        // await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
        process.chdir(targetDir);
        // console.log("Installing dependencies...");
        // try {
        //   execSync("npm install", { stdio: "ignore" });
        // } catch (error) {
        //   console.error("Failed to install dependencies:", error);
        //   process.exit(1);
        // }
        if (useTailwind) {
            await setupTailwind(targetDir); // Call the Tailwind setup function
        }
        if (generateSolidity) {
            await setupSolidity(targetDir, projectName);
        }
    }
    catch (error) {
        console.log(`Error: ${error}`);
        process.exit(1);
    }
});
program.parse();
