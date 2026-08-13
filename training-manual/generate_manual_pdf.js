const puppeteer = require('puppeteer');
const path = require('path');
const { pathToFileURL } = require('url');
const fs = require('fs');

const htmlPath = path.resolve(__dirname, 'training_manual.html');
const pdfPath = path.resolve(__dirname, 'CMM_SMS_Store_Training_Manual.pdf');
const fileUrl = pathToFileURL(htmlPath).href;

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];

let browserExe = null;
for (const p of chromePaths) {
  if (fs.existsSync(p)) {
    browserExe = p;
    break;
  }
}

console.log('----------------------------------------------------');
console.log('  GENERATING CMM SMS STORE TRAINING MANUAL PDF     ');
console.log('----------------------------------------------------');
console.log('Source HTML:', fileUrl);
console.log('Target PDF :', pdfPath);

if (!browserExe) {
  console.error('ERROR: No local Chrome or Edge found for Puppeteer to use.');
  process.exit(1);
}

(async () => {
  try {
    // Prevent false positive success by deleting the old PDF first
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
      console.log('Old PDF deleted to ensure fresh generation.');
    }

    console.log(`Launching headless browser (Puppeteer) via ${browserExe}...`);
    const browser = await puppeteer.launch({
      headless: 'new', // Modern headless mode
      executablePath: browserExe,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    console.log('Navigating to local HTML file...');
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    console.log('Generating PDF...');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      margin: {
        top: '18mm',
        bottom: '18mm',
        left: '16mm',
        right: '16mm'
      },
      headerTemplate: '<div></div>', // Empty header
      footerTemplate: `
        <div style="font-family: 'Inter', sans-serif; font-size: 8.5pt; color: #94a3b8; width: 100%; display: flex; justify-content: space-between; padding: 0 16mm;">
          <span>CMM SMS Store - Operational Training Manual</span>
          <span><span class="pageNumber"></span></span>
        </div>
      `
    });

    await browser.close();

    if (fs.existsSync(pdfPath)) {
      const stats = fs.statSync(pdfPath);
      console.log('\n====================================================');
      console.log('  PDF GENERATION COMPLETED SUCCESSFULLY!           ');
      console.log(`  File: ${pdfPath}`);
      console.log(`  Size: ${(stats.size / 1024).toFixed(1)} KB`);
      console.log('====================================================\n');
    }
  } catch (err) {
    console.error('Failed to generate PDF:', err);
    process.exit(1);
  }
})();
