#!/usr/bin/env node

/**
 * Performance Optimization Script for All Vue Pages
 * This script adds performance monitoring to all Vue component files
 */

const fs = require('fs');
const path = require('path');

const VIEWS_DIR = path.join(__dirname, 'src', 'views');
const COMPONENTS_DIR = path.join(__dirname, 'src', 'components');

// List of pages to optimize
const pagesToOptimize = [
  'Home.vue',
  'About.vue',
  'products/Products.vue',
  'products/ProductList.vue',
  'cart/Cart.vue',
  'checkout/Checkout.vue',
  'user/Profile/Profile.vue',
  'user/Orders/Orders.vue',
  'user/Wishlist.vue',
  'search/SearchResults.vue',
  'admin/Dashboard.vue',
  'admin/Products.vue',
  'admin/Orders.vue'
];

// Performance monitoring import
const PERF_IMPORT = `import { performanceMonitor } from '@/utils/performanceMonitor.js'`;

// Performance monitoring start
const PERF_START = (pageName) => `
  // Start performance monitoring for ${pageName} page load
  performanceMonitor.startTiming('${pageName}_page_load')`;

// Performance monitoring end
const PERF_END = (pageName) => `
  // End performance monitoring for ${pageName} page load
  const pageLoadTime = performanceMonitor.endTiming('${pageName}_page_load')
  if (pageLoadTime) {
    performanceMonitor.recordMetric('${pageName}_page_load_time', pageLoadTime)
    console.log(\`🚀 ${pageName} page loaded in \${pageLoadTime.toFixed(2)}ms\`)
  }`;

// Add lazy loading to images
function addImageOptimization(content) {
  // Add lazy loading to img tags that don't have it
  content = content.replace(
    /<img\s+([^>]*?)(?!\s*loading\s*=)/gi,
    (match, attributes) => {
      // Skip if already has loading attribute
      if (attributes.includes('loading=')) return match;

      // Determine if it's a critical image
      const isCritical = attributes.includes('hero') ||
                        attributes.includes('logo') ||
                        attributes.includes('avatar');

      if (isCritical) {
        return `<img ${attributes} loading="eager" fetchpriority="high" decoding="sync"`;
      } else {
        return `<img ${attributes} loading="lazy" decoding="async" fetchpriority="low"`;
      }
    }
  );

  return content;
}

// Add GPU acceleration to elements
function addGPUAcceleration(cssContent) {
  // Add will-change and transform to animated elements
  const animatedSelectors = [
    '.button',
    '.card',
    '.modal',
    '.dropdown',
    '.menu',
    '.animation',
    '.transition'
  ];

  let optimizedCSS = cssContent;

  animatedSelectors.forEach(selector => {
    if (optimizedCSS.includes(selector) && !optimizedCSS.includes(`${selector} {\n  will-change: transform;`)) {
      optimizedCSS = optimizedCSS.replace(
        new RegExp(`${selector}\\s*{`, 'g'),
        `${selector} {\n  will-change: transform;\n  transform: translateZ(0);\n  backface-visibility: hidden;`
      );
    }
  });

  return optimizedCSS;
}

// Process a single Vue file
function optimizeVueFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    const fileName = path.basename(filePath, '.vue');
    const pageName = fileName.toLowerCase();

    // Add performance monitoring import if not present
    if (!content.includes('performanceMonitor') && content.includes('<script setup>')) {
      content = content.replace(
        /(<script setup>[\s\S]*?import.*?from.*?\n)/,
        `$1${PERF_IMPORT}\n`
      );
      modified = true;
    }

    // Add performance monitoring to onMounted
    if (content.includes('onMounted') && !content.includes(`${pageName}_page_load`)) {
      // Add start timing
      content = content.replace(
        /(onMounted\(async \(\) => {)/,
        `$1${PERF_START(pageName)}\n`
      );

      // Add end timing at the end of onMounted
      content = content.replace(
        /(onMounted\(async \(\) => {[\s\S]*?)(}\))/,
        `$1${PERF_END(pageName)}\n$2`
      );

      modified = true;
    }

    // Optimize images
    const optimizedImages = addImageOptimization(content);
    if (optimizedImages !== content) {
      content = optimizedImages;
      modified = true;
    }

    // Write back if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Optimized: ${filePath}`);
      return true;
    }

    console.log(`⏭️  Skipped (already optimized): ${filePath}`);
    return false;
  } catch (error) {
    console.error(`❌ Error optimizing ${filePath}:`, error.message);
    return false;
  }
}

// Main optimization function
function optimizeAllPages() {
  console.log('🚀 Starting Vue Performance Optimization...\n');

  let optimizedCount = 0;
  let skippedCount = 0;

  pagesToOptimize.forEach(pageFile => {
    const filePath = path.join(VIEWS_DIR, pageFile);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Not found: ${filePath}`);
      return;
    }

    if (optimizeVueFile(filePath)) {
      optimizedCount++;
    } else {
      skippedCount++;
    }
  });

  console.log('\n📊 Optimization Summary:');
  console.log(`   ✅ Optimized: ${optimizedCount} files`);
  console.log(`   ⏭️  Skipped: ${skippedCount} files`);
  console.log('\n🎉 Performance optimization complete!');
}

// Run optimization
optimizeAllPages();
