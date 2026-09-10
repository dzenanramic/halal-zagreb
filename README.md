# Halal Zagreb (MVP)

Katalog halal-certificiranih lokacija u Zagrebu i Zagrebačkoj okolici.
Aplikacija čita isporučeni registar (`halal-certificirane-tvrtke-excel.csv`),
zadržava samo zapise iz zagrebačke regije i omogućuje pretragu, filtriranje i
pregled detalja.

**Pravilo projekta: nijedan podatak se ne izmišlja.** Ako polje ne postoji u
CSV izvoru (telefon, web, radno vrijeme, koordinate, ocjene, fotografije), ono
se ne prikazuje ili je označeno kao „Nije navedeno” / „Podatak nije dostupan”.

---

## 1. Pokretanje

```bash
npm install
npm run dev            # razvojni poslužitelj: http://127.0.0.1:5173
```

Ostale naredbe:

| Naredba | Što radi |
|---|---|
| `npm run build` | provjera tipova (`tsc --noEmit`) + produkcijska izgradnja u `dist/` |
| `npm run preview` | lokalni pregled izgrađene verzije |
| `npm run typecheck` | samo provjera tipova |
| `npm run verify:dataset` | provjerava da je učitano svih 34 obveznih zagrebačkih lokacija |
| `npm test` | Vitest testovi (parser, klasifikacija područja, pretraga, sortiranje) |
| `node scripts/smoke-ui.mjs` | provjera sučelja u Chromeu (traži pokrenut `npm run dev`) |
| `node scripts/audit-ui.mjs` | revizija kontrasta, oblika i dodirnih površina |

Snimke ekrana iz `smoke-ui.mjs` spremaju se u `screenshots/`.

Aplikacija je pisana za Node 20+ (razvoj) i moderna preglednika
(Chrome/Firefox/Safari). Nema vanjskih servisa, API ključeva ni mrežnih
poziva — svi podaci dolaze iz lokalnog CSV-a.

---

## 2. Struktura implementacije

```
halal-certificirane-tvrtke-excel.csv   izvor podataka (jedini izvor istine)
index.html
src/
  main.tsx                    ulazna točka (React + provider jezika)
  App.tsx                     sastavlja stranicu, drži stanje filtera i ruta
  config.ts                   naziv datoteke izvora i verzija
  data/                       podatkovni sloj (bez Reacta)
    types.ts                  tipovi: Location, Catalog, QueryState, regije
    text.ts                   normalizacija teksta (dijakritika, ID-evi)
    csv.ts                    RFC 4180 parser bez ovisnosti
    region.ts                 klasifikacija područja iz adrese i poštanskog broja
    catalog.ts                izgradnja kataloga, sažeci kategorija i područja
    query.ts                  pretraga, filtriranje, sortiranje
    dataset.ts                uvoz CSV-a u aplikaciju (jedini Vite-specifičan modul)
    loadCatalog.ts            asinkrono učitavanje + greške
    errors.ts                 DatasetError s kodovima
  hooks/
    useCatalog.ts             loading / ready / error stanje podataka
    useRouter.ts              hash rute (#/lokacije, #/o-projektu, #/lokacija/:id)
    useLocationQuery.ts       stanje filtera + aktivni filteri s prijevodima
    useMediaQuery.ts
    useModalBehavior.ts       fokus, Escape, zaključavanje pozadine za panele
    useCopyToClipboard.ts     kopiranje adrese s lokalnim fallbackom
  i18n/
    translations.ts           svi tekstovi (HR i EN) na jednom mjestu
    I18nContext.tsx           jezik, prijevod, pluralizacija, oblikovanje brojeva
  components/                 vidi popis u nastavku
  styles/
    tokens.css                boje, tipografija, razmaci, uzorak
    base.css                  reset, fokus, pomoćne klase
    components.css            stilovi komponenti
scripts/
  verify-dataset.ts           provjera 34 obvezne lokacije
  expected-locations.ts       popis obveznih lokacija iz specifikacije
  smoke-ui.mjs                provjera ponašanja u pregledniku
  audit-ui.mjs                revizija dizajna i pristupačnosti
tests/
  dataset.test.ts             parser, klasifikacija, katalog
  query.test.ts               pretraga, filteri, sortiranje
```

### Glavne komponente

| Komponenta | Odgovornost |
|---|---|
| `AppShell` | okvir stranice, poveznica „preskoči na sadržaj”, `<main>` |
| `Header` | naziv, znak, navigacija, izbornik na mobitelu |
| `LanguageSwitcher` | HR/EN bez ponovnog učitavanja |
| `HeroSearch` | naslov, objašnjenje izvora, pretraga, stvarni brojevi iz kataloga |
| `SearchControls` | broj rezultata, sortiranje, ulaz u filtre na mobitelu |
| `FilterPanel` / `RegionFilter` / `CategoryFilter` | filteri (isti sadržaj u bočnom panelu i u draweru) |
| `FilterDrawer` / `Panel` | klizni panel s fokusom, Escape i zaključanom pozadinom |
| `SortSelect` | relevantnost / naziv / mjesto |
| `ActiveFilters` | aktivni filteri s pojedinačnim uklanjanjem |
| `LocationList` / `LocationCard` | popis i kartice lokacija |
| `LocationDetails` | detalji u ruti `#/lokacija/:id` (panel s desne strane / pri dnu) |
| `LocationActions` | buduće radnje (karta, poziv, web) — aktivne samo uz stvarne podatke |
| `IncompleteDataBadge` | neutralna oznaka nepotpunih podataka |
| `EmptyState` / `LoadingState` / `ErrorState` | prazno, učitavanje i greška |
| `AboutSection` / `Footer` | o projektu i podnožje s izvorom podataka |
| `BrandMark` | geometrijski znak u SVG-u (nije logotip organizacije) |

---

## 3. Kako se određuje Zagreb i Zagrebačka okolica

Područje se **nikada** ne određuje prema sličnosti naziva, nego isključivo iz
adrese i poštanskog broja u CSV-u (`src/data/region.ts`).

1. Prvo se traži petoznamenkasti poštanski broj (podržan je i zapis s razmakom,
   npr. `10 000` → `10000`).
2. Ako poštanski broj postoji, koristi se eksplicitna tablica:

   | Poštanski broj | Mjesto | Područje |
   |---|---|---|
   | 10000 | Zagreb | Grad Zagreb |
   | 10360 | Sesvete | Grad Zagreb |
   | 10370 | Božjakovina | Zagrebačka okolica |
   | 10257 | Kupinečki Kraljevec – Brezovica | Zagrebačka okolica |
   | 10298 | Donja Bistra | Zagrebačka okolica |
   | 10410 | Velika Gorica | Zagrebačka okolica |
   | 10412 | Lukavec | Zagrebačka okolica |
   | 10430 | Samobor | Zagrebačka okolica |
   | 10450 | Jaska (Jastrebarsko) | Zagrebačka okolica |
   | 10340 | Vrbovec | Zagrebačka okolica |

3. Ako poštanskog broja nema, traži se naselje iz adrese
   (npr. „Sesvetski Kraljevec (Zagreb)”, „Radnička cesta 20 A, Zagreb”).
4. Sve ostalo se **isključuje** iz prikaza i bilježi u `catalog.excluded` s
   razlogom (`outside-zagreb-region`, `unknown-region`, `missing-address`).

Zato zapisi poput *Zlatar Bistrica* (Krapinsko-zagorska županija), *Vodice*
(Dalmacija) ili *Nova Gradiška* ostaju izvan skupa iako imena zvuče blizu.

Rezultat na isporučenom CSV-u (92 retka):

* **34 lokacije** u prikazu — 25 u Gradu Zagrebu, 9 u Zagrebačkoj okolici,
* **58 zapisa** izvan opsega (Rijeka, Split, Osijek, Dubrovnik, Zadar, Pula,
  Varaždin, Karlovac, Koprivnica, inozemstvo i dr.).

### Napomena o granici

Kupinečki Kraljevec – Brezovica (10257) upravno pripada Gradu Zagrebu, ali je u
ovoj podjeli, prema definiciji područja iz specifikacije, svrstan u
Zagrebačku okolicu (poštanski prsten 102xx izvan 10000). Pravilo je zapisano na
jednom mjestu u `src/data/region.ts`, pa se promjena svodi na uređivanje jedne
tablice.

---

## 4. Kategorije

Kategorije se izvode iz stvarnih vrijednosti u CSV-u; nijedna se ne dodaje
ručno. Ako zapis nema kategoriju, dobiva interni identifikator `uncategorized`,
a korisniku se prikazuje „Kategorija nije navedena” / „Category not specified”.

Kategorije u zagrebačkom skupu (9):

| Kategorija (izvor) | Engleski | Broj |
|---|---|---|
| Proizvođači | Manufacturers | 19 |
| Hotelijeri | Hotels | 6 |
| Restorani i catering | Restaurants and catering | 3 |
| Trgovina | Retail | 1 |
| Klaonice | Slaughterhouses | 1 |
| Turističke agencije | Travel agencies | 1 |
| Školske ustanove | Schools | 1 |
| OPG | Family farms (OPG) | 1 |
| *(nije navedena)* | *(not specified)* | 1 |

Prijevod se primjenjuje samo na oznake kategorija; nazivi tvrtki i adrese
ostaju u izvornom obliku.

---

## 5. Popis uključenih lokacija (34)

| # | Naziv | Adresa (iz CSV-a) | Kategorija | Mjesto | Područje |
|---|---|---|---|---|---|
| 1 | ANAMARIJA COMPANY d.o.o | Prelčeva ul. 46, 10360, Sesvete, Croatia | Proizvođači | Sesvete | Grad Zagreb |
| 2 | ard natural cosmetics | Nikole Tesle 15, 10000 Zagreb | Trgovina | Zagreb | Grad Zagreb |
| 3 | Dukat d.d., Tvornica Zagreb | Ul. Marijana Čavića 9, 10000, Zagreb, Croatia | Proizvođači | Zagreb | Grad Zagreb |
| 4 | ESPLANADE OLEANDER d.o.o. | Ul. Antuna Mihanovića 1, 10000, Zagreb, Croatia | Hotelijeri | Zagreb | Grad Zagreb |
| 5 | Euroadria d.o.o. | Maksimirska cesta 9, 10000, Zagreb, Croatia | Restorani i catering | Zagreb | Grad Zagreb |
| 6 | Franck d.d. | Vodovodna ul. 20, 10000, Zagreb, Croatia | Proizvođači | Zagreb | Grad Zagreb |
| 7 | Granolio d.d. | Budmanijeva ul. 5, 10000, Zagreb, Croatia | Proizvođači | Zagreb | Grad Zagreb |
| 8 | Hotel Canopy by HILTON | Ulica Kneza Branimira 29, Zagreb, HR 10000 | Hotelijeri | Zagreb | Grad Zagreb |
| 9 | Hrvatska industrija šećera d.d. | Ulica grada Vukovara 269g, 10000 Zagreb | Proizvođači | Zagreb | Grad Zagreb |
| 10 | KRAŠ, prehrambena industrija d.d. Zagreb | Ravnice 48, 10000, Zagreb, Croatia | Proizvođači | Zagreb | Grad Zagreb |
| 11 | Kutrilin d.o.o. | Radnička cesta 173, 10000, Zagreb, Croatia | Proizvođači | Zagreb | Grad Zagreb |
| 12 | LUKAČ d.o.o. | Ostrovička ul. 1, 10000, Zagreb, Croatia | Proizvođači | Zagreb | Grad Zagreb |
| 13 | MLINAR d.d. | Radnička cesta 228c, 10000, Zagreb, Croatia | Proizvođači | Zagreb | Grad Zagreb |
| 14 | Naše klasje d.o.o. | Raška ul. 35, 10000, Zagreb, Croatia | Proizvođači | Zagreb | Grad Zagreb |
| 15 | O.Š. Matije Gupca | Ul. Davorina Bazjanca 2, 10000, Zagreb, Croatia | Školske ustanove | Zagreb | Grad Zagreb |
| 16 | Oui Chef obrt za kuharske usluge i savjetovanje | Ulica Hrvatskog proljeća 22a, 10000 Zagreb, Croatia | Hotelijeri | Zagreb | Grad Zagreb |
| 17 | PAN-PEK d.o.o | Planinska ul. 2C, 10000, Zagreb, Croatia | Proizvođači | Zagreb | Grad Zagreb |
| 18 | Sheraton Zagreb Hotel | Trg Krešimira Ćosića 9, 10000, Zagreb, Croatia | Hotelijeri | Zagreb | Grad Zagreb |
| 19 | Studio Nine d.o.o. | Radnička cesta 20 A, Zagreb, Hrvatska | Turističke agencije | Zagreb | Grad Zagreb |
| 20 | Svježa hrana d.o.o. | Horvatova 37, 10000, Zagreb, Hrvatska | Restorani i catering | Zagreb | Grad Zagreb |
| 21 | Valipile d.o.o. | Ive Polite 62, Sesvetski Kraljevec (Zagreb), Croatia | Proizvođači | Sesvetski Kraljevec | Grad Zagreb |
| 22 | Westin Zagreb Hotel | Ul. Izidora Kršnjavog 1, 10000, Zagreb, Croatia | Hotelijeri | Zagreb | Grad Zagreb |
| 23 | Zagreb City Hotels d.o.o. | Ulica grada Vukovara 269a , 10000 Zagreb | Hotelijeri | Zagreb | Grad Zagreb |
| 24 | Zvijezda plus d.o.o. | Ulica Marijana Čavića 1, 10 000, Zagreb | Proizvođači | Zagreb | Grad Zagreb |
| 25 | Zvona usluge d.o.o. | Busovačka ul. 19, 10000, Zagreb, Croatia | Restorani i catering | Zagreb | Grad Zagreb |
| 26 | Božjakovina d.d. | Božjakovečka 6., 10370 Božjakovina, Hrvatska | Proizvođači | Božjakovina | Zagrebačka okolica |
| 27 | Dr. Škobić d.o.o. | Gornji kraj 11, 10430 Samobor, Hrvatska | *nije navedena* | Samobor | Zagrebačka okolica |
| 28 | Ireks Aroma d.o.o. | Trešnjevka 24, 10450, Jaska, Croatia | Proizvođači | Jaska (Jastrebarsko) | Zagrebačka okolica |
| 29 | MarinaLab Opus d.o.o. | Kraljevečka c7, 10257 Kupinečki Kraljevec-Brezovica | Proizvođači | Kupinečki Kraljevec – Brezovica | Zagrebačka okolica |
| 30 | Milla Cosmetics d.o.o | Krapinska ul. 61, 10298, Donja Bistra, Hrvatska | Proizvođači | Donja Bistra | Zagrebačka okolica |
| 31 | NEW BAKERY d.o.o | Tratinska ul. 72, 10412, Lukavec, Croatia | Proizvođači | Lukavec | Zagrebačka okolica |
| 32 | OPG Mujakić | Poljana Čička 87B, 10410 Velika Gorica | OPG | Velika Gorica | Zagrebačka okolica |
| 33 | PIK Vrbovec plus d.o.o. | Zagrebačka ul. 148, 10340, Vrbovec, Croatia | Klaonice | Vrbovec | Zagrebačka okolica |
| 34 | TLK Ekologija d.o.o. | Ul. bana Josipa Jelačića 25, 10410, Velika Gorica, Hrvatska | Proizvođači | Velika Gorica | Zagrebačka okolica |

Adrese su prikazane točno kako stoje u CSV-u (uključujući razlike u
interpunkciji i navođenju države), uz jedino sažimanje uzastopnih razmaka.
`npm run verify:dataset` ispisuje ovaj popis i provjerava da nijedan zapis nije
izostavljen.

---

## 6. Funkcionalnosti

* **Pretraga** po nazivu, adresi i mjestu — neosjetljiva na velika slova i
  dijakritiku (`sesvete` = `Sesvete`, `skobic` = `Škobić`). Više riječi znači
  logičko I (`zvijezda cavica` pronalazi samo Zvijezdu plus).
* **Filter područja**: sve lokacije / Grad Zagreb / Zagrebačka okolica.
* **Filter kategorije**: sve kategorije, svaka stvarna kategorija iz registra i
  zasebna stavka za zapise bez kategorije.
* **Sortiranje**: relevantnost (rezultat pretrage, bez upita redoslijed iz
  registra), naziv (A–Ž) i mjesto.
* **Aktivni filteri** su uvijek vidljivi i svaki se može ukloniti pojedinačno;
  postoji i „Ukloni sve filtere”.
* **Broj rezultata** se prikazuje stalno i najavljuje čitačima ekrana
  (`aria-live`).
* **Detalji lokacije** otvaraju se u ruti `#/lokacija/:id` (podijeljiva
  poveznica, radi s „natrag” u pregledniku), na mobitelu kao list odozdo, na
  desktopu kao panel s desne strane.
* **Stanja**: učitavanje (skelet), prazni rezultati i greška s ponovnim
  pokušajem i tehničkim detaljem.
* **Jezik**: HR (zadano) i EN, bez ponovnog učitavanja, pamti se u
  `localStorage`.

### Podaci koji se ne prikazuju jer ih izvor ne sadrži

Telefon, web-stranica, radno vrijeme i koordinate. U detaljima su navedeni s
oznakom „Podatak nije dostupan”, a gumbi „Otvori u kartama”, „Nazovi” i
„Posjeti web-stranicu” postoje u kodu (`LocationActions`) i prikazuju se
automatski tek kada izvor bude imao te podatke.

Nema ocjena, zvjezdica, recenzija, broja posjetitelja, radnog vremena,
fotografija ni tvrdnji da je lokacija otvorena.

---

## 7. Ograničenja dataseta

1. **Izvor je jedan CSV bez koordinata.** Zato nema karte, udaljenosti ni
   sortiranja po blizini.
2. **Nema kontakt podataka ni radnog vremena**, pa nema akcija „nazovi”,
   „web” i „otvoreno sada”.
3. **Zapis nije dokaz o trenutnom stanju.** Aplikacija ne provjerava je li
   certifikat valjan ni posluje li tvrtka na navedenoj adresi.
4. **Nepotpuni zapisi.** Tri zapisa imaju oznaku „Nepotpuni podaci”:
   * Dr. Škobić d.o.o. — nema kategoriju,
   * Studio Nine d.o.o. — nema poštanski broj,
   * Valipile d.o.o. — nema poštanski broj.
   Dodatno, sedam zapisa nema navedenu državu; to je vidljivo u detaljima
   („Država: Nije navedeno”), ali se ne broji u oznaku nepotpunih podataka jer
   su svi prikazani zapisi u Hrvatskoj, a područje se određuje iz adrese.
5. **Adrese su neujednačene** (npr. `10000, Zagreb, Croatia` uz
   `10000 Zagreb`). Namjerno se ne prepisuju — prikazuje se vrijednost iz
   izvora.
6. **Naziv zapisa u CSV-u može imati dvostruke razmake** (npr.
   „ANAMARIJA COMPANY  d.o.o”); prikaz sažima razmake, sadržaj ostaje isti.
7. **Nije dokazano da je popis potpun.** Naslov i tekst stranice zato ne tvrde
   da su prikazane sve halal lokacije u Zagrebu.
8. **Klasifikacija područja je ručna tablica.** Novi poštanski broj u izvoru
   zahtijeva unos u `src/data/region.ts`; u suprotnom se zapis isključuje i
   bilježi kao neprepoznat, što je vidljivo u `npm run verify:dataset`.

---

## 8. Proširenja (karta i drugi izvori)

* **Karta.** Kada izvor bude sadržavao koordinate, dovoljno ih je dodati u
  `Location.external.coordinates` (`src/data/types.ts`); u
  `LocationDetails` već postoji predviđeno mjesto za komponentu karte, a
  `LocationActions` automatski uključuje gumb „Otvori u kartama”.
* **Udaljeni izvor.** Postavljanjem `VITE_HALAL_DATA_URL` na CSV istog formata
  (`Naziv, Adresa, Kategorija`) aplikacija prestaje koristiti ugrađenu
  datoteku i dohvaća podatke s mreže; UI sloj ostaje nepromijenjen.
* **Nove kategorije i područja** izvode se automatski iz podataka, bez
  uređivanja komponenti.

---

## 9. Pristupačnost i dizajn

* Mobile-first; provjereno na 320 px, 768 px i 1440 px bez horizontalnog
  prelijevanja.
* Kontrast teksta provjeren automatski (WCAG AA) — `node scripts/audit-ui.mjs`
  ne prijavljuje nijedan element ispod granice.
* Dodirne površine su najmanje 44 px (osim kvadratića radio gumba, gdje je
  površina cijeli red od 44 px, i malog gumba za uklanjanje oznake filtera od
  36 px).
* Vidljiv fokus na svim kontrolama, tipkovnički dostupni paneli (Escape, fokus
  ostaje unutar panela, fokus se vraća na element koji ga je otvorio),
  poveznica „preskoči na sadržaj”, `aria-live` za broj rezultata i stanje
  kopiranja.
* Paleta: topla ivory pozadina, duboka maslinasto-zelena, prigušena terakota i
  tamna grafitna za tekst. Bez gradijenata, glassmorphisma, neona, pill gumba,
  emojija, fotografija i animacija pomicanja stranice.
* Diskretan geometrijski uzorak (osmokraka zvijezda u mreži) koristi se samo u
  uskom pojasu uvodnog bloka, u SVG-u i s niskom prozirnošću.
