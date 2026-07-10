#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(command, opts = {}) {
  try {
    return execSync(command, { stdio: 'pipe', ...opts })
      .toString()
      .trim();
  } catch (err) {
    return null;
  }
}

// Try to detect shell
// eslint-disable-next-line no-unused-vars
const shell = process.env.SHELL || '/bin/bash';
const home = process.env.HOME || process.env.USERPROFILE;
const nvmDir = path.join(home, '.nvm');
const nvmScript = path.join(nvmDir, 'nvm.sh');

function withNvmEnv(cmd) {
  if (fs.existsSync(nvmScript)) {
    return `. ${nvmScript} && ${cmd}`;
  }
  return cmd;
}

console.log('🔍 Checking for nvm...');

// Check if nvm is available by sourcing nvm.sh manually
const nvmCheck = run(withNvmEnv('command -v nvm'));

if (!nvmCheck) {
  console.log('❌ nvm not found in your system.');

  console.log('➡️ Attempting to install nvm...');
  const installCmd = `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash`;

  try {
    run(installCmd, { stdio: 'inherit' });
    console.log('✅ nvm installed successfully!');
    console.log('⚠️  Please restart your terminal or run:');
    console.log(`   source ${nvmScript}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to install nvm automatically.');
    console.error('Install manually from https://github.com/nvm-sh/nvm');
    process.exit(1);
  }
}

console.log('✅ nvm detected.');

// Handle .nvmrc
const nvmrcPath = path.join(process.cwd(), '.nvmrc');
if (!fs.existsSync(nvmrcPath)) {
  console.log('⚠️ No .nvmrc file found. Skipping Node version setup.');
  process.exit(0);
}

const version = fs.readFileSync(nvmrcPath, 'utf-8').trim();
console.log(`📦 Using Node version ${version}...`);

const result = run(withNvmEnv(`nvm install ${version} && nvm use ${version}`));
if (result) {
  console.log(`✅ Node version set to ${version}`);
} else {
  console.error(`❌ Failed to switch Node version to ${version}.`);
  console.error(`Make sure nvm is properly loaded by running: source ${nvmScript}`);
  process.exit(1);
}
