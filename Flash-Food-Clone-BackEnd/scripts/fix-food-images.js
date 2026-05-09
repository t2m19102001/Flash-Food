// Migrate legacy `image` fields across collections to relative paths.
//
// Old data stored absolute URLs with Vite-hashed filenames, e.g.
//   http://10.8.0.1:8000/uploads/assets/com-suon-...-DiRKWaE7.jpg
// The actual file lives at seed-uploads/<category-folder>/<filename>.jpg
// (without the Vite hash). This script walks every doc with an `image`
// field, strips host + Vite hash, looks the cleaned filename up in
// seed-uploads/* (or uploads/images/ for user uploads), and rewrites the
// field to "uploads/<folder>/<filename>" so the runtime buildImageUrl
// resolves it under same-origin /uploads/.
//
// Run on the server (where MONGO_URI is set):
//   cd Flash-Food-Clone-BackEnd
//   node scripts/fix-food-images.js              # apply
//   node scripts/fix-food-images.js --dry-run    # preview only

import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import foodModel from '../models/foodModel.js';
import categoryModel from '../models/categoryModel.js';
import bannerModel from '../models/bannerModel.js';
import orderModel from '../models/orderModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

const dryRun = process.argv.includes('--dry-run');

// Vite asset hash: filename ends with "-<8 chars>.<ext>" where the 8 chars
// always contain at least one uppercase letter or digit (e.g. -DiRKWaE7).
// Without that constraint, plain Vietnamese names like "...-chi-minh.jpg"
// would be matched and mis-stripped.
const VITE_HASH_RE = /-([A-Za-z0-9_-]{8})(\.[a-zA-Z]+)$/;

const stripHash = (name) => {
  const m = name.match(VITE_HASH_RE);
  if (!m) return name;
  if (!/[A-Z0-9]/.test(m[1])) return name; // not a real Vite hash
  return name.slice(0, -m[0].length) + m[2];
};

const buildSeedMap = () => {
  const map = new Map();
  if (!fs.existsSync(uploadsDir)) return map;
  for (const folder of fs.readdirSync(uploadsDir)) {
    if (folder === 'images') continue; // skip user-upload subfolder
    const folderPath = path.join(uploadsDir, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;
    for (const file of fs.readdirSync(folderPath)) {
      map.set(file, `uploads/${folder}/${file}`);
    }
  }
  return map;
};

const userUploadExists = (filename) => {
  if (!filename) return false;
  return fs.existsSync(path.join(uploadsDir, 'images', filename));
};

const extractFilename = (raw) => {
  if (!raw || typeof raw !== 'string') return null;
  let candidate = raw;
  if (raw.startsWith('http')) {
    try {
      candidate = new URL(raw).pathname;
    } catch {
      return null;
    }
  }
  return candidate.split('/').filter(Boolean).pop() || null;
};

const resolveNewPath = (raw, seedMap) => {
  const filename = extractFilename(raw);
  if (!filename) return null;
  // Try filename as-is first (already clean), then with Vite hash stripped.
  if (seedMap.has(filename)) return seedMap.get(filename);
  const cleaned = stripHash(filename);
  if (cleaned !== filename && seedMap.has(cleaned)) return seedMap.get(cleaned);
  if (userUploadExists(filename)) return `uploads/images/${filename}`;
  return null;
};

// Generic rewriter for top-level `image` field on a document.
const fixDocImage = async (doc, label, seedMap, stats) => {
  const original = doc.image;
  if (!original || typeof original !== 'string') {
    stats.alreadyOk++;
    return;
  }
  const newPath = resolveNewPath(original, seedMap);
  if (!newPath) {
    stats.missed++;
    if (stats.missedSamples.length < 5) {
      stats.missedSamples.push(`${label}: ${original}`);
    }
    return;
  }
  if (doc.image === newPath) {
    stats.alreadyOk++;
    return;
  }
  console.log(`  [${label}]`);
  console.log(`    old: ${original}`);
  console.log(`    new: ${newPath}`);
  if (!dryRun) {
    doc.image = newPath;
    await doc.save();
  }
  stats.fixed++;
};

// Order docs embed items[].image — handle separately.
const fixOrder = async (order, seedMap, stats) => {
  if (!Array.isArray(order.items) || order.items.length === 0) {
    stats.alreadyOk++;
    return;
  }
  let touched = false;
  for (const item of order.items) {
    if (!item || typeof item !== 'object') continue;
    const original = item.image;
    if (!original || typeof original !== 'string') continue;
    const newPath = resolveNewPath(original, seedMap);
    if (!newPath || newPath === original) continue;
    item.image = newPath;
    touched = true;
    console.log(`  [order ${order._id} / ${item.name}]`);
    console.log(`    old: ${original}`);
    console.log(`    new: ${newPath}`);
  }
  if (touched) {
    if (!dryRun) {
      order.markModified('items');
      await order.save();
    }
    stats.fixed++;
  } else {
    stats.alreadyOk++;
  }
};

const runCollection = async (label, model, fixer, seedMap) => {
  console.log(`\n--- ${label} ---`);
  const docs = await model.find({});
  const stats = { fixed: 0, alreadyOk: 0, missed: 0, missedSamples: [] };
  for (const doc of docs) await fixer(doc, seedMap, stats);
  console.log(
    `  ${label}: fixed=${stats.fixed}, already_ok=${stats.alreadyOk}, missed=${stats.missed}`,
  );
  if (stats.missedSamples.length) {
    console.log('  Unmatched samples:');
    stats.missedSamples.forEach((s) => console.log(`    - ${s}`));
  }
  return stats;
};

const main = async () => {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not set in .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to MongoDB${dryRun ? ' (DRY RUN)' : ''}`);

  const seedMap = buildSeedMap();
  const folderCount = new Set([...seedMap.values()].map((v) => v.split('/')[1])).size;
  console.log(`Loaded ${seedMap.size} files across ${folderCount} category folders`);

  await runCollection('food', foodModel, (d, m, s) => fixDocImage(d, d.name, m, s), seedMap);
  await runCollection('category', categoryModel, (d, m, s) => fixDocImage(d, d.name, m, s), seedMap);
  await runCollection('banner', bannerModel, (d, m, s) => fixDocImage(d, d._id.toString(), m, s), seedMap);
  await runCollection('order', orderModel, fixOrder, seedMap);

  await mongoose.disconnect();
  console.log('\nDone.');
};

main().catch((err) => {
  console.error(err);
  mongoose.disconnect();
  process.exit(1);
});
