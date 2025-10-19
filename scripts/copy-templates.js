const fs = require('fs');
const path = require('path');

/**
 * Copy email templates from src to dist directory
 * This ensures templates are available in production builds
 */
function copyEmailTemplates() {
  const srcTemplatesDir = path.join(__dirname, '../src/messaging/email-templates');
  const distTemplatesDir = path.join(__dirname, '../dist/src/messaging/email-templates');

  console.log('📧 Copying email templates...');
  console.log(`Source: ${srcTemplatesDir}`);
  console.log(`Destination: ${distTemplatesDir}`);

  try {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(distTemplatesDir)) {
      fs.mkdirSync(distTemplatesDir, { recursive: true });
      console.log('✅ Created destination directory');
    }

    // Copy the entire email-templates directory
    copyDirectory(srcTemplatesDir, distTemplatesDir);
    
    console.log('✅ Email templates copied successfully');
  } catch (error) {
    console.error('❌ Error copying email templates:', error);
    process.exit(1);
  }
}

/**
 * Recursively copy directory contents
 */
function copyDirectory(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  📄 Copied: ${entry.name}`);
    }
  }
}

// Run the copy function
copyEmailTemplates();
