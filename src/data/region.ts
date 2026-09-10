/**
 * Klasifikacija područja.
 *
 * Zagrebačka regija ovdje je definirana isključivo adresom i poštanskim brojem
 * iz CSV izvora - nikada sličnošću naziva. Tako "Zlatar Bistrica" (Krapinsko-
 * zagorska županija) ili "Vodice" (Dalmacija) ne ulaze u skup samo zato što
 * podsjećaju na zagrebačka imena.
 *
 * Dva područja u sučelju:
 *  - zagreb-city  - Grad Zagreb (10000 Zagreb, Sesvete 10360, Sesvetski Kraljevec)
 *  - zagreb-wider - Zagrebačka okolica (Velika Gorica, Samobor, Jaska,
 *                   Vrbovec, Božjakovina, Donja Bistra, Kupinečki Kraljevec -
 *                   Brezovica, Lukavec i druga mjesta šire zagrebačke regije)
 */

import { compactNumbers, foldText } from './text.ts';
import type { RegionId } from './types.ts';

interface RegionRule {
  regionId: RegionId;
  /** Naziv mjesta koji se prikazuje u sučelju. */
  place: string;
}

/**
 * Poštanski brojevi zastupljeni u izvoru za zagrebačku regiju.
 * Popis je namjerno eksplicitan: novi poštanski broj znači novu provjeru,
 * a ne automatsko uključivanje.
 */
const POSTAL_CODE_RULES: Record<string, RegionRule> = {
  '10000': { regionId: 'zagreb-city', place: 'Zagreb' },
  '10360': { regionId: 'zagreb-city', place: 'Sesvete' },
  '10370': { regionId: 'zagreb-wider', place: 'Božjakovina' },
  '10257': { regionId: 'zagreb-wider', place: 'Kupinečki Kraljevec - Brezovica' },
  '10298': { regionId: 'zagreb-wider', place: 'Donja Bistra' },
  '10410': { regionId: 'zagreb-wider', place: 'Velika Gorica' },
  '10412': { regionId: 'zagreb-wider', place: 'Lukavec' },
  '10430': { regionId: 'zagreb-wider', place: 'Samobor' },
  '10450': { regionId: 'zagreb-wider', place: 'Jaska (Jastrebarsko)' },
  '10340': { regionId: 'zagreb-wider', place: 'Vrbovec' },
};

/**
 * Naselja koja se koriste kada adresa nema poštanski broj.
 * Redoslijed je bitan: specifičniji naziv mora doći prije općenitijeg
 * ("sesvetski kraljevec" prije "sesvete", "donja bistra" prije "bistra").
 */
const SETTLEMENT_RULES: { match: string; rule: RegionRule }[] = [
  { match: 'sesvetski kraljevec', rule: { regionId: 'zagreb-city', place: 'Sesvetski Kraljevec' } },
  { match: 'sesvete', rule: { regionId: 'zagreb-city', place: 'Sesvete' } },
  { match: 'zagreb', rule: { regionId: 'zagreb-city', place: 'Zagreb' } },
  { match: 'kupinecki kraljevec', rule: { regionId: 'zagreb-wider', place: 'Kupinečki Kraljevec - Brezovica' } },
  { match: 'bozjakovina', rule: { regionId: 'zagreb-wider', place: 'Božjakovina' } },
  { match: 'donja bistra', rule: { regionId: 'zagreb-wider', place: 'Donja Bistra' } },
  { match: 'velika gorica', rule: { regionId: 'zagreb-wider', place: 'Velika Gorica' } },
  { match: 'samobor', rule: { regionId: 'zagreb-wider', place: 'Samobor' } },
  { match: 'jastrebarsko', rule: { regionId: 'zagreb-wider', place: 'Jaska (Jastrebarsko)' } },
  { match: 'jaska', rule: { regionId: 'zagreb-wider', place: 'Jaska (Jastrebarsko)' } },
  { match: 'vrbovec', rule: { regionId: 'zagreb-wider', place: 'Vrbovec' } },
  { match: 'lukavec', rule: { regionId: 'zagreb-wider', place: 'Lukavec' } },
];

/** Poznati nazivi država u izvoru, za prikaz i provjeru potpunosti podataka. */
const COUNTRY_TOKENS: Record<string, string> = {
  croatia: 'Croatia',
  hrvatska: 'Hrvatska',
  poljska: 'Poljska',
};

/** Rezultat klasifikacije jednog zapisa. */
export type AddressClassification =
  | {
      included: true;
      regionId: RegionId;
      place: string;
      matchedBy: 'postal-code' | 'settlement';
      postalCode: string | null;
      country: string | null;
    }
  | {
      included: false;
      reason: 'outside-zagreb-region' | 'unknown-region';
      postalCode: string | null;
      country: string | null;
      detail: string;
    };

/** Izvlači petoznamenkasti poštanski broj iz adrese ("10 000" -> "10000"). */
export function extractPostalCode(address: string): string | null {
  const compacted = compactNumbers(address);
  const match = compacted.match(/(?:^|\D)(\d{5})(?!\d)/);
  return match ? (match[1] ?? null) : null;
}

/** Prepoznaje državu iz adrese ako je u izvoru navedena. */
export function extractCountry(address: string): string | null {
  const folded = foldText(address);
  const tokens = folded.split(' ');
  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    const token = tokens[index];
    if (token === undefined) continue;
    const known = COUNTRY_TOKENS[token];
    if (known !== undefined) {
      return known;
    }
  }
  return null;
}

/**
 * Određuje pripada li adresa Gradu Zagrebu, Zagrebačkoj okolici ili nijednom.
 * Prvo se koristi poštanski broj, a naselje samo kao rezervna provjera.
 */
export function classifyAddress(address: string): AddressClassification {
  const postalCode = extractPostalCode(address);
  const country = extractCountry(address);

  if (postalCode !== null) {
    const rule = POSTAL_CODE_RULES[postalCode];
    if (rule !== undefined) {
      return {
        included: true,
        regionId: rule.regionId,
        place: rule.place,
        matchedBy: 'postal-code',
        postalCode,
        country,
      };
    }
    return {
      included: false,
      reason: 'outside-zagreb-region',
      postalCode,
      country,
      detail: `Poštanski broj ${postalCode} nije u zagrebačkoj regiji.`,
    };
  }

  const folded = foldText(address);
  for (const entry of SETTLEMENT_RULES) {
    if (folded.includes(entry.match)) {
      return {
        included: true,
        regionId: entry.rule.regionId,
        place: entry.rule.place,
        matchedBy: 'settlement',
        postalCode,
        country,
      };
    }
  }

  return {
    included: false,
    reason: 'unknown-region',
    postalCode,
    country,
    detail: 'Adresa ne sadrži poštanski broj ni prepoznato naselje zagrebačke regije.',
  };
}

/** Naziv mjesta iz adrese, bez klasifikacije (koristi se u revizijskom ispisu). */
export function placeOrNull(address: string): string | null {
  const classification = classifyAddress(address);
  return classification.included ? classification.place : null;
}
