// const { chromium } = require('playwright');
// const lighthouse = require('lighthouse').default;
// const fs = require('fs');
// const path = require('path');

// const urlsToAudit = [
// 'https://demo.marketing.cuedwell.com/',
//   'https://demo.marketing.cuedwell.com/about-us',
//   'https://demo.marketing.cuedwell.com/project',
//   'https://demo.marketing.cuedwell.com/research',
//   'https://demo.marketing.cuedwell.com/ip',
//   'https://demo.marketing.cuedwell.com/academic',
//   'https://demo.marketing.cuedwell.com/membership',
//   'https://demo.marketing.cuedwell.com/contact-us',
// ];

// const outputDir = path.join(__dirname, 'lighthouse-reports');
// if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// let combinedHtml = `
// <html>
//   <head>
//     <title>Combined Lighthouse Report</title>
//     <style>
//       body { font-family: Arial; margin: 2rem; }
//       h1 { text-align: center; }
//       .report { margin: 1.5rem 0; border: 1px solid #ccc; padding: 1rem; }
//       iframe { width: 100%; height: 650px; border: none; }
//     </style>
//   </head>
//   <body>
//     <h1>Combined Lighthouse Report (Mobile + Desktop)</h1>
// `;

// (async () => {
//   const browser = await chromium.launch({
//     headless: true,
//     args: ['--remote-debugging-port=9222']
//   });

//   const auditModes = [
//     { label: 'Mobile', settings: { emulatedFormFactor: 'mobile', throttling: { rttMs: 150, throughputKbps: 1600 } } },
//     { label: 'Desktop', settings: { emulatedFormFactor: 'desktop', throttling: { rttMs: 40, throughputKbps: 10240 } } }
//   ];

//   for (const url of urlsToAudit) {
//     for (const mode of auditModes) {
//       const result = await lighthouse(url, {
//         port: 9222,
//         output: 'html',
//         logLevel: 'error',
//         onlyCategories: ['performance', 'accessibility', 'seo'],
//         ...mode.settings
//       });

//       const htmlReport = result.report;
//       const shortName = url.replace('https://', '').replace(/\W+/g, '_');
//       const fileName = `${shortName}_${mode.label}.html`;
//       const filePath = path.join(outputDir, fileName);

//       fs.writeFileSync(filePath, htmlReport);
//       combinedHtml += `
//         <div class="report">
//           <h2>${url} - ${mode.label}</h2>
//           <iframe src="${fileName}"></iframe>
//         </div>
//       `;
//     }
//   }

//   combinedHtml += '</body></html>';
//   fs.writeFileSync(path.join(outputDir, 'combined-report.html'), combinedHtml);
//   console.log('✅ Combined Mobile + Desktop Report created!');
//   await browser.close();
// })();


const { chromium } = require('playwright');
const lighthouse = require('lighthouse').default;
const fs = require('fs');
const path = require('path');

const urlsToAudit = [
  'https://global.iitm.ac.in',
  'https://global.iitm.ac.in/about-us',
  'https://global.iitm.ac.in/project',
  'https://global.iitm.ac.in/research',
  'https://global.iitm.ac.in/ip',
  'https://global.iitm.ac.in/academic',
  'https://global.iitm.ac.in/membership',
  'https://global.iitm.ac.in/contact-us',
];

const outputDir = path.join(__dirname, 'lighthouse-reports');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// Combined HTML structure
let combinedHtml = `
<html>
<head>
  <meta charset="UTF-8">
  <title>Standalone Lighthouse Report (Mobile + Desktop)</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2rem; }
    h1 { text-align: center; }
    h2 { margin-top: 3rem; color: #444; }
    .report-block { margin-bottom: 3rem; border: 1px solid #ccc; padding: 1rem; border-radius: 8px; }
    .report-block hr { margin: 2rem 0; }
  </style>
</head>
<body>
  <h1>Standalone Lighthouse Report (Mobile + Desktop)</h1>
`;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--remote-debugging-port=9222']
  });

  const auditModes = [
    {
      label: 'Mobile',
      settings: {
        emulatedFormFactor: 'mobile',
        throttling: { rttMs: 150, throughputKbps: 1600 }
      }
    },
    {
      label: 'Desktop',
      settings: {
        emulatedFormFactor: 'desktop',
        throttling: { rttMs: 40, throughputKbps: 10240 }
      }
    }
  ];

  for (const url of urlsToAudit) {
    for (const mode of auditModes) {
      const result = await lighthouse(url, {
        port: 9222,
        output: 'html',
        logLevel: 'error',
        onlyCategories: ['performance', 'accessibility', 'seo'],
        ...mode.settings
      });

      const shortName = url.replace('https://', '').replace(/\W+/g, '_');
      const reportHtml = result.report;

      // Append this report directly to combined HTML
      combinedHtml += `
        <div class="report-block">
          <h2>${url} — ${mode.label}</h2>
          ${reportHtml}
        </div>
        <hr/>
      `;
    }
  }

  combinedHtml += `
</body>
</html>
`;

  const finalFile = path.join(outputDir, 'combined-standalone-report.html');
  fs.writeFileSync(finalFile, combinedHtml);
  console.log(`✅ Created: ${finalFile}`);

  await browser.close();
})();

