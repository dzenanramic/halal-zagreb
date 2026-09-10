/**
 * Minimalni CSV parser (RFC 4180) bez vanjskih ovisnosti.
 *
 * Podržava: BOM, navodnike oko polja, ugniježđene navodnike ("" -> "),
 * zapise koji se protežu kroz više redaka, CRLF i LF završetke redaka.
 */

export interface CsvRecord {
  /** Redni broj retka u kojem zapis započinje (1 = prvi redak datoteke). */
  line: number;
  values: string[];
}

export interface CsvDocument {
  header: string[];
  records: CsvRecord[];
}

const QUOTE = '"';
const DELIMITER = ',';
const CR = '\r';
const LF = '\n';

/** Razdvaja CSV tekst na zapise i polja. */
export function parseCsvRows(input: string): CsvRecord[] {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  const records: CsvRecord[] = [];

  let values: string[] = [];
  let field = '';
  let insideQuotes = false;
  let line = 1;
  let recordLine = 1;

  const endField = (): void => {
    values.push(field);
    field = '';
  };

  const endRecord = (): void => {
    endField();
    records.push({ line: recordLine, values });
    values = [];
    recordLine = line;
  };

  for (let index = 0; index < text.length; index += 1) {
    const char = text.charAt(index);

    if (insideQuotes) {
      if (char === QUOTE) {
        if (text.charAt(index + 1) === QUOTE) {
          field += QUOTE;
          index += 1;
        } else {
          insideQuotes = false;
        }
      } else {
        if (char === LF) {
          line += 1;
        }
        field += char;
      }
      continue;
    }

    if (char === QUOTE && field.length === 0) {
      insideQuotes = true;
      continue;
    }

    if (char === DELIMITER) {
      endField();
      continue;
    }

    if (char === CR) {
      continue;
    }

    if (char === LF) {
      endRecord();
      line += 1;
      recordLine = line;
      continue;
    }

    field += char;
  }

  if (field.length > 0 || values.length > 0) {
    endRecord();
  }

  return records;
}

/** Vraća true ako su sva polja zapisa prazna (prazni reci u datoteci). */
function isBlank(record: CsvRecord): boolean {
  return record.values.every((value) => value.trim() === '');
}

/** Parsira CSV dokument i odvaja zaglavlje od podatkovnih zapisa. */
export function parseCsv(input: string): CsvDocument {
  const rows = parseCsvRows(input).filter((record) => !isBlank(record));
  const [headerRecord, ...dataRecords] = rows;

  return {
    header: headerRecord ? headerRecord.values.map((value) => value.trim()) : [],
    records: dataRecords,
  };
}

/**
 * Pronalazi indeks stupca prema nazivu, neosjetljivo na velika/mala slova i
 * dijakritiku (npr. "Kategorija" i "kategorija" su isti stupac).
 */
export function findColumn(header: string[], name: string): number {
  const normalize = (value: string): string =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const target = normalize(name);
  return header.findIndex((column) => normalize(column) === target);
}
