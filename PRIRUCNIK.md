# Aspidus — Kompletan korisnički priručnik

Ovaj priručnik pokriva svaku opciju u platformi za svih 4 uloge:
**Super Admin**, **Tenant Admin**, **Obični user (staff)** i **Portal klijent**.

---

## Sadržaj

1. [Uloge i pristup](#1-uloge-i-pristup)
2. [Super Admin — Platforma](#2-super-admin--platforma)
3. [Tenant Admin — Vlasnik radnog prostora](#3-tenant-admin--vlasnik-radnog-prostora)
4. [Obični user (staff)](#4-obični-user-staff)
5. [Portal klijent](#5-portal-klijent)
6. [Sistemi u pozadini](#6-sistemi-u-pozadini)
7. [FAQ i rešavanje problema](#7-faq-i-rešavanje-problema)

---

## 1. Uloge i pristup

Platforma ima **tri nivoa pristupa u glavnom sistemu** i **jedan portal**:

| Uloga | URL | Šta može |
|---|---|---|
| **Super Admin** | `/` | Ceo sistem, svi tenanti, plaćanje, tenant setup |
| **Tenant Admin** (`role="admin"`) | `/` | Sve u svojoj kompaniji, upravljanje user-ima svog tenanta |
| **Regular User** (`role="user"`) | `/` | Samo ono što mu admin dozvoli permisijama |
| **Portal klijent** | `/portal/login` | Poseban interfejs za spoljne partnere/kupce (4 tier-a) |

Uloga se čuva u `users.role` koloni. **`super_admin` nema tenant** — on je iznad svih.

---

## 2. Super Admin — Platforma

Super Admin je jedini nalog koji vidi **sve tenante** i može da menja plan/cenu/module bilo kom klijentu.

### 2.1 Ulogovanje

- URL: `https://aspidus.onrender.com/`
- Unesi username + password
- Direktno ideš na Dashboard sa **Platform sekcijom** u sidebar-u

### 2.2 Sidebar — Platform sekcija (samo za super_admin)

| Stavka | Šta radi |
|---|---|
| **System Overview** | Broj tenanata, korisnika, partnera, dokumenata. Health check baze. Aktivne sesije. Nedavne aktivnosti. |
| **Tenants** | Lista svih tenanata (radnih prostora). Ovde kreiraš, menjaš plan, brišeš tenante. |
| **Feature Flags** | Za svaki tenant, uključi/isključi module (CRM, Trade, Portal, Logistics, KYC, itd.) i postavi limite (max users, max partners, max monthly docs). |
| **Plan Upgrade Queue** | Zahtevi za promenu plana koje šalju tenant admini. Klikni pending zahtev → odobri / odbij + note. |

### 2.3 Tenant Management (Tenants view)

**Kreiranje novog tenanta:**
1. Klikni **"New tenant"**
2. Unesi obavezno: Name, Currency, Country
3. Opciono: Legal name, Tax ID, VAT, Registration number, Address, Bank details, Logo
4. **Subscription & Settings sekcija:**
   - **Plan** — Trial / Starter / Business / Enterprise / **Custom**
   - **Status** — Active / Suspended / Cancelled
   - **Max users** — koliko user naloga tenant može da ima
   - **Trial days** — koliko dana traje trial (default 10, 0 = preskoči trial)
   - **Trial ends at** — datum isteka trial-a (auto-postavlja se ako je Plan=trial i Trial days > 0)
   - **Subscription end** — datum isteka pretplate (postavlja se pri approve upgrade zahteva ili ručno)
   - **Primary color** — brend boja tenant-a (koristi se u PDF-ovima)
5. Klikni **Save**

**Šta se automatski dešava kod kreiranja:**
- Ako je Plan=trial → `trial_ends_at = today + trial_days`
- `feature_flags` red se pravi automatski sa podrazumevanim modulima za dati plan
- Tenant status default = "trial" ako je plan trial

**Custom plan:** ako izabereš `custom`, feature flags se NE sinhronizuju sa planovima automatski. Ti ručno postaviš svaki modul u Feature Flags view-u za taj tenant. Koristi se za VIP klijente sa neuobičajenim setom modula.

**Izmena tenanta:**
- Klikni Edit ikonicu → menjaj isto polja
- Ako promeniš `plan` iz Trial → Starter/Business/Enterprise, feature flags se **automatski** re-sinhronizuju
- Ako promeniš `trial_days` na tenant-u koji je i dalje na trial-u → `trial_ends_at` se ponovo obračuna
- Feature flag cache se briše → tenant admin vidi novi plan u roku od 1 minuta

**Brisanje tenanta:**
- Klikni Delete ikonicu → potvrdi
- **Kaskadno** briše sve povezano: users, partners, deals, offers, invoices, documents, portal accounts, logistics requests. Nema restauracije.

### 2.4 Feature Flags view

Ovde per-tenant kontrolišeš:

**Moduli** (checkbox uključi/isključi):
- `module_crm` — Partners, Deals, Offers, Demands
- `module_trade` — Product Catalog, Supplier Offers, Trade Calculator
- `module_finance` — Invoices, Proformas, ERP
- `module_inventory` — Stock movements
- `module_portal` — Klijentski portal
- `module_logistics` — Zahtevi za shipping + tracking
- `module_kyc` — KYC verifikacija klijenata
- `module_document_templates` — Custom PDF layout
- `module_document_verification` — QR kod + hash verifikacija
- `module_vault` — Enkriptovan storage za tajne
- `module_api_keys` — API pristup
- `module_webhooks` — Outbound event notifikacije
- `module_mail_queue` — Transaction email queue
- `module_security` — Sessions, login history, trusted devices

**Limiti:**
- `max_users` — koliko user naloga
- `max_partners` — koliko partnera (0 = neograničeno)
- `max_monthly_documents` — dokumenata mesečno (0 = neograničeno)

**Kada promeniš flag:**
- Server invalidira cache za tog tenanta
- Tenant admin sidebar automatski osvežava svakih 60s → vidi novi modul za ~1 minut

### 2.5 Plan Upgrade Queue

Kad tenant admin klikne "Request Upgrade" u svom Plans view-u, zahtev dolazi ovde.

**Kako se obrađuje:**
1. Filter po statusu: Pending / Approved / Rejected / All
2. Klikni pending red → otvara Review dialog
3. Izbor:
   - **Approve** — tenant plan se odmah menja, `subscription_start` = danas, `subscription_end` = +N meseci (default 12, editable), `trial_ends_at` se briše
   - **Reject** — status → rejected, tenant dobija email + notifikaciju
4. **Note** polje (opciono) — poruka koju tenant admin vidi
5. Approve pokreće: email tenant admin-u, in-app notifikaciju, feature flag re-sync, cache invalidaciju

### 2.6 Cross-tenant alati

Iz Overview sekcije (linkovi):
- **Platform Users** (`/platform-users` — pristupno preko Platform → System Overview → users link)
  - Lista svih user-a iz svih tenanata
  - Klik na usera → **Permission Editor** sheet
  - Menjaj permisije po resursu (partners, offers, users, itd.) sa Read/Create/Update/Delete
  - Ili wildcard `*` za sve
  - **Impersonate** dugmić → super_admin se privremeno "pretvara" u tog usera da vidi šta on vidi (60 min sesija, može se prekinuti)

### 2.7 Impersonate mod

- Kad super_admin impersonira drugog usera, na vrhu ekrana se pojavi **narandžasti banner**: "Impersonating X. Return to super_admin"
- Sve akcije koje se dese u impersonation modu se **audit-uju kao super_admin**, ne kao impersonirani user (bezbednosno)
- Klik "Return" ili istek 60 min → automatski vraćanje

### 2.8 Cron job — subscription-sweep

Automatski se izvršava svakih sat u :15 minut. Šta radi:
- Nalazi tenante `status="trial"` sa `trial_ends_at < now()` → `status = "suspended"`
- Nalazi tenante `status="active"` sa `subscription_end < now()` → `status = "suspended"`
- Suspended tenanti ne mogu se ulogovati (dobijaju 402 sa porukom)

Ručno pokretanje: super_admin može otvoriti `/api/cron/subscription-sweep` u browseru (traži session).

---

## 3. Tenant Admin — Vlasnik radnog prostora

`role="admin"` u users tabeli. Ima **implicitne permisije** za sve non-platform akcije unutar svog tenanta.

### 3.1 Ulogovanje i prvi pogled

- Isti URL: `/`
- Nakon login-a: **Dashboard** sa KPI karticama (Partners, Deals open, Offers active, Invoices unpaid, itd.)
- **Subscription banner na vrhu** ako:
  - Tenant je na trial-u → uvek prikazan sa countdown
  - Pretplata ≤14 dana do isteka → žuto upozorenje
  - Pretplata istekla → crveni pinned block
  - **"Upgrade now"** dugmić vodi u Plans view

### 3.2 Sidebar — sve sekcije koje vidi

Sidebar je organizovan u 10 sekcija (moduli koji tenant nema u planu se sakriju):

| Sekcija | Stavke | Šta rade |
|---|---|---|
| **Overview** | Dashboard, Custom Dashboard, Calendar, Tasks, Quick Notes, Workspace | Ličke home pages + planiranje |
| **Trade** | Product Catalog, Supplier Offers, Trade Calculator | Zavisi od module_trade |
| **CRM** | Partners, Products, Deals, Commissions, Offers, Demands, Inventory | Core prodajne aktivnosti |
| **Finance** | Invoices, Proformas, Document Register, ERP/Accounting | Zavisi od module_finance |
| **Logistics** | Logistics Requests | Zahtevi klijenata za shipping (module_logistics) |
| **Portal Management** | KYC Review, Portal RFQs, Portal Uploads | Ako imaš klijentski portal |
| **Documents** | Documents, Verification, Templates | Deljenje dokumenata sa klijentima |
| **Communication** | Mail Queue, Email Templates, Webhooks, API Integrations | Outbound integracije |
| **Administration** | Users, Settings, Security, Vault, API Keys, Audit, **Plans** | Upravljanje kompanijom |

### 3.3 Partners (klijenti/dobavljači)

**Kreiranje partnera:**
1. Klikni **New Partner**
2. Popuni:
   - Entity type: Company / Individual
   - Type: Buyer / Supplier / Both
   - Name (obavezno)
   - Email, Phone, Website
   - Address, Country
   - Tax ID, VAT number, Registration number
   - Bank details (za slanje faktura)
3. Save → partner se pojavi u listi

**Duplicate prevention:** ako pokušaš isti tax_id ili email u istom tenantu, sistem odbija sa jasnom porukom.

**Partner 360 view** (klikni Maximize ikonicu u tabeli):
- Kompletan pregled partnera na jednom mestu
- Tabovi:
  - **Overview** — KPI + skorasnja aktivnost
  - **Deals** — svi poslovi
  - **Offers** — sve ponude
  - **Invoices** — sve fakture
  - **Documents** — deljeni dokumenti
  - **KYC** — status verifikacije
  - **RFQs** — klijentski zahtevi za kotaciju
  - **Portal Access** — invite / manage klijentski portal
- **Portal Access kartica:**
  - Kreiraj portal invite (email se šalje partneru automatski)
  - Tier picker: Premium / Business / Standard / Basic
  - Change Email (novi login email)
  - Change Tier (promeni nivo pristupa)
  - Reset Password (klijent mora ponovo postaviti šifru)
  - Suspend / Reactivate / Revoke access
- Sve akcije se prate `portal.change_email`, `portal.change_tier`, `portal.reset_password`, `portal.suspend`, `portal.revoke` permisijama (podrazumevano dozvoljene za admin role)

### 3.4 Products

- New Product → Name, SKU, Category, Unit, Price, HS Code, Description
- Duplicate prevention po SKU
- Export CSV
- Kategorije i units su dropdown-i iz reference data-e

### 3.5 Deals

- Kanban-like pipeline sa stage-ovima: Lead / Qualified / Proposal / Negotiation / Won / Lost
- Svaki deal ima: partner, value, currency, expected_close date, owner, notes
- Kad se deal proglasi Won → automatski se može konvertovati u Offer (jedan klik)

### 3.6 Commissions

Ako imaš agente/prodajne kanale koji rade za proviziju:
- **Commission Agents** — kreiraj agente sa % procenta
- **Deal Commissions** — po svakom won dealu, koliko provizije agent dobija
- **Commission Payouts** — evidencija isplata
- **Cascade on cancel** — ako se deal cancel-uje, provizija se automatski void-uje

### 3.7 Offers

Kompletan lifecycle:
- **Draft** → Sent → Accepted / Rejected / Expired
- Sadrži: partner, subject, line items (product, quantity, unit price, discount, tax), totals
- **Send Offer** dugmić: šalje PDF na partner email + snima verzion + audit log
- **View tracking** — kad klijent otvori PDF, `viewed_at` se stampira
- **Document versioning** — svaka izmena čuva prethodnu verziju
- **Convert to Invoice / Proforma** — jedan klik

### 3.8 Invoices & Proformas

- Ista logika kao Offers ali za fakture/proforme
- Auto-numeracija (INV-2026-0001 format, godišnji counter po tenantu)
- **PDF generisanje** sa tenant logom + primary color + letterhead + QR verifikacija
- **Send** → email klijentu sa PDF prilogom
- **Export** → CSV/Excel

### 3.9 Logistics Requests (novi modul)

Ovde vidiš sve zahteve za shipping koje su portal klijenti submitovali.

**Lista sa filterima:** Pending / Quoted / Accepted / In Progress / Completed / Cancelled

**Klik na zahtev → Detail Sheet:**
- **Timeline** — hronologija (created → quoted → in_progress → completed, ko + kada + poruka)
- **Route** — pošiljalac / primalac (adresa, port, kontakt)
- **Cargo** — opis, HS kodovi, težina, volumen, hazardous flag
- **Packing list** — line-by-line (ako klijent submitovao)
- **Quote/Status:**
  - Status dropdown: Pending / Quoted / Accepted / Rejected / In Progress / Completed / Cancelled
  - Price + Currency + Transit days
  - Notes to client (klijent vidi u portalu)
  - Internal notes (samo admin vidi)
- **Shipment tracking sekcija** (za in_progress+):
  - Carrier (Maersk, DHL, MSC…)
  - Carrier reference (booking/BL/AWB)
  - Tracking number
  - Tracking URL
- **Download packing list PDF** — profesionalni A4 sa headerom, shipperom/consignee-om, cargo overview-om, packing list tabelom, totalima
- **Convert to Offer** — jedan klik pretvara zahtev u nacrt Offer-a (subject + linija + notes)
- **Save changes** čuva sve

**Milestone timestamps** se automatski upisuju:
- `quoted_at` kad status pređe u quoted
- `accepted_at` kad accepted
- `shipped_at` kad in_progress
- `delivered_at` kad completed

**Email klijentu:** kad status pređe u `quoted` + postoji cena, klijent automatski dobija profesionalni email "Freight quote ready" sa detaljima.

### 3.10 KYC Review

Kad portal klijent submituje KYC formu:
- Ovde vidiš listu Draft / Submitted / Under Review / Approved / Rejected / Resubmit
- Otvori submisiju → vidiš sve podatke + uploadovane dokumente
- **Approve** → partner.kyc_status = approved, klijent može normalno da koristi portal
- **Reject** → note obavezan, klijent dobija email sa razlogom
- **Resubmit** → klijent može ponovo da edituje i submituje

### 3.11 Portal Uploads

Folder-view svih dokumenata koje su portal klijenti uploadovali:
- Kartica po partneru (broj fajlova + kategorije)
- Klik na karticu → tabela svih fajlova sa filterima (KYC/RFQ/Message/General/Other)
- Download / Soft-delete / Hard-delete
- **Include Deleted** toggle za restauraciju

### 3.12 Portal RFQs

Zahtevi za kotaciju od portal klijenata (odvojeno od Logistics).

### 3.13 Documents

- Custom PDF-ovi koji nisu vezani za Offers/Invoices
- Podeli sa partner-om (visible_to_partner flag)
- Deljene URL-ove partner otvara bez login-a preko `/verify/<code>` verifikacije

### 3.14 ERP / Accounting (ako je module_finance uključen)

- **Chart of Accounts** — konta plan
- **Journal Entries** — knjigovodstveni zapisi (auto-generisani iz Invoices/Deals ili ručno)
- **Bank Accounts** i **Bank Transactions** sa reconciliation
- **Cost Centers**
- **Fiscal Periods** sa Close funkcijom
- **Reports** — P&L, Balance Sheet, Trial Balance

### 3.15 Users (upravljanje staff-om)

- New User → username, email, full_name, role (admin/user/accountant), password
- **Permission editor** za role=user:
  - Grid po resursu (Partners, Offers, Invoices, itd.) sa Read/Create/Update/Delete/Send checkbox-ovima
  - Ili wildcard po resursu (`partners.*` znači sve na partnerima)
- **Limit:** ne možeš imati više user-a od `max_users` iz feature flags-a — sistem odbija sa upgrade porukom

### 3.16 Settings

- **General** — company info, primary color, logo
- **Notifications** — koje događaje pratiti
- **SMTP** — postavi svoj mail server (ili koristi platform-provided)
- **Security policy** — password policy, session timeout
- **Test email** dugmić da proveriš SMTP config

### 3.17 Plans (klijentov pogled)

Kartica sa trenutnim planom + broj dana preostalih (za trial: "X days left on trial", za paid: "X days remaining"). Zatim grid 4 plana (Trial/Starter/Business/Enterprise) sa cenama, limitima, uključenim modulima. Klik na **Request Upgrade** → dialog sa Message poljem → zahtev ide super_admin queue-u.

### 3.18 Audit Log

Svaka akcija u sistemu se loguje: ko, kada, šta, na kom entitetu, sa kog IP-a. Filter po korisniku, entity type, action. Ne može se editovati — samo se čita.

---

## 4. Obični user (staff)

`role="user"`. Vidi samo module i akcije koje mu admin dozvoli u permission editor-u.

### 4.1 Šta obični user vidi

Sidebar filtrira stavke tako da user vidi **samo module za koje ima .read permisiju**. Ako user ima:
- `partners.read` — vidi Partners tab, ali može samo da pregleda; ne može da kreira/menja/briše bez `partners.create/update/delete`
- `offers.read` + `offers.create` + `offers.update` + `offers.send` — kompletan offer workflow ali bez brisanja
- `dashboard.read` — Dashboard je uvek dostupan

### 4.2 Šta obični user NIKAD ne vidi

- Platform sekcija (samo super_admin)
- Users, Settings, Security, Vault, API Keys, Audit (osim ako admin eksplicitno dodeli — retko za user)
- Plans sekciju (samo admin/super_admin)

### 4.3 Upravljanje profilom

- Topbar → profil dropdown → Change Password
- Notifikacije bell u topbar-u za ličke notifikacije

---

## 5. Portal klijent

Portal je **odvojen web interfejs** na `/portal/*` sa svojim login-om (`/portal/login`). Klijenti (partneri kompanija tenant-a) tu vide svoje ponude, dokumenta, mogu submitovati zahteve za kotaciju/shipping/KYC.

### 5.1 Kako klijent dobije pristup

1. Tenant admin u Partner 360 → Portal Access → **Create portal access** + izabere Tier
2. Klikni **Send invite** — klijent dobija email sa link-om `/portal/login?access_id=…`
3. Klijent klikne link → dialog "Set your password" → unese lozinku (min 8 znakova, bez special char zahteva) → **automatski se loguje** i odlazi na `/portal/dashboard`

### 5.2 Tier sistem (4 nivoa)

| Tier | KYC obavezan | Location share | PDF download | RFQ submit |
|---|---|---|---|---|
| **Premium** | ❌ Ne (VIP bypass) | ❌ | ✅ | ✅ |
| **Business** | ✅ | ✅ | ✅ | ✅ |
| **Standard** | ✅ | ✅ | ❌ | ✅ |
| **Basic** | ✅ | ✅ | ❌ | ❌ (read-only) |

Tier menja tenant admin iz Partner 360 → Portal Access → **Change Tier** dugmićem.

### 5.3 KYC (za sve osim Premium)

Klijent ne može da vidi ni ponude ni fakture dok ne završi KYC:
- **Forma** — Legal name, Tax ID, Address, Contact
- **Dokumenta** — Passport / ID / Utility bill / Certificate of incorporation (u zavisnosti od entity_type)
- Upload PDF/JPG/PNG (max 10MB)
- Submit → status "submitted" → čeka approval od tenant admin-a
- Kad se approve → klijent može normalno da koristi portal

### 5.4 Portal navigacija

| Stavka | Opis |
|---|---|
| **Dashboard** | KPI kartice + skorasnja aktivnost + brzi linkovi |
| **My Offers** | Sve ponude klijentu — pregled + download PDF (ako tier dozvoljava) |
| **My Invoices** | Fakture (ako `can_view_invoices=true`) |
| **My Proformas** | Proforme |
| **Messages** | Chat sa tenant admin-om + unread badge u sidebar-u |
| **Notifications** | Sistemske obaveste (novi zahtev, KYC status, quote ready…) |
| **My Documents** | Deljeni dokumenti sa metadata + download |
| **Product Catalog** | Katalog proizvoda tenant-a (ako `can_view_catalog=true`) |
| **Request a Quote** | RFQ forma za neki proizvod iz kataloga |
| **Logistics** | Freight quote zahtevi (NOVO) |
| **KYC Verification** | Forma + upload dokumenata |
| **My Profile / Company Info** | Klijentov profil |

### 5.5 Logistics modul (portal-strana)

Klijent može zatražiti kotaciju za shipping:
1. Klikni **New request**
2. **Transport** — Mode (Sea FCL/LCL / Road FTL/LTL / Air / Rail / Courier / Multimodal), Container type, Incoterm (CIF, FOB, itd.), Urgency, Pickup date, Delivery date
3. **Origin** i **Destination** — Company, Contact, Country, State, City, Postal code / P.O. Box, Address line, Port
   - **Auto-fill iz partner profila** — origin se popuni sam iz klijentove company adrese (može overwrite)
4. **Cargo** — Description, HS codes, Cargo value + currency, Total weight/volume/packages, Hazardous/Temp-controlled/Insurance checkbox-ovi
5. **Packing list** — line-by-line unos (description, HS, pkgs, type, unit kg, dimenzije); totali se automatski računaju
6. **Special instructions** — bilo šta dodatno
7. Submit → tenant admin dobija notifikaciju

**Nakon submit-a:**
- Klijent vidi status trake pored zahteva
- **History ikonica** proširuje timeline (kompletna hronologija sa event-ovima)
- Kad admin unese cenu i pređe na Quoted → klijent dobija **email** + notifikaciju
- Kad admin unese tracking number → klijent vidi Carrier + tracking link direktno na kartici zahteva
- **Duplicate** ikonica — jedan klik za slanje sličnog zahteva (svi podaci se popune, samo promeni destinaciju)
- **Download packing list PDF** ikonica — profesionalan PDF spreman za carinu

### 5.6 Plans (portal strana - nije dostupno)

Portal klijent ne vidi plan opcije — to je za CRM tenant admin-a, ne za spoljne klijente.

### 5.7 Portal odjava

- Topbar → profil dropdown → Sign out
- Automatski logout kada mu admin **suspend** ili **revoke** portal access

---

## 6. Sistemi u pozadini

### 6.1 Pretplate i naplata

**Trial:**
- Kreira se pri prvom tenant sign-up-u ili kad super_admin kreira tenant sa Plan=Trial
- Trajanje: default 10 dana, super_admin ga per-tenant može podesiti (0 = preskoči trial)
- `trial_ends_at` se auto-računa
- Ističe → automatski `status = suspended` (cron sat u :15)

**Paid pretplate:**
- Super_admin approve upgrade zahteva → `subscription_start = today`, `subscription_end = +12 meseci` (editable)
- Cron sat u :15 nakon isteka → `status = suspended`

**Suspended tenant:**
- Svi API pozivi vraćaju 402 sa porukom "Subscription expired. Contact your platform administrator."
- Super_admin i dalje može da im pristupi preko impersonate
- Renewal: super_admin promeni status nazad na Active + postavi novi subscription_end

### 6.2 Permisije (kako se odlučuje ko šta može)

Redosled provere (prvi match win):
1. `role="super_admin"` → sve dozvoljeno
2. `permissions` sadrži `"*"` → sve dozvoljeno
3. `platform.*` permisija → samo super_admin
4. `role="admin"` → sve non-platform akcije dozvoljene (implicitno)
5. Eksplicitno grant (npr. `partners.read`) → dozvoljeno
6. Wildcard na resursu (`partners.*`) → sve na resursu
7. Ništa od gore → 403

### 6.3 Kaskade i cleanup

- Delete tenant → briše sve pripadajuće (users, partners, deals, itd.) osim `audit_logs` (tenant_id → NULL)
- Delete partner → briše portal_access, portal_uploads, KYC submissions
- Delete portal_access → briše sesije klijenta

### 6.4 Baza podataka

- **Multi-tenant** — sve tenant tabele imaju `tenant_id` NOT NULL
- **Tenant immutability trigger** — jednom postavljen tenant_id ne može se menjati (osim SET NULL na tenant delete cascade)
- **RLS** je uključen na svim tabelama sa service_role bypass-om (server API koristi service key)
- **Automatske migracije** — sve idempotentne (`IF NOT EXISTS`)

### 6.5 Emailovi

Templeejti u kodu (`src/lib/email/service.ts`):
- Welcome portal email (invite → set password link)
- Change email potvrda
- KYC status change (approved/rejected)
- Share document
- New message
- Logistics quote ready
- Plan upgrade approved/rejected

Send preko tenant SMTP config-a (Settings → SMTP) ili platform default.

### 6.6 Storage

Supabase Storage bucket-i:
- `kyc-documents` — privat, KYC upload-ovi
- `portal-uploads` — privat, ostali portal upload-ovi
- `tenant-logos` — javan, tenant logotipi

Download samo preko server-generisanog signed URL-a (5 min TTL).

---

## 7. FAQ i rešavanje problema

### 7.1 Klijent ne može da se uloguje

**Simptom:** "Invalid credentials"
1. Da li je `portal_access.status = active`? Ako je invited/suspended/revoked — reset.
2. Da li je `must_set_password = true`? Klijent mora prvo da postavi šifru preko invite link-a.
3. Da li ima više portal_access naloga sa istim email-om u različitim tenant-ovima? Login preusmerava na tenant picker.

### 7.2 "Not permitted" (403) na portal endpoint-u

- Klijentov tier zahteva KYC ali `partner.kyc_status != approved`
- Ili `can_view_offers/invoices/documents` flag je false — proveriti u Partner 360 → Portal Access → Permissions badges

### 7.3 Email se ne šalje

- Settings → SMTP → **Test email** dugmić
- Ako ne radi, proveri SMTP host/port/username/password
- Alternativa: koristi platform default (bez SMTP config-a se koristi platform mailer)

### 7.4 Trial banner pokazuje pogrešan broj dana

Popravljeno u zadnjem deploy-u. Ako i dalje vidiš pogrešno, hard-refresh browser (Ctrl+Shift+R).

### 7.5 Modul se ne pojavljuje u sidebar-u iako bi trebalo

- Proveri Feature Flags za tenant → da li je odgovarajući modul uključen
- Proveri permisije user-a → treba `.read` permisiju za taj resurs
- Refresh sidebar (F5)

### 7.6 Fakture / Ponude PDF ne downloaduje

- Proveri da je tenant primary_color i logo postavljeni (Settings)
- Ako je PDF template deleted → koristi se default

### 7.7 Kako da promenim broj korisnika u tenantu

Super_admin → Feature Flags → izaberi tenant → Max users polje → Save. Ako pokušaš da imaš više user-a nego što limit dozvoljava, kreiranje se odbija.

### 7.8 Kako da vratim izbrisanog tenanta

Ne može — cascade delete je nepovratan. Bekap baze je jedini način.

### 7.9 Kako da dam nekome super_admin pristup

Direktno u bazi: `UPDATE users SET role = 'super_admin', tenant_id = NULL WHERE id = 'xxx';`
Ili preko `/api/setup` endpoint-a pri prvom setup-u.

---

## Kraj priručnika

Za pitanja ili prijavu problema koristi Support kontakt u Settings → Help sekciji, ili se javi platform administratoru.

**Verzija priručnika:** 1.0
**Zadnja izmena:** Avgust 2026
