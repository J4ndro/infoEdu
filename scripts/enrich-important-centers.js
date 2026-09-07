const fs = require('fs');
const path = require('path');
const os = require('os');

const SOCIAL_MEDIA_PATH = path.join(__dirname, '../src/data/socialMedia.json');
const DISK_CACHE_PATH = path.join(os.tmpdir(), 'infoedu_centers_v2.json');

let socialMediaMap = {};
if (fs.existsSync(SOCIAL_MEDIA_PATH)) {
  socialMediaMap = JSON.parse(fs.readFileSync(SOCIAL_MEDIA_PATH, 'utf8'));
}

const centers = JSON.parse(fs.readFileSync(DISK_CACHE_PATH, 'utf8'));

// Explicit manual additions for known high-profile schools
socialMediaMap['03000424'] = {
  instagram: 'https://www.instagram.com/salesianosaj23/',
  facebook: 'https://www.facebook.com/salesianosalcoyj23/',
  twitter: 'https://twitter.com/SalesianosAJ23',
  youtube: 'https://www.youtube.com/@salesiansj23'
};

socialMediaMap['03000448'] = {
  instagram: 'https://www.instagram.com/lasallealcoi/',
  facebook: 'https://www.facebook.com/LaSalleAlcoi/'
};

socialMediaMap['03004201'] = {
  instagram: 'https://www.instagram.com/maristas.denia/',
  facebook: 'https://www.facebook.com/ColegioMaristasDenia/'
};

socialMediaMap['03004961'] = {
  instagram: 'https://www.instagram.com/carmelitaselche/',
  facebook: 'https://www.facebook.com/CarmelitasElche/'
};

socialMediaMap['12001009'] = {
  instagram: 'https://www.instagram.com/madrevedrunacastellon/',
  facebook: 'https://www.facebook.com/madrevedrunacastellon/'
};

socialMediaMap['46001126'] = {
  instagram: 'https://www.instagram.com/maristasalgemesi/',
  facebook: 'https://www.facebook.com/maristasalgemesi/'
};

socialMediaMap['03001209'] = {
  instagram: 'https://www.instagram.com/colegiosanjosealicante/',
  facebook: 'https://www.facebook.com/colegiosanjosealicante/'
};

socialMediaMap['03001222'] = {
  facebook: 'https://www.facebook.com/sanjosedecarolinas/'
};

socialMediaMap['03008654'] = {
  instagram: 'https://www.instagram.com/carmelitastorrevieja/',
  facebook: 'https://www.facebook.com/carmelitastorrevieja/'
};

socialMediaMap['46000249'] = {
  instagram: 'https://www.instagram.com/colegiosantaanaalbal/',
  facebook: 'https://www.facebook.com/colegiosantaanaalbal/'
};

socialMediaMap['46001254'] = {
  instagram: 'https://www.instagram.com/sagradocorazonalginet/',
  facebook: 'https://www.facebook.com/sagradocorazonalginet/'
};

socialMediaMap['46001941'] = {
  instagram: 'https://www.instagram.com/colegioesclavasbenirredra/',
  facebook: 'https://www.facebook.com/colegioesclavasbenirredra/'
};

// Target missing private/concerted centers that teach Primary, ESO, Bachillerato or FP
const importantMissing = centers.filter(c => {
  if (socialMediaMap[c.id]) return false;
  const isPrivateOrConcerted = c.type === 'Privado' || c.type === 'Concertado';
  const hasSubstantialOffer = c.levels.includes('FP') || c.levels.includes('ESO') || c.levels.includes('Bachillerato') || c.levels.includes('Primaria');
  return isPrivateOrConcerted && hasSubstantialOffer;
});

console.log(`🎯 Searching online profiles for ${importantMissing.length} high-priority schools...`);

async function searchProfilesForCenter(center) {
  const cleanName = center.name
    .replace(/^CENTRE\s+PRIVAT\s+/i, '')
    .replace(/^CENTRO\s+PRIVADO\s+/i, '')
    .replace(/^CEIP\s+/i, '')
    .replace(/^IES\s+/i, '')
    .trim();

  const query = `colegio "${cleanName}" ${center.municipality} instagram facebook`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const html = await res.text();

    const linkRegex = /href=["']([^"']+)["']/g;
    let m;
    const found = {};

    while ((m = linkRegex.exec(html)) !== null) {
      if (!m[1].includes('uddg=')) continue;
      const decoded = decodeURIComponent(m[1].split('uddg=')[1].split('&')[0]);

      // Instagram
      if (decoded.includes('instagram.com/') && !found.instagram) {
        const clean = decoded.split('?')[0].replace(/\/$/, '');
        const parts = clean.split('instagram.com/')[1] || '';
        const handle = parts.split('/')[0];
        if (
          handle &&
          !['p', 'reel', 'reels', 'stories', 'explore', 'popular', 'locations', 'about', 'developer'].includes(handle.toLowerCase())
        ) {
          found.instagram = `https://www.instagram.com/${handle}/`;
        }
      }

      // Facebook
      if (decoded.includes('facebook.com/') && !found.facebook) {
        const clean = decoded.split('?')[0].replace(/\/$/, '');
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
      if ((decoded.includes('twitter.com/') || decoded.includes('x.com/')) && !found.twitter) {
        const clean = decoded.split('?')[0].replace(/\/$/, '');
        const parts = (clean.split('twitter.com/')[1] || clean.split('x.com/')[1] || '').split('/')[0];
        if (
          parts &&
          !['intent', 'share', 'search', 'home', 'hashtag', 'i', 'explore'].includes(parts.toLowerCase())
        ) {
          found.twitter = `https://twitter.com/${parts}`;
        }
      }

      // YouTube
      if (decoded.includes('youtube.com/') && !found.youtube) {
        const clean = decoded.split('?')[0].replace(/\/$/, '');
        if (
          clean.includes('/channel/') ||
          clean.includes('/user/') ||
          clean.includes('/c/') ||
          clean.includes('/@')
        ) {
          found.youtube = clean;
        }
      }
    }

    return Object.keys(found).length > 0 ? found : null;
  } catch (e) {
    return null;
  }
}

async function run() {
  const CONCURRENCY = 10; // Be gentle with search engine
  let index = 0;
  let enriched = 0;

  async function worker() {
    while (index < importantMissing.length) {
      const center = importantMissing[index++];
      const profiles = await searchProfilesForCenter(center);
      if (profiles) {
        socialMediaMap[center.id] = profiles;
        enriched++;
        console.log(`✅ [${enriched}] ${center.name} (${center.municipality}) =>`, Object.keys(profiles).join(', '));
      }
      // Small delay between requests
      await new Promise(r => setTimeout(r, 400));
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  fs.writeFileSync(SOCIAL_MEDIA_PATH, JSON.stringify(socialMediaMap, null, 2), 'utf8');
  console.log(`\n🎉 Finished! Enriched ${enriched} additional schools.`);
  console.log(`Total centers with social media in database: ${Object.keys(socialMediaMap).length}`);
}

run();
