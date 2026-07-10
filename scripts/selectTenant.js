#!/usr/bin/env node

const inquirer = require('inquirer');
const { spawn } = require('child_process');

const tenants = ['Team-Signal', 'Filter-Go'];

async function run() {
  const { tenant } = await inquirer.prompt([
    {
      type: 'list',
      name: 'tenant',
      message: 'Select a tenant:',
      choices: tenants.map((t, i) => ({
        name: `${i} → ${t}`,
        value: t,
      })),
    },
  ]);

  console.log(`\nStarting app for tenant: ${tenant}\n`);

  const env = {
    ...process.env,
    REACT_APP_TENANT: tenant,
  };

  const child = spawn('npm', ['run', 'start:react'], {
    stdio: 'inherit',
    env,
    shell: true,
  });

  child.on('exit', process.exit);
}

run();
