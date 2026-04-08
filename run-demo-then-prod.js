const { execSync } = require('child_process');

function run(envName, baseUrl) {
  console.log(`\n🚀 Running tests on ${envName}`);
  try {
    execSync(
      `set BASE_URL=${baseUrl} && node all.js`,
      { stdio: 'inherit' }
    );
    console.log(`✅ ${envName} PASSED`);
    return true;
  } catch {
    console.error(`❌ ${envName} FAILED`);
    return false;
  }
}

// 1️⃣ DEMO first
const demoPassed = run('DEMO', 'https://demo.cuedwell.com');

// 2️⃣ Only if DEMO passes → PROD
if (!demoPassed) {
  console.error('\n🛑 Stopping pipeline. PROD will NOT run.');
  process.exit(1);
}

// 3️⃣ PROD
run('PROD', 'https://www.cuedwell.com');
