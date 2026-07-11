import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';

// Update this once per project — points at the design system's repo + branch
const REGISTRY_BASE =
  'https://raw.githubusercontent.com/Nehemiah51000/icore-sms-design-system/main';

async function fetchText(path) {
  const res = await fetch(`${REGISTRY_BASE}/${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.text();
}

async function copyRemoteFile(relativePath) {
  const targetPath = join(process.cwd(), 'src', relativePath);

  if (existsSync(targetPath)) {
    console.log(`  → Skipped (already exists): ${relativePath}`);
    return;
  }

  const content = await fetchText(`src/${relativePath}`);
  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, content);
  console.log(`  ✓ Fetched: ${relativePath}`);
}

async function run() {
  const componentName = process.argv[2];

  if (!componentName) {
    const registry = JSON.parse(await fetchText('registry.json'));
    console.log('\nUsage: node scripts/add-component.js <ComponentName>\n');
    console.log('Available components:');
    Object.keys(registry).forEach((name) => console.log(`  - ${name}`));
    console.log('');
    return;
  }

  const registry = JSON.parse(await fetchText('registry.json'));
  const entry = registry[componentName];

  if (!entry) {
    console.error(`\nUnknown component "${componentName}".\n`);
    return;
  }

  console.log(`\nFetching "${componentName}" from design-system...\n`);
  for (const file of [...entry.files, ...entry.deps]) {
    await copyRemoteFile(file);
  }
  console.log(`\nDone. Check for new imports you may need to pnpm add.\n`);
}

run();
