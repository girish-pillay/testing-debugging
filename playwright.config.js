const { devices } = require('@playwright/test');

const config = {
  testDir: './tests/',
  //retries :1,
  
  //Maximum time one test can run for
  timeout: 180* 1000,
  expect: {
  
    timeout: 5000
  },
  
  //reporter: [['html'], ['json', { outputFile: 'playwright-report/report.json' }]],
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report/results.json' }]
  ],

  projects: [
    {
      name: 'chrome',
      use: {
        browserName: 'chromium',
        headless: false,
         permissions: ['geolocation', 'microphone'],

      launchOptions: {
        args: [
          '--use-fake-ui-for-media-stream',
          '--use-fake-device-for-media-stream'
        ]
      }
      }
    },
    {
      name: 'firefox',
      use: {
        browserName: 'firefox',
        headless: false,
        permissions: ['geolocation']
      }
    },
    {
      name: 'safari',
      use: {
        browserName: 'webkit',
        headless: false,
        permissions: ['geolocation']
      }
    },
    {
      name: 'BrowserStack',
      use: {
        browserName: 'chromium',
        channel: 'chrome', 
        headless: false,
        viewport: { width: 412, height: 915 }, // Galaxy Note 20 resolution
        userAgent:
          'Mozilla/5.0 (Linux; Android 10; SM-N981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Mobile Safari/537.36',
        launchOptions: {
          args: ['--disable-dev-shm-usage'],
        },
      },
    }
  ]
  
};
module.exports = config;
