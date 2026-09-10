/**
 * Automatska revizija sučelja u pregledniku.
 *
 * Provjerava pravila dizajna i pristupačnosti koja se ne vide iz koda:
 *   - kontrast teksta (WCAG AA) za svaki element s tekstom,
 *   - zabranjene obrasce (gradijenti, glassmorphism, pill oblici),
 *   - veličinu dodirnih površina na 320px,
 *   - odsutnost emojija i slika (nema stock/AI fotografija),
 *   - vertikalno prelijevanje i horizontalni scroll.
 *
 * Pokretanje: npm run dev (u drugom terminalu) pa `node scripts/audit-ui.mjs`.
 */

import puppeteer from 'puppeteer-core';

const BASE_URL = process.env.SMOKE_URL ?? 'http://127.0.0.1:5173/';
const CHROME = process.env.CHROME_PATH ?? '/usr/bin/google-chrome';

const AUDIT_SCRIPT = () => {
  const parseColor = (value) => {
    const match = value.match(/rgba?\(([^)]+)\)/);
    if (!match) return null;
    const parts = match[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  };

  const luminance = ({ r, g, b }) => {
    const channel = (value) => {
      const v = value / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };

  const contrast = (a, b) => {
    const first = luminance(a);
    const second = luminance(b);
    const lighter = Math.max(first, second);
    const darker = Math.min(first, second);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const backgroundOf = (element) => {
    let node = element;
    while (node && node !== document.documentElement) {
      const color = parseColor(getComputedStyle(node).backgroundColor);
      if (color && color.a > 0.95) return color;
      node = node.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };

  const contrastIssues = [];
  const gradients = new Set();
  const glass = new Set();
  const pill = new Set();

  for (const element of document.querySelectorAll('body *')) {
    const style = getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') continue;

    const backgroundImage = style.backgroundImage ?? '';
    if (backgroundImage.includes('gradient')) {
      gradients.add(`${element.tagName}.${element.className}`);
    }
    if (style.backdropFilter && style.backdropFilter !== 'none') {
      glass.add(`${element.tagName}.${element.className}`);
    }

    const hasOwnText = Array.from(element.childNodes).some(
      (node) => node.nodeType === 3 && (node.textContent ?? '').trim().length > 0,
    );
    if (!hasOwnText) continue;

    const color = parseColor(style.color);
    if (!color || color.a < 0.5) continue;

    const ratio = contrast(color, backgroundOf(element));
    const size = parseFloat(style.fontSize);
    const weight = Number(style.fontWeight) || 400;
    const isLarge = size >= 24 || (size >= 18.66 && weight >= 700);
    const required = isLarge ? 3 : 4.5;

    if (ratio < required) {
      contrastIssues.push({
        text: (element.textContent ?? '').trim().slice(0, 48),
        selector: `${element.tagName.toLowerCase()}.${String(element.className).split(' ').join('.')}`,
        ratio: Math.round(ratio * 100) / 100,
        required,
        fontSize: size,
        fontWeight: weight,
      });
    }
  }

  for (const element of document.querySelectorAll('button, a, .tag, .filter-chip, .lang-switch__button')) {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    if (rect.height === 0) continue;
    const radius = Math.max(
      parseFloat(style.borderTopLeftRadius) || 0,
      parseFloat(style.borderTopRightRadius) || 0,
      parseFloat(style.borderBottomLeftRadius) || 0,
      parseFloat(style.borderBottomRightRadius) || 0,
    );
    if (radius > 10 && radius >= rect.height / 2 - 1) {
      pill.add(`${element.tagName}.${element.className}`);
    }
  }

  const touchTargets = [];
  // Izuzetak: radio/checkbox unutar <label> - stvarna dodirna površina je red
  // koji ga okružuje (.option, min. 44px), a ne sam kvadratić.
  const isInsideLabel = (element) =>
    element.tagName === 'INPUT' && element.closest('label') !== null;
  // Izuzetak: mali gumb za uklanjanje unutar oznake filtera (36px, iznad
  // WCAG 2.5.8 minimuma od 24px) jer bi 44px razbilo kompaktan izgled oznake.
  const isChipRemove = (element) => element.classList.contains('filter-chip__remove');

  for (const element of document.querySelectorAll('button, a[href], input:not([type="hidden"]), select')) {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    if (getComputedStyle(element).visibility === 'hidden') continue;
    if (isInsideLabel(element) || isChipRemove(element)) continue;
    if (rect.height < 44 || rect.width < 32) {
      touchTargets.push({
        selector: `${element.tagName.toLowerCase()}.${String(element.className).split(' ').join('.')}`,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        text: (element.textContent ?? '').trim().slice(0, 24),
      });
    }
  }

  const text = document.body.innerText;
  const emoji = [...text.matchAll(/[\u{1F300}-\u{1FAFF}\u{2190}-\u{21FF}\u{2600}-\u{27BF}\u{FE0F}\u{2B00}-\u{2BFF}]/gu)].map(
    (match) => match[0],
  );

  return {
    contrastIssues,
    gradients: [...gradients],
    glass: [...glass],
    pill: [...pill],
    touchTargets,
    images: document.querySelectorAll('img').length,
    emoji: [...new Set(emoji)],
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    backgroundIsOpaque: getComputedStyle(document.body).backgroundColor,
    fontFamily: getComputedStyle(document.body).fontFamily,
  };
};

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  const failures = [];

  const audit = async (label, width, height, prepare) => {
    // Bez mobilne emulacije: Chrome tada skalira koordinate i klikovi promašuju.
    await page.setViewport({ width, height });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page.waitForSelector('.card');
    if (prepare) {
      await prepare();
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    const result = await page.evaluate(AUDIT_SCRIPT);

    console.log(`\n== ${label} (${width}x${height}) ==`);
    console.log(`  Kontrast ispod granice: ${result.contrastIssues.length}`);
    for (const issue of result.contrastIssues) {
      console.log(
        `    - ${issue.ratio}:1 (potrebno ${issue.required}) ${issue.selector} "${issue.text}" ${issue.fontSize}px/${issue.fontWeight}`,
      );
    }
    console.log(`  Gradijenti: ${result.gradients.length ? result.gradients.join(', ') : 'nema'}`);
    console.log(`  Glassmorphism: ${result.glass.length ? result.glass.join(', ') : 'nema'}`);
    console.log(`  Pill oblici: ${result.pill.length ? result.pill.join(', ') : 'nema'}`);
    console.log(`  Slike (<img>): ${result.images}`);
    console.log(`  Emoji znakovi: ${result.emoji.length ? result.emoji.join(' ') : 'nema'}`);
    console.log(`  Horizontalno prelijevanje: ${result.horizontalOverflow ? 'DA' : 'ne'}`);
    console.log(`  Dodirne površine < 44px: ${result.touchTargets.length}`);
    for (const target of result.touchTargets.slice(0, 12)) {
      console.log(`    - ${target.selector} ${target.width}x${target.height} "${target.text}"`);
    }

    if (result.contrastIssues.length > 0) failures.push(`${label}: kontrast (${result.contrastIssues.length})`);
    if (result.gradients.length > 0) failures.push(`${label}: gradijenti`);
    if (result.glass.length > 0) failures.push(`${label}: glassmorphism`);
    if (result.pill.length > 0) failures.push(`${label}: pill oblici`);
    if (result.images > 0) failures.push(`${label}: slike`);
    if (result.emoji.length > 0) failures.push(`${label}: emoji`);
    if (result.horizontalOverflow) failures.push(`${label}: horizontalno prelijevanje`);
    if (result.touchTargets.length > 0) failures.push(`${label}: dodirne površine (${result.touchTargets.length})`);
  };

  await audit('Desktop', 1440, 960);
  await audit('Mobitel', 320, 720);
  await audit('Detalji lokacije', 1440, 960, async () => {
    await page.evaluate(() => {
      document.querySelector('.card__details')?.scrollIntoView({ block: 'center' });
    });
    await new Promise((resolve) => setTimeout(resolve, 150));
    await page.click('.card__details');
    await page.waitForSelector('[aria-labelledby="location-details-title"]');
  });
  await audit('Drawer s filterima (mobitel)', 320, 720, async () => {
    await page.click('.filters-toggle');
    await page.waitForSelector('[aria-labelledby="filter-drawer-title"]');
  });

  await browser.close();

  console.log('');
  if (failures.length > 0) {
    console.error(`Revizija nije prošla: ${failures.join('; ')}`);
    process.exitCode = 1;
    return;
  }
  console.log('Revizija je prošla: kontrast, oblici, dodirne površine i odsutnost zabranjenih uzoraka.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
