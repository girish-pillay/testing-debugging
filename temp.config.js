
      module.exports = {
        testDir: './tests/CL',
        retries: 1,
        reporter: [
          ['json', { outputFile: 'report-temp/ML-ALL-MASD-Check.json' }],
          ['html', { outputFolder: 'report-temp/ML-ALL-MASD-Check-html', open: 'never' }]
        ],
        projects: [
          {
            name: 'chrome',
            
        use: {
          browserName: 'chromium',
          headless: true
        }
      
          }
        ]
      };
    