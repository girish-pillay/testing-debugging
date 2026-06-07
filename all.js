// const fs = require('fs');
// const path = require('path');
// const { execSync } = require('child_process');

// const testFiles = ['barwani', 'singrauli', 'chattarpur', 'sheopur', 'ratlam', 'vidisha'];
// const reportDir = 'report-temp';
// const finalReport = 'playwright-report/combined-report.json';
// const delayMs = 20000;
// const MAX_RETRIES = 2;

// // Ensure report-temp exists
// if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);

// for (const file of testFiles) {
//   const tempConfigPath = path.join(__dirname, 'temp.config.js');
//   fs.writeFileSync(tempConfigPath, `
//     module.exports = {
//       testDir: './tests',
//       retries: ${MAX_RETRIES},
//       reporter: [['json', { outputFile: '${reportDir}/${file}.json' }]],
//       projects: [{
//         name: 'chrome',
//         use: { browserName: 'chromium', headless: true }
//       }]
//     };
//   `);

//   console.log(`\n🟢 Running: ${file}`);
//   try {
//     execSync(
//       `npx playwright test tests/${file}.spec.js --project=chrome --config=${tempConfigPath}`,
//       { stdio: 'inherit' }
//     );
//   } catch (error) {
//     console.error(`❌ Test suite failed for ${file}`);
//   }

//   fs.unlinkSync(tempConfigPath);
//   console.log(`⏳ Waiting ${delayMs / 1000}s before next test...`);
//   Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delayMs);
// }

// // Merge reports
// console.log(`\n🛠️ Merging reports...`);
// const merged = {
//   suites: [],
//   errors: [],
//   stats: { expected: 0, skipped: 0, unexpected: 0, flaky: 0 },
// };

// const jsonFiles = fs.readdirSync(reportDir).filter(f => f.endsWith('.json'));

// for (const file of jsonFiles) {
//   const filePath = path.join(reportDir, file);
//   try {
//     const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
//     if (data?.suites?.length) merged.suites.push(...data.suites);
//     if (data?.errors?.length) merged.errors.push(...data.errors);
//     for (const key of Object.keys(merged.stats)) {
//       merged.stats[key] += data.stats?.[key] || 0;
//     }
//   } catch (err) {
//     console.error(`❌ Failed to parse ${filePath}: ${err.message}`);
//   }
// }

// fs.writeFileSync(finalReport, JSON.stringify(merged, null, 2));
// console.log(`✅ Combined report saved to ${finalReport}`);



/*
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const testFiles = ['barwani', 'chattarpur', 'sheopur', 'ratlam', 'singrauli', 'vidisha'];
const reportDir = 'report-temp';
const finalReport = 'playwright-report/combined-report.json';
const delayMs = 20000; // 20s delay between test runs
const MAX_RETRIES = 2; // retry failed tests

// Ensure report-temp exists
if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);

for (const file of testFiles) {
  const tempConfigPath = path.join(__dirname, 'temp.config.js');

  // Dynamically write temp config with both HTML and JSON reporters
  fs.writeFileSync(tempConfigPath, `
    module.exports = {
      testDir: './tests',
      reporter: [
        ['json', { outputFile: '${reportDir}/${file}.json' }],
        ['html', { outputFolder: '${reportDir}/${file}-html', open: 'never' }]
      ],
      projects: [{
        name: 'chrome',
        use: { browserName: 'chromium', headless: true }
      }]
    };
  `);

  let success = false;
  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    console.log(`\n🟢 Running: ${file} (Attempt ${attempt})`);
    try {
      execSync(
        `npx playwright test tests/${file}.spec.js --project=chrome --config=${tempConfigPath}`,
        { stdio: 'inherit' }
      );
      success = true;
      break;
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed for ${file}`);
      if (attempt > MAX_RETRIES) {
        console.error(`❌ All ${MAX_RETRIES + 1} attempts failed for ${file}`);
      } else {
        console.log(`⏳ Retrying ${file} in 5s...`);
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000);
      }
    }
  }

  fs.unlinkSync(tempConfigPath); // Clean up
  console.log(`⏳ Waiting ${delayMs / 1000}s before next test...`);
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delayMs);
}

// Merge all JSON reports
console.log(`\n🛠️ Merging reports...`);
const merged = {
  suites: [],
  errors: [],
  stats: { expected: 0, skipped: 0, unexpected: 0, flaky: 0 },
};

const jsonFiles = fs.readdirSync(reportDir).filter(f => f.endsWith('.json'));

for (const file of jsonFiles) {
  const filePath = path.join(reportDir, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (data?.suites?.length) merged.suites.push(...data.suites);
    if (data?.errors?.length) merged.errors.push(...data.errors);
    for (const key of Object.keys(merged.stats)) {
      merged.stats[key] += data.stats?.[key] || 0;
    }
  } catch (err) {
    console.error(`❌ Failed to parse ${filePath}: ${err.message}`);
  }
}

fs.writeFileSync(finalReport, JSON.stringify(merged, null, 2));
console.log(`✅ Combined report saved to ${finalReport}`);

// Optional: tell user how to view any HTML report
console.log('\n📂 To open an HTML report, run for example:');
console.log(`   npx playwright show-report ${reportDir}/barwani-html`);
*/



// const fs = require('fs');
// const path = require('path');
// const { execSync } = require('child_process');

// const testFiles = ['UPC-EGH','UPC-Ujjain'];
// const reportDir = 'report-temp';
// const finalReport = 'playwright-report/combined-report.json';
// const delayMs = 20000; // 20s delay between test runs

// // Ensure report-temp exists
// if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);

// for (const file of testFiles) {
//   const tempConfigPath = path.join(__dirname, 'temp.config.js');

//   // Dynamically write config with native per-test retries
//   fs.writeFileSync(tempConfigPath, `
//     module.exports = {
//       testDir: './tests/CL',
//       retries: 2,  // ✅ Native retry logic for failed tests
//       reporter: [
//         ['json', { outputFile: '${reportDir}/${file}.json' }],
//         ['html', { outputFolder: '${reportDir}/${file}-html', open: 'never' }]
//       ],
//       projects: [{
//         name: 'chrome',
//         use: { browserName: 'chromium', headless: true }
//       }]
//     };
//   `);

//   console.log(`\n🟢 Running: ${file}`);
//   try {
//     execSync(
//       `npx playwright test tests/${file}.spec.js --project=chrome --config=${tempConfigPath}`,
//       { stdio: 'inherit' }
//     );
//   } catch (error) {
//     console.error(`❌ Test suite failed for ${file}`);
//   }

//   fs.unlinkSync(tempConfigPath);
//   console.log(`⏳ Waiting ${delayMs / 1000}s before next test...`);
//   Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delayMs);
// }

// // Merge all JSON reports
// console.log(`\n🛠️ Merging reports...`);
// const merged = {
//   suites: [],
//   errors: [],
//   stats: { expected: 0, skipped: 0, unexpected: 0, flaky: 0 },
// };

// const jsonFiles = fs.readdirSync(reportDir).filter(f => f.endsWith('.json'));

// for (const file of jsonFiles) {
//   const filePath = path.join(reportDir, file);
//   try {
//     const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
//     if (data?.suites?.length) merged.suites.push(...data.suites);
//     if (data?.errors?.length) merged.errors.push(...data.errors);
//     for (const key of Object.keys(merged.stats)) {
//       merged.stats[key] += data.stats?.[key] || 0;
//     }
//   } catch (err) {
//     console.error(`❌ Failed to parse ${filePath}: ${err.message}`);
//   }
// }

// fs.writeFileSync(finalReport, JSON.stringify(merged, null, 2));
// console.log(`✅ Combined report saved to ${finalReport}`);


/**
 * all.js
 * Runs Playwright test suites one-by-one
 * Generates dated HTML reports in ONE directory
 * Merges JSON reports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/* ================= CONFIG ================= */

const testFiles = ['UPC-Ujjain'];

const testDir = './tests/CL';

const reportTempDir = 'report-temp';
const finalHtmlDir = 'report-final';
const finalJsonDir = 'playwright-report';

const delayMs = 20000;
const date = new Date().toISOString().split('T')[0];

/* ================= ENSURE DIRS ================= */

for (const dir of [reportTempDir, finalHtmlDir, finalJsonDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/* ================= RUN TESTS ================= */

for (const file of testFiles) {
  const testFilePath = path.join(__dirname, testDir, `${file}.spec.js`);
  if (!fs.existsSync(testFilePath)) {
    console.error(`❌ Missing test: ${testFilePath}`);
    continue;
  }

  const tempConfigPath = path.join(__dirname, 'temp.config.js');
  const isVoiceTest = file === 'voice-recording-check';

  const useBlock = isVoiceTest
    ? `
        use: {
          browserName: 'chromium',
          headless: false,
          permissions: ['microphone'],
          launchOptions: {
            args: [
              '--use-fake-ui-for-media-stream',
              '--use-fake-device-for-media-stream'
            ]
          }
        }
      `
    : `
        use: {
          browserName: 'chromium',
          headless: true
        }
      `;

  fs.writeFileSync(
    tempConfigPath,
    `
      module.exports = {
        testDir: '${testDir}',
        retries: 1,
        reporter: [
          ['json', { outputFile: '${reportTempDir}/${file}.json' }],
          ['html', { outputFolder: '${reportTempDir}/${file}-html', open: 'never' }]
        ],
        projects: [
          {
            name: 'chrome',
            ${useBlock}
          }
        ]
      };
    `
  );

  console.log(`\n🟢 Running test suite: ${file}`);

  try {
    execSync(
      `npx playwright test ${file}.spec.js --project=chrome --config=${tempConfigPath} --workers=1 --timeout=150000`,
      { stdio: 'inherit' }
    );
  } catch (err) {
    console.error(`❌ Test failed: ${file}`);
  }

  if (fs.existsSync(tempConfigPath)) {
    fs.unlinkSync(tempConfigPath);
  }

  /* ========== MOVE & RENAME HTML REPORT ========== */

  const htmlSource = path.join(reportTempDir, `${file}-html`, 'index.html');
  const htmlTarget = path.join(finalHtmlDir, `${date}_${file}.html`);

  if (fs.existsSync(htmlSource)) {
    fs.copyFileSync(htmlSource, htmlTarget);
    console.log(`📄 HTML report saved: ${htmlTarget}`);
  } else {
    console.warn(`⚠️ HTML report missing for ${file}`);
  }

  console.log(`⏳ Waiting ${delayMs / 1000}s...`);
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delayMs);
}

/* ================= MERGE JSON ================= */

console.log(`\n🛠️ Merging JSON reports...`);

const merged = {
  suites: [],
  errors: [],
  stats: { expected: 0, skipped: 0, unexpected: 0, flaky: 0 }
};

const jsonFiles = fs.readdirSync(reportTempDir).filter(f => f.endsWith('.json'));

for (const file of jsonFiles) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(reportTempDir, file), 'utf8'));
    merged.suites.push(...(data.suites || []));
    merged.errors.push(...(data.errors || []));

    for (const key in merged.stats) {
      merged.stats[key] += data.stats?.[key] || 0;
    }
  } catch (err) {
    console.error(`❌ Failed to parse ${file}: ${err.message}`);
  }
}

const combinedJson = path.join(finalJsonDir, `combined-${date}.json`);
fs.writeFileSync(combinedJson, JSON.stringify(merged, null, 2));

console.log(`✅ Combined JSON saved: ${combinedJson}`);
console.log(`📂 Final HTML reports directory: ${finalHtmlDir}`);
