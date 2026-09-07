const fs = require('fs');
const path = require('path');
const os = require('os');

const SOCIAL_MEDIA_PATH = path.join(__dirname, '../src/data/socialMedia.json');
const PRIVATE_WEBSITES_PATH = path.join(__dirname, '../src/data/privateWebsites.json');
const DISK_CACHE_PATH = path.join(os.tmpdir(), 'infoedu_centers_v2.json');

// Load existing data
let socialMediaMap = {};
if (fs.existsSync(SOCIAL_MEDIA_PATH)) {
  try {
    socialMediaMap = JSON.parse(fs.readFileSync(SOCIAL_MEDIA_PATH, 'utf8'));
  } catch (e) {
    socialMediaMap = {};
  }
}

let privateWebsites = {};
if (fs.existsSync(PRIVATE_WEBSITES_PATH)) {
  privateWebsites = JSON.parse(fs.readFileSync(PRIVATE_WEBSITES_PATH, 'utf8'));
}

// Gather all center URLs to crawl
const targets = [];
const seenCodes = new Set();

// 1. Private and concerted websites
for (const [code, url] of Object.entries(privateWebsites)) {
  if (url && typeof url === 'string' && url.startsWith('http')) {
    targets.push({ id: code, url });
    seenCodes.add(code);
  }
}

// 2. High-priority public centers (IES, CIPFP, etc.) from disk cache if present
if (fs.existsSync(DISK_CACHE_PATH)) {
  try {
    const centers = JSON.parse(fs.readFileSync(DISK_CACHE_PATH, 'utf8'));
    for (const c of centers) {
      if (!seenCodes.has(c.id) && c.url && c.url.startsWith('http')) {
        // prioritize secondary, IES, CIPFP, colleges
        const isHighPriority = c.levels.includes('FP') || c.levels.includes('ESO') || c.levels.includes('Bachillerato') || c.type === 'Privado' || c.type === 'Concertado';
        if (isHighPriority) {
          targets.push({ id: c.id, url: c.url });
          seenCodes.add(c.id);
        }
      }
    }
  } catch (e) {
    // ignore
  }
}

console.log(`🚀 Starting exhaustive social media extraction across ${targets.length} educational centers...`);

function extractSocialLinks(html) {
  const found = {};
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let m;

  while ((m = hrefRegex.exec(html)) !== null) {
    let raw = m[1].trim();
    if (!raw.startsWith('http')) continue;

    // Instagram
    if (raw.includes('instagram.com/') && !found.instagram) {
      const clean = raw.split('?')[0].replace(/\/$/, '');
      const parts = clean.split('instagram.com/')[1] || '';
      const handle = parts.split('/')[0];
      if (
        handle &&
        !['p', 'reel', 'reels', 'stories', 'explore', 'developer', 'about', 'legal', 'accounts'].includes(handle.toLowerCase())
      ) {
        found.instagram = `https://www.instagram.com/${handle}/`;
      }
    }

    // Facebook
    if ((raw.includes('facebook.com/') || raw.includes('fb.com/')) && !found.facebook) {
      const clean = raw.split('?')[0].replace(/\/$/, '');
      if (
        !clean.includes('/sharer') &&
        !clean.includes('/tr?') &&
        !clean.includes('/dialog') &&
        !clean.includes('/plugins') &&
        !clean.endsWith('facebook.com')
      ) {
        found.facebook = clean;
      }
    }

    // Twitter / X
    if ((raw.includes('twitter.com/') || raw.includes('x.com/')) && !found.twitter) {
      const clean = raw.split('?')[0].replace(/\/$/, '');
      const parts = (clean.split('twitter.com/')[1] || clean.split('x.com/')[1] || '').split('/')[0];
      if (
        parts &&
        !['intent', 'share', 'search', 'home', 'hashtag', 'i', 'explore'].includes(parts.toLowerCase())
      ) {
        found.twitter = `https://twitter.com/${parts}`;
      }
    }

    // YouTube
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

    // LinkedIn
    if (raw.includes('linkedin.com/') && !found.linkedin) {
      const clean = raw.split('?')[0].replace(/\/$/, '');
      if (clean.includes('/school/') || clean.includes('/company/')) {
        found.linkedin = clean;
      }
    }

    // TikTok
    if (raw.includes('tiktok.com/') && !found.tiktok) {
      const clean = raw.split('?')[0].replace(/\/$/, '');
      const parts = clean.split('tiktok.com/')[1] || '';
      if (parts.startsWith('@')) {
        found.tiktok = `https://www.tiktok.com/${parts.split('/')[0]}`;
      }
    }
  }

  return found;
}

async function fetchCenter(target) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(target.url, {
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
  const CONCURRENCY = 35;
  let index = 0;
  let foundCount = 0;
  let newProfilesCount = 0;

  async function worker() {
    while (index < targets.length) {
      const current = targets[index++];
      const links = await fetchCenter(current);

      if (links && Object.keys(links).length > 0) {
        foundCount++;
        const prev = socialMediaMap[current.id] || {};
        const merged = { ...prev };
        let added = false;

        for (const [platform, url] of Object.entries(links)) {
          if (!merged[platform]) {
            merged[platform] = url;
            newProfilesCount++;
            added = true;
          }
        }

        socialMediaMap[current.id] = merged;
      }

      if (index % 50 === 0 || index === targets.length) {
        console.log(`📊 Progress: ${index}/${targets.length} centers processed | ${foundCount} centers with social media (${newProfilesCount} new profiles found)...`);
        fs.writeFileSync(SOCIAL_MEDIA_PATH, JSON.stringify(socialMediaMap, null, 2), 'utf8');
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  fs.writeFileSync(SOCIAL_MEDIA_PATH, JSON.stringify(socialMediaMap, null, 2), 'utf8');
  console.log(`\n🎉 Completed! Total centers with social media in database: ${Object.keys(socialMediaMap).length}`);
}

run();
