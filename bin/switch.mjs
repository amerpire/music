import { copyFileSync } from 'fs';

const args = process.argv.slice(2);
const envName = args[0];
copyFileSync(`envs/env.${envName}.ts`, 'envs/env.ts');
console.log(`Switched to ${envName} environment.`);
