/**
 * Provjera sučelja u pregledniku (Chrome headless).
 *
 * Pokretanje:
 *   1. npm run dev            (u drugom terminalu)
 *   2. npm run smoke:ui
 *
 * Skripta provjerava: broj učitanih lokacija, rad pretrage, filtera i
 * detalja, prebacivanje jezika, nepostojanje horizontalnog prelijevanja,
 * konzolne greške te sprema snimke ekrana u ./screenshots.
 */

import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer-core';

const BASE_URL = process.env.SMOKE_URL ?? 'http://127.0.0.1:5173/';
const CHROME = process.env.CHROME_PATH ?? '/usr/bin/google-chrome';
const SCREENSHOT_DIR = resolve(process.cwd(), 'screenshots');
const EXPECTED_TOTAL = 34;
const EXPECTED_CITY = 25;

const problems = [];
const checks = [];

function check(label, condition, detail = '') {
  checks.push({ label, ok: Boolean(condition), detail });
  if (!condition) problems.push(`${label}${detail ? ` - ${detail}` : ''}`);
}

async function readCount(page) {
  const text = await page.$eval('.toolbar__count', (node) => node.textContent ?? '');
  const match = text.match(/(\d+)/);
  return match ? Number(match[1]) : Number.NaN;
}

async function main() {
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
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

  // --- Desktop ---
  await page.setViewport({ width: 1440, height: 960 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.card');

  const cards = await page.$$eval('.card', (nodes) => nodes.length);
  check('Učitano je 34 lokacije', cards === EXPECTED_TOTAL, `pronađeno ${cards}`);

  const count = await readCount(page);
  check('Broj rezultata odgovara', count === EXPECTED_TOTAL, `prikazano ${count}`);

  const noOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  );
  check('Nema horizontalnog prelijevanja (1440px)', noOverflow);

  const statsText = await page.$eval('.hero__stats', (node) => node.textContent ?? '');
  check('Uvod prikazuje stvarne brojeve', statsText.includes('34'), statsText.trim());

  const heroHeight = await page.$eval('.hero', (node) => node.getBoundingClientRect().height);
  check('Uvodni blok ne zauzima cijeli ekran', heroHeight < 480, `${Math.round(heroHeight)}px`);

  const desktopColumns = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.card')].slice(0, 4);
    if (cards.length < 4) return 0;
    const tops = cards.map((card) => Math.round(card.getBoundingClientRect().top));
    return tops.filter((top) => top === tops[0]).length;
  });
  check('Tri kolone na 1440px', desktopColumns === 3, `kolona u prvom retku: ${desktopColumns}`);

  const sidebarSticky = await page.$eval('.filters', (node) => getComputedStyle(node).position);
  check('Bočni filteri su ljepljivi na desktopu', sidebarSticky === 'sticky', sidebarSticky);

  await page.screenshot({ path: resolve(SCREENSHOT_DIR, 'desktop-1440.png'), fullPage: false });
  await page.screenshot({ path: resolve(SCREENSHOT_DIR, 'desktop-1440-full.png'), fullPage: true });

  // Pretraga
  await page.type('#location-search', 'samobor');
  await new Promise((r) => setTimeout(r, 250));
  const searchCount = await readCount(page);
  check('Pretraga "samobor" daje 1 rezultat', searchCount === 1, `prikazano ${searchCount}`);

  await page.click('.search__clear');
  await new Promise((r) => setTimeout(r, 250));
  const clearedCount = await readCount(page);
  check('Brisanje pretrage vraća sve rezultate', clearedCount === EXPECTED_TOTAL);

  // Filter područja (desktop sidebar)
  await page.click('input[name="sidebar-region"][value="zagreb-city"]');
  await new Promise((r) => setTimeout(r, 250));
  const cityCount = await readCount(page);
  check('Filter "Grad Zagreb" daje 25 rezultata', cityCount === EXPECTED_CITY, `prikazano ${cityCount}`);

  const chipLabels = await page.$$eval('.filter-chip__label', (nodes) =>
    nodes.map((node) => node.textContent ?? ''),
  );
  check('Aktivni filter je vidljiv', chipLabels.some((label) => label.includes('Zagreb')), chipLabels.join(' | '));

  await page.screenshot({ path: resolve(SCREENSHOT_DIR, 'desktop-filter-city.png') });

  // Uklanjanje pojedinačnog filtera
  await page.click('.filter-chip__remove');
  await new Promise((r) => setTimeout(r, 250));
  const afterRemove = await readCount(page);
  check('Uklanjanje pojedinačnog filtera radi', afterRemove === EXPECTED_TOTAL, `prikazano ${afterRemove}`);

  // Detalji lokacije
  await page.click('.card .btn');
  await page.waitForSelector('[aria-labelledby="location-details-title"]');
  const detailsText = await page.$eval(
    '[aria-labelledby="location-details-title"]',
    (node) => node.textContent ?? '',
  );
  check('Detalji prikazuju adresu', detailsText.includes('Adresa'), '');
  check(
    'Detalji ne izmišljaju kontakt podatke',
    detailsText.includes('Podatak nije dostupan'),
  );
  check(
    'Detalji ne prikazuju gumbe bez podataka',
    !detailsText.includes('Otvori u kartama') && !detailsText.includes('Nazovi'),
  );
  const detailsUrl = page.url();
  check('Detalji mijenjaju adresu (dijeljiva poveznica)', detailsUrl.includes('#/lokacija/'), detailsUrl);

  await page.screenshot({ path: resolve(SCREENSHOT_DIR, 'desktop-details.png') });

  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 250));
  const panelClosed = (await page.$('[aria-labelledby="location-details-title"]')) === null;
  check('Escape zatvara detalje', panelClosed);

  // Jezik
  await page.click('.lang-switch__button:nth-child(2)');
  await new Promise((r) => setTimeout(r, 250));
  const heroTitle = await page.$eval('.hero__title', (node) => node.textContent ?? '');
  check('Prebacivanje na engleski mijenja tekst', heroTitle.includes('Find halal-certified'), heroTitle.trim());
  const htmlLang = await page.evaluate(() => document.documentElement.lang);
  check('HTML lang se mijenja', htmlLang === 'en', htmlLang);

  await page.screenshot({ path: resolve(SCREENSHOT_DIR, 'desktop-english.png') });

  await page.click('.lang-switch__button:nth-child(1)');
  await new Promise((r) => setTimeout(r, 200));

  // Nepostojeći identifikator u ruti (duboka poveznica koja ne postoji)
  await page.goto(`${BASE_URL}#/lokacija/ne-postoji`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('[aria-labelledby="location-details-title"]');
  const notFoundText = await page.$eval(
    '[aria-labelledby="location-details-title"]',
    (node) => node.textContent ?? '',
  );
  check('Nepoznat identifikator prikazuje jasnu poruku', notFoundText.includes('Lokacija nije pronađena'));
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 200));
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.card');

  // Sortiranje
  await page.select('.select', 'name');
  await new Promise((r) => setTimeout(r, 250));
  const firstCardName = await page.$eval('.card .card__name', (node) => node.textContent ?? '');
  check('Sortiranje po nazivu počinje s "ANAMARIJA"', firstCardName.startsWith('ANAMARIJA'), firstCardName);

  await page.select('.select', 'place');
  await new Promise((r) => setTimeout(r, 250));
  const firstPlace = await page.$eval('.card .card__place', (node) => node.textContent ?? '');
  check('Sortiranje po mjestu počinje s Božjakovinom', firstPlace.includes('Božjakovina'), firstPlace);

  await page.select('.select', 'relevance');
  await new Promise((r) => setTimeout(r, 200));

  // Kategorija bez vrijednosti
  await page.click('input[name="sidebar-category"][value="uncategorized"]');
  await new Promise((r) => setTimeout(r, 250));
  const uncategorizedCount = await readCount(page);
  check('Filter "bez kategorije" daje 1 rezultat', uncategorizedCount === 1, `prikazano ${uncategorizedCount}`);
  const uncategorizedCard = await page.$eval('.card', (node) => node.textContent ?? '');
  check('Zapis bez kategorije jasno je označen', uncategorizedCard.includes('Kategorija nije navedena'));

  await page.screenshot({ path: resolve(SCREENSHOT_DIR, 'desktop-uncategorized.png') });

  // Prazno stanje
  await page.evaluate(() => {
    const input = document.querySelector('#location-search');
    if (input) {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      ).set;
      setter.call(input, 'pojam-koji-ne-postoji');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await page.waitForSelector('.state__title');
  const emptyTitle = await page.$eval('.state__title', (node) => node.textContent ?? '');
  check('Prazno stanje je jasno prikazano', emptyTitle.includes('Nema rezultata'), emptyTitle);

  await page.screenshot({ path: resolve(SCREENSHOT_DIR, 'desktop-empty.png') });

  // --- Tablet ---
  await page.setViewport({ width: 768, height: 1024 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.card');
  const tabletOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  );
  check('Nema horizontalnog prelijevanja (768px)', tabletOverflow);

  const tabletColumns = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.card')].slice(0, 3);
    if (cards.length < 3) return 0;
    const tops = cards.map((card) => Math.round(card.getBoundingClientRect().top));
    return tops.filter((top) => top === tops[0]).length;
  });
  check('Dvije kolone na 768px', tabletColumns === 2, `kolona u prvom retku: ${tabletColumns}`);

  await page.screenshot({ path: resolve(SCREENSHOT_DIR, 'tablet-768.png'), fullPage: false });

  // --- Mobitel 320px ---
  await page.setViewport({ width: 320, height: 720, isMobile: true, hasTouch: true });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.card');

  const mobileOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  );
  check('Nema horizontalnog prelijevanja (320px)', mobileOverflow);

  const columns = await page.evaluate(() => {
    const first = document.querySelector('.card');
    const second = document.querySelectorAll('.card')[1];
    if (!first || !second) return 1;
    return Math.abs(first.getBoundingClientRect().top - second.getBoundingClientRect().top) < 4 ? 2 : 1;
  });
  check('Jedna kolona na 320px', columns === 1, `kolona: ${columns}`);

  const sidebarHidden = await page.evaluate(() => {
    const sidebar = document.querySelector('.filters');
    return sidebar ? getComputedStyle(sidebar).display === 'none' : false;
  });
  check('Bočni filteri skriveni na mobitelu', sidebarHidden);

  await page.screenshot({ path: resolve(SCREENSHOT_DIR, 'mobile-320.png'), fullPage: false });

  // Drawer s filterima
  await page.click('.filters-toggle');
  await page.waitForSelector('[aria-labelledby="filter-drawer-title"]');
  const drawerVisible = (await page.$('[aria-labelledby="filter-drawer-title"]')) !== null;
  check('Drawer s filterima se otvara na mobitelu', drawerVisible);
  await page.screenshot({ path: resolve(SCREENSHOT_DIR, 'mobile-320-filters.png') });

  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 250));
  const drawerClosed = (await page.$('[aria-labelledby="filter-drawer-title"]')) === null;
  check('Escape zatvara drawer', drawerClosed);

  // Detalji na mobitelu
  await page.click('.card .btn');
  await page.waitForSelector('[aria-labelledby="location-details-title"]');
  await page.screenshot({ path: resolve(SCREENSHOT_DIR, 'mobile-320-details.png') });
  await page.keyboard.press('Escape');

  check('Nema konzolnih grešaka', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' / '));

  await browser.close();

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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
