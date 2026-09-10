/**
 * Provjera sučelja u pregledniku (Chrome headless).
 *
 * Pokretanje:
 *   1. npm run dev            (u drugom terminalu)
 *   2. node scripts/smoke-ui.mjs
 *
 * Skripta provjerava: broj učitanih lokacija, rad filtera i sortiranja,
 * detalje lokacije, prebacivanje jezika, odsutnost trake za pretragu,
 * responzivnost (320/768/1440 px) i konzolne greške, te sprema snimke
 * ekrana u ./screenshots.
 */

import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer-core';

const BASE_URL = process.env.SMOKE_URL ?? 'http://127.0.0.1:5173/';
const CHROME = process.env.CHROME_PATH ?? '/usr/bin/google-chrome';
const SCREENSHOT_DIR = resolve(process.cwd(), 'screenshots');
const EXPECTED_TOTAL = 34;
const EXPECTED_CITY = 25;
const WATCHDOG_MS = 120000;

const problems = [];
const checks = [];

function check(label, condition, detail = '') {
  checks.push({ label, ok: Boolean(condition), detail });
  if (!condition) problems.push(`${label}${detail ? ` - ${detail}` : ''}`);
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Dohvaća element u vidno polje i klikne ga (mobilna emulacija ima uže vidno polje). */
async function clickInView(page, selector) {
  await page.evaluate((sel) => {
    document.querySelector(sel)?.scrollIntoView({ block: 'center', behavior: 'auto' });
  }, selector);
  await wait(120);
  await page.click(selector);
}

async function readCount(page) {
  const text = await page.$eval('.index-bar__count', (node) => node.textContent ?? '');
  const match = text.match(/(\d+)/);
  return match ? Number(match[1]) : Number.NaN;
}

/** Broj kartica koje dijele isti gornji rub (1 = jedna kolona, 3 = tri kolone). */
async function columnsInFirstRow(page, sample) {
  return page.evaluate((count) => {
    const cards = [...document.querySelectorAll('.card')].slice(0, count);
    if (cards.length < count) return 0;
    const tops = cards.map((card) => Math.round(card.getBoundingClientRect().top));
    return tops.filter((top) => top === tops[0]).length;
  }, sample);
}

async function runDesktop(page) {
  await page.setViewport({ width: 1440, height: 960 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.card');

  const cards = await page.$$eval('.card', (nodes) => nodes.length);
  check('Učitano je 34 lokacije', cards === EXPECTED_TOTAL, `pronađeno ${cards}`);
  check('Broj rezultata odgovara', (await readCount(page)) === EXPECTED_TOTAL);

  check(
    'Nema horizontalnog prelijevanja (1440px)',
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  );

  check('Traka za pretragu je uklonjena', (await page.$('#location-search')) === null);

  const statsText = await page.$eval('.stats', (node) => node.textContent ?? '');
  check('Uvod prikazuje stvarne brojeve', statsText.includes('34'), statsText.trim());

  const introHeight = await page.$eval('.intro', (node) => node.getBoundingClientRect().height);
  check('Uvodni blok je kompaktan', introHeight < 420, `${Math.round(introHeight)}px`);

  check('Stranica ima točno jedan h1', (await page.$$eval('h1', (nodes) => nodes.length)) === 1);

  const fonts = await page.evaluate(async () => {
    await document.fonts.ready;
    return {
      marcellus: document.fonts.check('16px Marcellus'),
      inter: document.fonts.check('16px Inter'),
    };
  });
  check('Lokalni fontovi su učitani', fonts.marcellus && fonts.inter, JSON.stringify(fonts));

  check('Tri kolone na 1440px', (await columnsInFirstRow(page, 4)) === 3);

  const sticky = await page.evaluate(() => ({
    sidebar: getComputedStyle(document.querySelector('.filters')).position,
    bar: getComputedStyle(document.querySelector('.index-bar')).position,
  }));
  check('Bočni filteri su ljepljivi', sticky.sidebar === 'sticky', sticky.sidebar);
  check('Traka s rezultatima je ljepljiva', sticky.bar === 'sticky', sticky.bar);

  await page.screenshot({ path: resolve(SCREENSHOT_DIR, 'desktop-1440.png') });
  await page.screenshot({ path: resolve(SCREENSHOT_DIR, 'desktop-1440-full.png'), fullPage: true });

  // Filter područja
  await page.click('input[name="sidebar-region"][value="zagreb-city"]');
  await wait(250);
  check(
    'Filter "Grad Zagreb" daje 25 rezultata',
    (await readCount(page)) === EXPECTED_CITY,
    `prikazano ${await readCount(page)}`,
  );

  const chipLabels = await page.$$eval('.chip__label', (nodes) =>
    nodes.map((node) => node.textContent ?? ''),
  );
  check(
    'Aktivni filter je vidljiv',
    chipLabels.some((label) => label.includes('Zagreb')),
    chipLabels.join(' | '),
  );
  await page.screenshot({ path: resolve(SCREENSHOT_DIR, 'desktop-filter-city.png') });

  await page.click('.chip__remove');
  await wait(250);
  check('Uklanjanje pojedinačnog filtera radi', (await readCount(page)) === EXPECTED_TOTAL);

  // Detalji lokacije
  await clickInView(page, '.card__details');
  await page.waitForSelector('[aria-labelledby="location-details-title"]');
  const detailsText = await page.$eval(
    '[aria-labelledby="location-details-title"]',
    (node) => node.textContent ?? '',
  );
  check('Detalji prikazuju adresu', detailsText.includes('Adresa'));
  check('Detalji ne izmišljaju kontakt podatke', detailsText.includes('Podatak nije dostupan'));
  check(
    'Detalji ne prikazuju gumbe bez podataka',
    !detailsText.includes('Otvori u kartama') && !detailsText.includes('Nazovi'),
  );
  check('Detalji mijenjaju adresu (dijeljiva poveznica)', page.url().includes('#/lokacija/'));
  await page.screenshot({ path: resolve(SCREENSHOT_DIR, 'desktop-details.png') });

  await page.keyboard.press('Escape');
  await wait(250);
  check(
    'Escape zatvara detalje',
    (await page.$('[aria-labelledby="location-details-title"]')) === null,
  );

  // Jezik
  await page.click('.lang-switch__button:nth-child(2)');
  await wait(250);
  const introTitle = await page.$eval('.intro__title', (node) => node.textContent ?? '');
  check(
    'Prebacivanje na engleski mijenja tekst',
    introTitle.includes('Halal-certified places'),
    introTitle.trim(),
  );
  check('HTML lang se mijenja', (await page.evaluate(() => document.documentElement.lang)) === 'en');
  await page.screenshot({ path: resolve(SCREENSHOT_DIR, 'desktop-english.png') });

  await page.click('.lang-switch__button:nth-child(1)');
  await wait(200);

  // Nepoznata lokacija u ruti
  await page.goto(`${BASE_URL}#/lokacija/ne-postoji`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('[aria-labelledby="location-details-title"]');
  const notFoundText = await page.$eval(
    '[aria-labelledby="location-details-title"]',
    (node) => node.textContent ?? '',
  );
  check('Nepoznat identifikator prikazuje jasnu poruku', notFoundText.includes('Lokacija nije pronađena'));
  await page.keyboard.press('Escape');
  await wait(200);

  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.card');

  // Sortiranje
  await page.select('.select', 'name');
  await wait(250);
  const firstCardName = await page.$eval('.card .card__name', (node) => node.textContent ?? '');
  check('Sortiranje po nazivu počinje s "ANAMARIJA"', firstCardName.startsWith('ANAMARIJA'), firstCardName);

  await page.select('.select', 'place');
  await wait(250);
  const firstPlace = await page.$eval('.card .card__meta-place', (node) => node.textContent ?? '');
  check('Sortiranje po mjestu počinje s Božjakovinom', firstPlace.includes('Božjakovina'), firstPlace);

  await page.select('.select', 'relevance');
  await wait(200);

  // Zapis bez kategorije
  await page.click('input[name="sidebar-category"][value="uncategorized"]');
  await wait(250);
  check('Filter "bez kategorije" daje 1 rezultat', (await readCount(page)) === 1);
  const uncategorizedCard = await page.$eval('.card', (node) => node.textContent ?? '');
  check('Zapis bez kategorije jasno je označen', uncategorizedCard.includes('Kategorija nije navedena'));
  await page.screenshot({ path: resolve(SCREENSHOT_DIR, 'desktop-uncategorized.png') });

  // Prazno stanje: Grad Zagreb + OPG (takve kombinacije nema u katalogu)
  await page.click('input[name="sidebar-region"][value="zagreb-city"]');
  await page.click('input[name="sidebar-category"][value="opg"]');
  await wait(300);
  await page.waitForSelector('.state__title');
  const emptyTitle = await page.$eval('.state__title', (node) => node.textContent ?? '');
  check('Prazno stanje je jasno prikazano', emptyTitle.includes('Nema rezultata'), emptyTitle);
  check('Prazno stanje nudi uklanjanje filtera', (await page.$('.state__actions .btn')) !== null);
  await page.screenshot({ path: resolve(SCREENSHOT_DIR, 'desktop-empty.png') });

  await clickInView(page, '.state__actions .btn');
  await wait(300);
  check('Uklanjanje svih filtera vraća sve rezultate', (await readCount(page)) === EXPECTED_TOTAL);
}

async function runTablet(page) {
  await page.setViewport({ width: 768, height: 1024 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.card');

  check(
    'Nema horizontalnog prelijevanja (768px)',
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  );
  check('Dvije kolone na 768px', (await columnsInFirstRow(page, 3)) === 2);
  await page.screenshot({ path: resolve(SCREENSHOT_DIR, 'tablet-768.png') });
}

async function runMobile(page) {
  // Napomena: bez mobilne emulacije (isMobile) jer Chrome tada skalira
  // koordinate i CDP klikovi promašuju element; za provjeru CSS rasporeda
  // je dovoljna širina od 320px.
  await page.setViewport({ width: 320, height: 720 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.card');

  check(
    'Nema horizontalnog prelijevanja (320px)',
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  );
  check('Jedna kolona na 320px', (await columnsInFirstRow(page, 2)) === 1);
  check(
    'Bočni filteri skriveni na mobitelu',
    await page.evaluate(() => getComputedStyle(document.querySelector('.filters')).display === 'none'),
  );
  await page.screenshot({ path: resolve(SCREENSHOT_DIR, 'mobile-320.png') });

  await clickInView(page, '.filters-toggle');
  await page.waitForSelector('[aria-labelledby="filter-drawer-title"]');
  check('Drawer s filterima se otvara na mobitelu', true);
  await page.screenshot({ path: resolve(SCREENSHOT_DIR, 'mobile-320-filters.png') });

  await page.keyboard.press('Escape');
  await wait(250);
  check('Escape zatvara drawer', (await page.$('[aria-labelledby="filter-drawer-title"]')) === null);

  await clickInView(page, '.card__details');
  await page.waitForSelector('[aria-labelledby="location-details-title"]');
  check('Detalji se otvaraju na mobitelu', true);
  await page.screenshot({ path: resolve(SCREENSHOT_DIR, 'mobile-320-details.png') });
  await page.keyboard.press('Escape');
}

let browser = null;

async function closeBrowser() {
  if (browser === null) return;
  try {
    await browser.close();
  } catch {
    // Preglednik je već zatvoren - nije greška.
  }
  browser = null;
}

async function main() {
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
  });

  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(String(error.message)));
  page.on('requestfailed', (request) => {
    consoleErrors.push(`requestfailed ${request.url()} ${request.failure()?.errorText ?? ''}`);
  });

  await runDesktop(page);
  await runTablet(page);
  await runMobile(page);

  check('Nema konzolnih grešaka', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' / '));
}

function printReport() {
  console.log('Provjera sučelja (Chrome headless)');
  console.log(`URL: ${BASE_URL}`);
  for (const entry of checks) {
    console.log(`  ${entry.ok ? 'OK  ' : 'FAIL'} ${entry.label}${entry.ok ? '' : ` (${entry.detail})`}`);
  }
  console.log('');
  console.log(`Snimke ekrana: ${SCREENSHOT_DIR}`);

  if (problems.length > 0) {
    console.error('');
    console.error(`Neuspjele provjere: ${problems.length}`);
    process.exitCode = 1;
    return;
  }

  console.log('Sve provjere su prošle.');
}

const watchdog = setTimeout(() => {
  console.error(`Provjera je prekinuta nakon ${WATCHDOG_MS / 1000}s - nešto se zaglavilo.`);
  void closeBrowser().finally(() => process.exit(1));
}, WATCHDOG_MS);

main()
  .then(printReport)
  .catch((error) => {
    console.error(error);
    console.error('Provjera je prekinuta greškom prije kraja.');
    process.exitCode = 1;
  })
  .finally(async () => {
    clearTimeout(watchdog);
    await closeBrowser();
    process.exit(process.exitCode ?? 0);
  });
