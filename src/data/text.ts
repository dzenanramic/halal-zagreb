/**
 * Pomoćne funkcije za tekst: sažimanje razmaka, uklanjanje dijakritike i
 * izrada identifikatora. Koriste ih parser, klasifikator područja i pretraga.
 */

/** Sažima sve nizove bjelina u jedan razmak i uklanja razmake s krajeva. */
export function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

const DIACRITIC_MAP: Record<string, string> = {
  đ: 'd',
  Đ: 'd',
  ø: 'o',
  Ø: 'o',
  ł: 'l',
  Ł: 'l',
  ß: 'ss',
  æ: 'ae',
  Æ: 'ae',
};

/**
 * Priprema tekst za pretragu: mala slova, uklonjena dijakritika, sažeti razmaci
 * i uklonjena interpunkcija. Tako "Škobić" i "skobic" daju isti rezultat.
 */
export function foldText(value: string): string {
  const mapped = value.replace(/[đĐøØłŁßæÆ]/g, (char) => DIACRITIC_MAP[char] ?? char);
  return mapped
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Izrađuje URL/ID sigurnu oznaku iz naziva (npr. "KRAŠ, d.d." -> "kras-d-d"). */
export function slugify(value: string): string {
  return foldText(value).replace(/\s+/g, '-').replace(/^-+|-+$/g, '');
}

/** Uklanja razmake unutar brojeva kako bi se "10 000" pretvorilo u "10000". */
export function compactNumbers(value: string): string {
  return value.replace(/(\d)\s+(?=\d)/g, '$1');
}
