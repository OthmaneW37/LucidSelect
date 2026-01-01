#!/usr/bin/env node

/**
 * Build Release Script for LucidSelect
 * 
 * This script automates the release build process:
 * 1. Cleans the dist directory
 * 2. Runs production build
 * 3. Validates manifest.json
 * 4. Creates a zip file for Chrome Web Store submission
 * 5. Generates build report
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const ROOT_DIR = path.join(__dirname, '..');
const RELEASE_DIR = path.join(ROOT_DIR, 'releases');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function step(message) {
    log(`\n→ ${message}`, 'cyan');
}

function success(message) {
    log(`✓ ${message}`, 'green');
}

function error(message) {
    log(`✗ ${message}`, 'red');
}

function warning(message) {
    log(`⚠ ${message}`, 'yellow');
}

// Clean dist directory
async function cleanDist() {
    step('Cleaning dist directory...');
    if (fs.existsSync(DIST_DIR)) {
        fs.rmSync(DIST_DIR, { recursive: true, force: true });
    }
    success('Dist directory cleaned');
}

// Run production build
async function buildProduction() {
    step('Running production build...');
    try {
        execSync('npm run build', { stdio: 'inherit', cwd: ROOT_DIR });
        success('Production build completed');
    } catch (err) {
        error('Build failed');
        throw err;
    }
}

// Validate manifest.json
async function validateManifest() {
    step('Validating manifest.json...');

    const manifestPath = path.join(DIST_DIR, 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
        error('manifest.json not found in dist directory');
        throw new Error('Missing manifest.json');
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Check required fields
    const requiredFields = ['name', 'version', 'manifest_version', 'description'];
    const missingFields = requiredFields.filter(field => !manifest[field]);

    if (missingFields.length > 0) {
        error(`Missing required fields in manifest: ${missingFields.join(', ')}`);
        throw new Error('Invalid manifest');
    }

    success(`Manifest validated: ${manifest.name} v${manifest.version}`);
    return manifest.version;
}

// Create zip file for Chrome Web Store
async function createZip(version) {
    step('Creating release zip file...');

    // Create releases directory if it doesn't exist
    if (!fs.existsSync(RELEASE_DIR)) {
        fs.mkdirSync(RELEASE_DIR);
    }

    const zipFileName = `lucidselect-v${version}.zip`;
    const zipPath = path.join(RELEASE_DIR, zipFileName);

    // Remove existing zip if present
    if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
    }

    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
            success(`Zip created: ${zipFileName} (${sizeInMB} MB)`);
            resolve(zipPath);
        });

        archive.on('error', (err) => {
            error('Failed to create zip');
            reject(err);
        });

        archive.pipe(output);
        archive.directory(DIST_DIR, false);
        archive.finalize();
    });
}

// Generate build report
async function generateReport(version, zipPath) {
    step('Generating build report...');

    const report = {
        version,
        timestamp: new Date().toISOString(),
        zipFile: path.basename(zipPath),
        zipSize: fs.statSync(zipPath).size,
        files: []
    };

    // Count files in dist
    function countFiles(dir, baseDir = dir) {
        const items = fs.readdirSync(dir);
        let count = 0;

        items.forEach(item => {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                count += countFiles(fullPath, baseDir);
            } else {
                count++;
                const relativePath = path.relative(baseDir, fullPath);
                report.files.push({
                    path: relativePath,
                    size: stat.size
                });
            }
        });

        return count;
    }

    const fileCount = countFiles(DIST_DIR);
    report.fileCount = fileCount;

    // Write report
    const reportPath = path.join(RELEASE_DIR, `build-report-v${version}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    success(`Build report saved: build-report-v${version}.json`);
    log(`\nBuild Summary:`, 'cyan');
    log(`  Version: ${version}`);
    log(`  Files: ${fileCount}`);
    log(`  Zip Size: ${(report.zipSize / 1024 / 1024).toFixed(2)} MB`);
}

// Main execution
async function main() {
    log('\n═══════════════════════════════════════', 'cyan');
    log('   LucidSelect Release Build Script', 'cyan');
    log('═══════════════════════════════════════\n', 'cyan');

    try {
        await cleanDist();
        await buildProduction();
        const version = await validateManifest();
        const zipPath = await createZip(version);
        await generateReport(version, zipPath);

        log('\n═══════════════════════════════════════', 'green');
        log('   Release Build Successful! 🎉', 'green');
        log('═══════════════════════════════════════\n', 'green');

        log('Next steps:', 'yellow');
        log('1. Test the extension by loading the dist folder');
        log(`2. Upload ${path.basename(zipPath)} to Chrome Web Store`);
        log('3. Update CHANGELOG.md if needed');
        log('4. Create a GitHub release\n');

    } catch (err) {
        log('\n═══════════════════════════════════════', 'red');
        log('   Release Build Failed ✗', 'red');
        log('═══════════════════════════════════════\n', 'red');
        console.error(err);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main };
