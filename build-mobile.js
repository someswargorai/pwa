const fs = require('fs');
const { execSync } = require('child_process');

const apiPath = './app/api';
const tempApiPath = './app/api_temp';

try {
  // Hide API directory so Next.js static export doesn't fail on dynamic routes
  if (fs.existsSync(apiPath)) {
    console.log('Temporarily hiding API routes for static export...');
    fs.renameSync(apiPath, tempApiPath);
  }

  // Run the Next.js build
  console.log('Running Next.js build...');
  process.env.CAPACITOR_BUILD = 'true';
  execSync('npx next build', { stdio: 'inherit' });

  // Sync with Capacitor
  console.log('Syncing Capacitor...');
  execSync('npx cap sync', { stdio: 'inherit' });

} catch (error) {
  console.error('Build failed:', error);
} finally {
  // Always restore the API directory
  if (fs.existsSync(tempApiPath)) {
    console.log('Restoring API routes...');
    fs.renameSync(tempApiPath, apiPath);
  }
}
