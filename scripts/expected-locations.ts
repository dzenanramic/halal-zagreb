/**
 * Obvezni zagrebački zapisi iz specifikacije MVP-a.
 *
 * Služi isključivo za provjeru (`npm run verify:dataset`): potvrđuje da su sve
 * obvezne lokacije učitane iz CSV-a. Nazivi i adrese ovdje su zapisani onako
 * kako ih navodi specifikacija; stvarna vrijednost koja se prikazuje dolazi iz
 * CSV-a, a usporedba se radi neosjetljivo na dijakritiku i razmake.
 */

export interface ExpectedLocation {
  name: string;
  address: string;
  region: 'zagreb-city' | 'zagreb-wider';
}

export const EXPECTED_LOCATIONS: ExpectedLocation[] = [
  { name: 'ANAMARIJA COMPANY d.o.o', address: 'Prelčeva ul. 46, 10360 Sesvete', region: 'zagreb-city' },
  { name: 'ard natural cosmetics', address: 'Nikole Tesle 15, 10000 Zagreb', region: 'zagreb-city' },
  { name: 'Božjakovina d.d.', address: 'Božjakovečka 6, 10370 Božjakovina', region: 'zagreb-wider' },
  { name: 'Dr. Škobić d.o.o.', address: 'Gornji kraj 11, 10430 Samobor', region: 'zagreb-wider' },
  { name: 'Dukat d.d., Tvornica Zagreb', address: 'Ul. Marijana Čavića 9, 10000 Zagreb', region: 'zagreb-city' },
  { name: 'ESPLANADE OLEANDER d.o.o.', address: 'Ul. Antuna Mihanovića 1, 10000 Zagreb', region: 'zagreb-city' },
  { name: 'Euroadria d.o.o.', address: 'Maksimirska cesta 9, 10000 Zagreb', region: 'zagreb-city' },
  { name: 'Franck d.d.', address: 'Vodovodna ul. 20, 10000 Zagreb', region: 'zagreb-city' },
  { name: 'Granolio d.d.', address: 'Budmanijeva ul. 5, 10000 Zagreb', region: 'zagreb-city' },
  { name: 'Hotel Canopy by HILTON', address: 'Ulica Kneza Branimira 29, Zagreb, HR 10000', region: 'zagreb-city' },
  { name: 'Hrvatska industrija šećera d.d.', address: 'Ulica grada Vukovara 269g, 10000 Zagreb', region: 'zagreb-city' },
  { name: 'Ireks Aroma d.o.o.', address: 'Trešnjevka 24, 10450 Jaska', region: 'zagreb-wider' },
  { name: 'KRAŠ, prehrambena industrija d.d. Zagreb', address: 'Ravnice 48, 10000 Zagreb', region: 'zagreb-city' },
  { name: 'Kutrilin d.o.o.', address: 'Radnička cesta 173, 10000 Zagreb', region: 'zagreb-city' },
  { name: 'LUKAČ d.o.o.', address: 'Ostrovička ul. 1, 10000 Zagreb', region: 'zagreb-city' },
  { name: 'MarinaLab Opus d.o.o.', address: 'Kraljevečka c7, 10257 Kupinečki Kraljevec-Brezovica', region: 'zagreb-wider' },
  { name: 'Milla Cosmetics d.o.o', address: 'Krapinska ul. 61, 10298 Donja Bistra', region: 'zagreb-wider' },
  { name: 'MLINAR d.d.', address: 'Radnička cesta 228c, 10000 Zagreb', region: 'zagreb-city' },
  { name: 'Naše klasje d.o.o.', address: 'Raška ul. 35, 10000 Zagreb', region: 'zagreb-city' },
  { name: 'NEW BAKERY d.o.o', address: 'Tratinska ul. 72, 10412 Lukavec', region: 'zagreb-wider' },
  { name: 'O.Š. Matije Gupca', address: 'Ul. Davorina Bazjanca 2, 10000 Zagreb', region: 'zagreb-city' },
  { name: 'OPG Mujakić', address: 'Poljana Čička 87B, 10410 Velika Gorica', region: 'zagreb-wider' },
  {
    name: 'Oui Chef obrt za kuharske usluge i savjetovanje',
    address: 'Ulica Hrvatskog proljeća 22a, 10000 Zagreb',
    region: 'zagreb-city',
  },
  { name: 'PAN-PEK d.o.o', address: 'Planinska ul. 2C, 10000 Zagreb', region: 'zagreb-city' },
  { name: 'PIK Vrbovec plus d.o.o.', address: 'Zagrebačka ul. 148, 10340 Vrbovec', region: 'zagreb-wider' },
  { name: 'Sheraton Zagreb Hotel', address: 'Trg Krešimira Ćosića 9, 10000 Zagreb', region: 'zagreb-city' },
  { name: 'Studio Nine d.o.o.', address: 'Radnička cesta 20 A, Zagreb, Hrvatska', region: 'zagreb-city' },
  { name: 'Svježa hrana d.o.o.', address: 'Horvatova 37, 10000 Zagreb, Hrvatska', region: 'zagreb-city' },
  { name: 'TLK Ekologija d.o.o.', address: 'Ul. bana Josipa Jelačića 25, 10410 Velika Gorica', region: 'zagreb-wider' },
  { name: 'Valipile d.o.o.', address: 'Ive Polite 62, Sesvetski Kraljevec (Zagreb), Hrvatska', region: 'zagreb-city' },
  { name: 'Westin Zagreb Hotel', address: 'Ul. Izidora Kršnjavog 1, 10000 Zagreb', region: 'zagreb-city' },
  { name: 'Zagreb City Hotels d.o.o.', address: 'Ulica grada Vukovara 269a, 10000 Zagreb', region: 'zagreb-city' },
  { name: 'Zvijezda plus d.o.o.', address: 'Ulica Marijana Čavića 1, 10000 Zagreb', region: 'zagreb-city' },
  { name: 'Zvona usluge d.o.o.', address: 'Busovačka ul. 19, 10000 Zagreb', region: 'zagreb-city' },
];

/** Očekivani broj obveznih lokacija iz specifikacije. */
export const EXPECTED_TOTAL = 34;

/** Gradovi i regije koji se ne smiju pojaviti u zagrebačkom skupu. */
export const FORBIDDEN_PLACE_TOKENS = [
  'Rijeka',
  'Split',
  'Osijek',
  'Dubrovnik',
  'Zadar',
  'Pula',
  'Varaždin',
  'Karlovac',
  'Koprivnica',
  'Đakovo',
  'Vinkovci',
  'Slavonski Brod',
  'Požega',
  'Petrinja',
  'Čakovec',
  'Vodice',
  'Zlatar Bistrica',
  'Ludbreg',
  'Warszawa',
];
