const fs = require('fs');
const path = require('path');
const os = require('os');

const SOCIAL_MEDIA_PATH = path.join(__dirname, '../src/data/socialMedia.json');
const DISK_CACHE_PATH = path.join(os.tmpdir(), 'infoedu_centers_v2.json');

// Load current social media database
let socialMediaMap = {};
if (fs.existsSync(SOCIAL_MEDIA_PATH)) {
  try {
    socialMediaMap = JSON.parse(fs.readFileSync(SOCIAL_MEDIA_PATH, 'utf8'));
  } catch (e) {
    socialMediaMap = {};
  }
}

// Load all 3,672 centers
let allCenters = [];
if (fs.existsSync(DISK_CACHE_PATH)) {
  allCenters = JSON.parse(fs.readFileSync(DISK_CACHE_PATH, 'utf8'));
} else {
  console.error("Cache file not found in /tmp. Exiting.");
  process.exit(1);
}

console.log(`📋 Total centers loaded: ${allCenters.length}`);
console.log(`🔍 Existing centers with social media: ${Object.keys(socialMediaMap).length}`);

// Blacklisted generic accounts to prevent false positives
const BLACKLIST = new Set([
  'gvaeducacio',
  'generalitatvalenciana',
  'gva',
  'educaciongob',
  'mestreacasa',
  'conselldelajuventut',
  'instagram',
  'facebook',
  'twitter',
  'x',
  'youtube',
  'tiktok',
  'linkedin',
  'google',
  'wordpress'
]);

function cleanHandle(handle) {
  if (!handle) return '';
  return handle.toLowerCase().replace(/[^a-z0-9_.-]/g, '');
}

function extractSocialLinks(html) {
  const found = {};
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let m;

  while ((m = hrefRegex.exec(html)) !== null) {
    let raw = m[1].trim();
    if (!raw.startsWith('http')) continue;

    // --- INSTAGRAM ---
    if (raw.includes('instagram.com/') && !found.instagram) {
      const clean = raw.split('?')[0].replace(/\/$/, '');
      const parts = clean.split('instagram.com/')[1] || '';
      const handle = parts.split('/')[0];
      const hClean = cleanHandle(handle);
      if (
        hClean &&
        !BLACKLIST.has(hClean) &&
        !['p', 'reel', 'reels', 'stories', 'explore', 'developer', 'about', 'legal', 'accounts', 'direct'].includes(hClean)
      ) {
        found.instagram = `https://www.instagram.com/${handle}/`;
      }
    }

    // --- FACEBOOK ---
    if ((raw.includes('facebook.com/') || raw.includes('fb.com/')) && !found.facebook) {
      const clean = raw.split('?')[0].replace(/\/$/, '');
      if (
        !clean.includes('/sharer') &&
        !clean.includes('/tr?') &&
        !clean.includes('/dialog') &&
        !clean.includes('/plugins') &&
        !clean.includes('/share.php') &&
        !clean.endsWith('facebook.com')
      ) {
        const parts = clean.split('facebook.com/')[1] || '';
        const hClean = cleanHandle(parts.split('/')[0]);
        if (!BLACKLIST.has(hClean)) {
          found.facebook = clean;
        }
      }
    }

    // --- TWITTER / X ---
    if ((raw.includes('twitter.com/') || raw.includes('x.com/')) && !found.twitter) {
      const clean = raw.split('?')[0].replace(/\/$/, '');
      const parts = (clean.split('twitter.com/')[1] || clean.split('x.com/')[1] || '').split('/')[0];
      const hClean = cleanHandle(parts);
      if (
        hClean &&
        !BLACKLIST.has(hClean) &&
        !['intent', 'share', 'search', 'home', 'hashtag', 'i', 'explore'].includes(hClean)
      ) {
        found.twitter = `https://twitter.com/${parts}`;
      }
    }

    // --- YOUTUBE ---
    if (raw.includes('youtube.com/') && !found.youtube) {
      const clean = raw.split('?')[0].replace(/\/$/, '');
      if (
        clean.includes('/channel/') ||
        clean.includes('/user/') ||
        clean.includes('/c/') ||
        clean.includes('/@')
      ) {
        found.youtube = clean;
      }
    }

    // --- LINKEDIN ---
    if (raw.includes('linkedin.com/') && !found.linkedin) {
      const clean = raw.split('?')[0].replace(/\/$/, '');
      if (clean.includes('/school/') || clean.includes('/company/')) {
        found.linkedin = clean;
      }
    }

    // --- TIKTOK ---
    if (raw.includes('tiktok.com/') && !found.tiktok) {
      const clean = raw.split('?')[0].replace(/\/$/, '');
      const parts = clean.split('tiktok.com/')[1] || '';
      if (parts.startsWith('@')) {
        const hClean = cleanHandle(parts.slice(1));
        if (!BLACKLIST.has(hClean)) {
          found.tiktok = `https://www.tiktok.com/${parts.split('/')[0]}`;
        }
      }
    }
  }

  return found;
}

async function fetchCenter(center) {
  const url = center.url;
  if (!url || !url.startsWith('http')) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      redirect: 'follow'
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const text = await res.text();
    return extractSocialLinks(text);
  } catch (e) {
    clearTimeout(timer);
    return null;
  }
}

async function run() {
  const CONCURRENCY = 45;
  let index = 0;
  let newlyFoundCenters = 0;
  let newProfiles = 0;

  console.log(`\n🚀 Starting sweep of ALL ${allCenters.length} centers with ${CONCURRENCY} workers...`);

  async function worker() {
    while (index < allCenters.length) {
      const center = allCenters[index++];
      const links = await fetchCenter(center);

      if (links && Object.keys(links).length > 0) {
        const prev = socialMediaMap[center.id] || {};
        let modified = false;
        const merged = { ...prev };

        for (const [platform, u] of Object.entries(links)) {
          if (!merged[platform]) {
            merged[platform] = u;
            newProfiles++;
            modified = true;
          }
        }

        if (modified) {
          if (!socialMediaMap[center.id]) {
            newlyFoundCenters++;
          }
          socialMediaMap[center.id] = merged;
        }
      }

      if (index % 100 === 0 || index === allCenters.length) {
        const totalWithSM = Object.keys(socialMediaMap).length;
        console.log(`📊 [${index}/${allCenters.length}] Processed | Total with Social Media: ${totalWithSM} (+${newlyFoundCenters} new centers, +${newProfiles} new profiles)`);
        fs.writeFileSync(SOCIAL_MEDIA_PATH, JSON.stringify(socialMediaMap, null, 2), 'utf8');
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  fs.writeFileSync(SOCIAL_MEDIA_PATH, JSON.stringify(socialMediaMap, null, 2), 'utf8');
  const finalTotal = Object.keys(socialMediaMap).length;
  console.log(`\n🎉 Exhaustive check finished!`);
  console.log(`🏆 Centers with verified social media: ${finalTotal} of ${allCenters.length} (${((finalTotal / allCenters.length) * 100).toFixed(1)}%)`);
  console.log(`✨ Total new profiles added this run: ${newProfiles}`);
}

run();
