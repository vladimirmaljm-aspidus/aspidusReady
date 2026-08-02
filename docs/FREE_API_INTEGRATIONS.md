# Free API Integrations for International Trade

Spisak besplatnih API integracija koje su relevantne za Aspidus Trade Platform.
Svi API-ji imaju prave podatke i solidne free tier limite.

---

## 1. Currency Exchange Rates

### ExchangeRate-API (FREE — 1,500 requests/month)
- **URL**: https://www.exchangerate-api.com
- **Šta radi**: Live i istorijske valutne kurseve (160+ valuta)
- **Free tier**: 1,500 API poziva/mesečno (besplatno, bez kreditne kartice)
- **Korišćenje u Aspidus**:
  - Auto-konverzija cena u različitim valutama u ponudama/fakturama
  - Prikaz trenutnog kursa USD/EUR/AED/RSD na dashboard-u
  - Istorija kurseva za analizu margina
- **Endpoint primer**: `https://v6.exchangerate-api.com/v6/{API_KEY}/latest/USD`
- **Registracija**: https://www.exchangerate-api.com (5 minuta)

### Frankfurter API (FREE — neograničeno, bez API key)
- **URL**: https://www.frankfurter.app
- **Šta radi**: Evropski centralni bank (ECB) kursevi, dnevni
- **Free tier**: Neograničeno, ne zahteva API key
- **Korišćenje**: Istorija kurseva, konverzija u prošlosti
- **Endpoint primer**: `https://api.frankfurter.app/latest?from=USD&to=EUR`

---

## 2. Commodity Prices (Cene sirovina)

### CommodityAPI (FREE — 100 requests/month)
- **URL**: https://commodityapi.com
- **Šta radi**: Cene poljoprivrednih proizvoda, metala, energenata
- **Free tier**: 100 poziva/mesečno
- **Pokriva**: Kakao, šećer, pšenica, ulje, bakar, zlato, nafta
- **Korišćenje u Aspidus**:
  - Prikaz trenutnih cena kakaa, šećera na dashboard-u
  - Upozorenja kada cena padne/padne ispod određenog nivoa
  - Pomoć pri određivanju prodajne cene u trade calculator-u
- **Registracija**: https://commodityapi.com

### Alpha Vantage (FREE — 25 requests/day)
- **URL**: https://www.alphavantage.co
- **Šta radi**: Finansijski podaci uključujući commodity futures
- **Free tier**: 25 poziva/dnevno (750/mesečno)
- **Pokriva**: Kakao futures, šećer futures, pšenicu, soju, naftu, zlato
- **Korišćenje**: Praćenje budućih ugovora (futures) za cene robe
- **Endpoint primer**: `https://www.alphavantage.co/query?function=CORN&apikey={KEY}`
- **Registracija**: https://www.alphavantage.co/support/#api-key

---

## 3. Shipping & Container Tracking

### SeaRates Tracking API (FREE — 100 requests/month)
- **URL**: https://www.searates.com
- **Šta radi**: Praćenje kontejnera u realnom vremenu (MAERSK, MSC, CMA CGM, itd.)
- **Free tier**: 100 poziva/mesečno
- **Pokriva**: 150+ shipping linija
- **Korišćenje u Aspidus**:
  - Auto-praćenje kontejnera u Logistics modulu
  - ETA ažuriranja
  - Status carinjenja
  - Trenutna lokacija broda
- **Endpoint primer**: `https://sirius.searates.com/tracking?container={NUMBER}&key={KEY}`
- **Registracija**: https://www.searates.com

### Project Fortis (FREE — Microsoft, ograničeno)
- **URL**: https://github.com/microsoft/Project-Fortis
- **Šta radi**: Praćenje brodova, luka
- **Free tier**: Otvoreni kod, neograničeno
- **Napomena**: Samo za velike brodove, ne kontejnere

---

## 4. Country & Trade Regulations

### REST Countries API (FREE — neograničeno, bez API key)
- **URL**: https://restcountries.com
- **Šta radi**: Podaci o svim zemljama (glavni grad, valute, jezici, telefonski pozivni)
- **Free tier**: Neograničeno, bez registracije
- **Korišćenje u Aspidus**:
  - Popunjavanje država u formama (Searchable Select)
  - Auto-dopuna valute na osnovu države
  - Zastave zemalja
- **Endpoint primer**: `https://restcountries.com/v3.1/all?fields=name,cca2,flag,currencies,capital`

### UN Comtrade API (FREE — 500 requests/day)
- **URL**: https://comtradeapi.un.org
- **Šta radi**: zvanični UN podaci o međunarodnoj trgovini
- **Free tier**: 500 poziva/dnevno (15,000/mesečno)
- **Pokriva**: Import/export statistika po HS kodu, zemlji, godini
- **Korišćenje u Aspidus**:
  - Prikaz koliko je neka roba uvezeno/izvezeno u određenu zemlju
  - Trendovi u trgovini
  - Pomoć pri proceni tržišta
- **Endpoint primer**: `https://comtradeapi.un.org/data/v1/get/C/A/HS?...`
- **Registracija**: https://comtradeapi.un.org

### WITS (World Bank) API (FREE — neograničeno)
- **URL**: https://wits.worldbank.org
- **Šta radi**: Svetski bank podaci o tarifama, trgovinskim barijerama
- **Free tier**: Neograničeno
- **Korišćenje**:
  - Carinske stope po HS kodu i zemlji
  - Preferencijalni sporazumi (FTA)
  - Trgovinske restrikcije
- **Registracija**: nije potrebna

---

## 5. Geolocation & Address Autocomplete

### Google Places API (FREEMIUM — $200/mesečni kredit)
- **URL**: https://developers.google.com/maps
- **Šta radi**: Address autocomplete, geocoding, places search
- **Free tier**: $200 kredita mesečno (≈ 5,000 autocomplete poziva)
- **Korišćenje u Aspidus**: Već implementirano u AddressAutocomplete komponenti
- **Registracija**: https://console.cloud.google.com (potrebna kreditna kartica)

### Nominatim/OpenStreetMap (FREE — neograničeno)
- **URL**: https://nominatim.openstreetmap.org
- **Šta radi**: Geocoding, address search (alternativa Google)
- **Free tier**: Neograničeno (1 zahtev/sekundu limit)
- **Korišćenje**: Besplatna alternativa Google Places za autocomplete
- **Napomena**: Manje precizno od Google, ali potpuno besplatno

---

## 6. Email Verification & Validation

### Hunter.io (FREE — 25 requests/month)
- **URL**: https://hunter.io
- **Šta radi**: Provera da li email adresa postoji, pronalaženje email-ova domena
- **Free tier**: 25 provera/mesečno
- **Korišćenje u Aspidus**:
  - Verifikacija partner email-a pre slanja ponude
  - Sprečavanje bounce-ova
- **Registracija**: https://hunter.io

### AbstractAPI Email Validation (FREE — 100 requests/month)
- **URL**: https://www.abstractapi.com/email-validation
- **Šta radi**: Email validacija, detekcija privremenih/lažnih email-ova
- **Free tier**: 100 poziva/mesečno
- **Korišćenje**: Validacija prilikom kreiranja partnera/portal naloga

---

## 7. IBAN & SWIFT/BIC Validation

### IBANAPI (FREE — 100 requests/month)
- **URL**: https://ibanapi.com
- **Šta radi**: IBAN validacija + bank name + SWIFT/BIC lookup
- **Free tier**: 100 poziva/mesečno
- **Korišćenje u Aspidus**: Već imamo naš validator sa 80+ banaka, ali ovo proširuje
- **Napomena**: Naš lokalni validator (src/lib/banking/iban.ts) radi odlično bez API-ja

### SWIFTRef (FREE — limited demo)
- **URL**: https://www.swiftref.com
- **Šta radi**: Zvanični SWIFT/BIC direktorijum
- **Free tier**: Demo pristup
- **Korišćenje**: Provera SWIFT kodova

---

## 8. Shipping Rates & Quotes

### EasyPost API (FREE — 100 shipments/month)
- **URL**: https://www.easypost.com
- **Šta radi**: Usporedba cena dostave (DHL, FedEx, UPS, USPS)
- **Free tier**: 100 pošiljki/mesečno
- **Korišćenje u Aspidus**:
  - Calculating shipping costs in trade calculator
  - Comparing carriers for door-to-door delivery
- **Registracija**: https://www.easypost.com

---

## 9. Port & Maritime Data

### World Port Index (FREE — static dataset)
- **URL**: https://msi.nga.mil
- **Šta radi**: Informacije o 3,700+ morskih luka širom sveta
- **Free tier**: Besplatno (javni podaci)
- **Korišćenje u Aspidus**:
  - Popunjavanje POL/POD polja u ponudama (Searchable Select)
  - Koordinate luka za logistiku
- **Format**: CSV/JSON download

### PortInfo API (FREE — 100 requests/month)
- **URL**: https://portinfo.com
- **Šta radi**: Status luka, vremenski uslovi, gužve
- **Free tier**: 100 poziva/mesečno
- **Korišćenje**: Praćenje statusa luka (zastoji, vremenski uslovi)

---

## 10. Trade Compliance & Sanctions

### OFAC SDN List API (FREE — neograničeno)
- **URL**: https://sanctionssearch.ofac.treas.gov
- **Šta radi**: Provera da li je partner na američkoj listi sankcija
- **Free tier**: Neograničeno (javni podaci)
- **Korišćenje u Aspidus**:
  - AML/KYC provera — auto-proveri partnera pre kreiranja posla
  - Compliance audit log
- **Napomena**: Može se implementirati kao download CSV + local search

### EU Sanctions Map (FREE — neograničeno)
- **URL**: https://webgate.ec.europa.eu/fsd
- **Šta radi**: Evropska lista sankcija
- **Free tier**: Neograničeno
- **Korišćenje**: Kombinacija sa OFAC za kompletnu proveru

---

## 11. Weather (for shipping/logistics)

### OpenWeatherMap API (FREE — 1,000 requests/day)
- **URL**: https://openweathermap.org/api
- **Šta radi**: Trenutno vreme, prognoza, istorija
- **Free tier**: 1,000 poziva/dnevno (30,000/mesečno)
- **Korišćenje u Aspidus**:
  - Vremenski uslovi u lukama (utiče na dostave)
  - Upozorenja za otežane uslove
- **Registracija**: https://openweathermap.org/api

---

## 12. Company Verification

### OpenCorporates API (FREE — 500 requests/month)
- **URL**: https://opencorporates.com
- **Šta radi**: Provera registrovanih firmi širom sveta (140+ jurisdikcija)
- **Free tier**: 500 poziva/mesečno
- **Korišćenje u Aspidus**:
  - KYC — auto-verifikacija da firma postoji
  - Dohvatanje registration number, adresa, direktori
  - Provera da li je firma aktivna/ugravljena
- **Registracija**: https://opencorporates.com

---

## Preporuke — šta implementirati prvo

Na osnovu limita, besplatnosti i korisnosti za Aspidus trade business:

### Prioritet 1 (najveća vrednost, besplatno):
1. **ExchangeRate-API** — auto-konverzija valuta (1,500/mesec)
2. **REST Countries** — države + valute u formama (neograničeno)
3. **UN Comtrade** — trgovinski podaci (500/dan)
4. **OFAC Sanctions** — KYC compliance (neograničeno)

### Prioritet 2 (besplatno ali manji limit):
5. **Alpha Vantage** — cene kakaa, šećera (25/dan)
6. **SeaRates** — tracking kontejnera (100/mesec)
7. **OpenCorporates** — provera firmi (500/mesec)

### Prioritet 3 (zamene za plaćene):
8. **Nominatim/OSM** — besplatna alternativa Google Places
9. **OpenWeatherMap** — vreme u lukama (1,000/dan)
10. **EasyPost** — cene dostave (100/mesec)

---

## Kako se konfiguriše u aplikaciji

Svaki API će imati:
- Polje za API key u Settings → API Integrations
- Test dugme (kao SMTP test)
- Status indikator (povezan/nije povezan)
- Auto-fetch podataka na dashboard/u relevantnim modulima

Kada korisnik odabere koje API-je želi, implementiraćemo ih redom.
