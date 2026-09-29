/**
 * Seed script — loads the original 37 countries / 59 branches + head office + admin user
 * into the database.
 *
 * Admin credentials:
 *   username: admin
 *   password: admin
 *
 * Run with: bun run db:seed
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

// ============================================================
// Country + flag + ISO code mapping
// ============================================================
const COUNTRY_META: Record<string, { code: string; flag: string }> = {
  France: { code: 'FR', flag: '🇫🇷' },
  Germany: { code: 'DE', flag: '🇩🇪' },
  Belgium: { code: 'BE', flag: '🇧🇪' },
  Luxembourg: { code: 'LU', flag: '🇱🇺' },
  Spain: { code: 'ES', flag: '🇪🇸' },
  Italy: { code: 'IT', flag: '🇮🇹' },
  Slovakia: { code: 'SK', flag: '🇸🇰' },
  Austria: { code: 'AT', flag: '🇦🇹' },
  Greece: { code: 'GR', flag: '🇬🇷' },
  Norway: { code: 'NO', flag: '🇳🇴' },
  Sweden: { code: 'SE', flag: '🇸🇪' },
  Switzerland: { code: 'CH', flag: '🇨🇭' },
  Netherlands: { code: 'NL', flag: '🇳🇱' },
  Malta: { code: 'MT', flag: '🇲🇹' },
  Denmark: { code: 'DK', flag: '🇩🇰' },
  Finland: { code: 'FI', flag: '🇫🇮' },
  Hungary: { code: 'HU', flag: '🇭🇺' },
  Portugal: { code: 'PT', flag: '🇵🇹' },
  Latvia: { code: 'LV', flag: '🇱🇻' },
  Lithuania: { code: 'LT', flag: '🇱🇹' },
  Croatia: { code: 'HR', flag: '🇭🇷' },
  Estonia: { code: 'EE', flag: '🇪🇪' },
  Iceland: { code: 'IS', flag: '🇮🇸' },
  Liechtenstein: { code: 'LI', flag: '🇱🇮' },
  Bulgaria: { code: 'BG', flag: '🇧🇬' },
  Romania: { code: 'RO', flag: '🇷🇴' },
  Poland: { code: 'PL', flag: '🇵🇱' },
  Slovenia: { code: 'SI', flag: '🇸🇮' },
  Czech: { code: 'CZ', flag: '🇨🇿' },
  USA: { code: 'US', flag: '🇺🇸' },
  'United Kingdom': { code: 'UK', flag: '🇬🇧' },
  China: { code: 'CN', flag: '🇨🇳' },
  Turkey: { code: 'TR', flag: '🇹🇷' },
  Morocco: { code: 'MA', flag: '🇲🇦' },
  India: { code: 'IN', flag: '🇮🇳' },
  Japan: { code: 'JP', flag: '🇯🇵' },
  Mexico: { code: 'MX', flag: '🇲🇽' },
}

// ============================================================
// Branch data — extracted from the original index.html
// (37 countries / 59 branches, unchanged)
// ============================================================
type BranchData = {
  name: string
  city: string
  address: string
  phone: string
  visaCenter: string
  reference?: string
  mapLink?: string
  workingHours?: string
  submissionHours?: string
}

const DATA: { country: string; branches: BranchData[] }[] = [
  {
    country: 'France',
    branches: [
      { name: 'TLScontact – Visa Application Centre Alexandria', city: 'Alexandria', address: '3rd floor, 2 Patrice Lumumba St. Bab Sharky, Alexandria, Egypt', phone: '02 25356763', visaCenter: 'TLScontact', reference: 'https://shorturl.at/5CIuN', mapLink: 'https://maps.app.goo.gl/UgnjJuLXVMwDRR256', workingHours: 'Sun-Thu 8:00 AM - 4:00 PM' },
      { name: 'El-Sheikh Zayed Visa Application Centre', city: 'El-Sheikh Zayed', address: 'Building B9, the 3rd floor, Capital Business Park, Western Periphery of El-Sheikh Zayed City, 6th of October, Egypt', phone: '02 25356763', visaCenter: 'TLScontact', reference: 'https://shorturl.at/IjIWJ', mapLink: 'https://maps.app.goo.gl/2NGiAZuNRcPW2KZs5', workingHours: 'Sun-Thu 8:00 AM - 4:00 PM' },
      { name: 'Hurghada French Visa Application Centre', city: 'Hurghada', address: '291 Mohamed Saied St., Al Kawther Division Unit No. A, on the ground floor of the property, Infront of CIB bank Hurghada, Red Sea, Egypt', phone: '02 25356763', visaCenter: 'TLScontact', reference: 'https://shorturl.at/goB9U', mapLink: 'https://maps.app.goo.gl/cC12zDYmsc9YNwULA', workingHours: 'Sun-Thu 8:00 AM - 4:00 PM' },
      { name: 'El Tagamoa French Visa Application Centre', city: 'New Cairo', address: 'Sodic Eastown EDNC, Building 6, 1st floor, office 2, New Cairo 1, Cairo Governorate, Egypt The entrance gate number is 8 or 9', phone: '02 25356763', visaCenter: 'TLScontact', reference: 'https://shorturl.at/vVONr', mapLink: 'https://maps.app.goo.gl/xnXoMBar8gFWFpNB6', workingHours: 'Sun-Thu 8:00 AM - 4:00 PM' },
    ],
  },
  {
    country: 'Germany',
    branches: [
      { name: 'New Cairo Visa Application Centre', city: 'New Cairo', address: 'Sodic Eastown EDNC, Building 6, 1st floor, office 2, New Cairo 1, Cairo Governorate, Egypt The entrance gate number is 8 or 9', phone: '02 25356764', visaCenter: 'TLScontact', reference: 'https://tinyurl.com/4h7rxtdb', mapLink: 'https://maps.app.goo.gl/sBWmVPRA8JdLAfoF6', workingHours: 'Sun-Thu 8:00 AM - 4:00 PM' },
      { name: 'El-Sheikh Zayed German Visa Application Centre', city: 'El-Sheikh Zayed', address: 'Building B9, the 3rd floor, Capital Business Park, Western Periphery of El-Sheikh Zayed City, 6th of October, Egypt', phone: '02 25356764', visaCenter: 'TLScontact', reference: 'https://tinyurl.com/5c9hm86t', mapLink: 'https://maps.app.goo.gl/mW7ajUTHb6JBvgaR8', workingHours: 'Sun-Thu 8:00 AM - 4:00 PM' },
      { name: 'Alexandria Visa Application Centre', city: 'Alexandria', address: '3rd floor, 2 Patrice Lumumba St. Bab Sharky, Alexandria, Egypt', phone: '0225356764', visaCenter: 'TLScontact', reference: 'https://tinyurl.com/3p5dhpyd', mapLink: 'https://maps.app.goo.gl/imQjdUFnmEqCZbUD8', workingHours: 'Sun-Thu 8:00 AM - 4:00 PM' },
      { name: 'Hurghada German Visa Application Centre', city: 'Hurghada', address: '291. Al Kawther Division Unit No. A, on the ground floor of the property, Infront of CIB bank, beside The Egyptian National Security Agency Hurghada, Red Sea, Egypt', phone: '02 25356764', visaCenter: 'TLScontact', reference: 'https://tinyurl.com/bd822fjj', mapLink: 'https://maps.app.goo.gl/K8eeRcvyhQCwwdui7', workingHours: 'Sun-Thu 8:00 AM - 4:00 PM' },
    ],
  },
  {
    country: 'Belgium',
    branches: [
      { name: 'El-Sheikh Zayed Belgian Visa Application Centre', city: 'El-Sheikh Zayed', address: 'Building B9, the 3rd floor, Capital Business Park, Western Periphery of El-Sheikh Zayed City, 6th of October, Egypt', phone: '02 25356762', visaCenter: 'TLScontact', reference: 'https://visas-be.tlscontact.com/en-us/country/eg/vac/egCAI2be/contact', mapLink: 'https://maps.app.goo.gl/tujvvKK7vuDR2hWz5', workingHours: 'Sun-Thu 8:00 AM - 4:00 PM' },
    ],
  },
  {
    country: 'Luxembourg',
    branches: [
      { name: 'El-Sheikh Zayed Belgian Visa Application Centre', city: 'El-Sheikh Zayed', address: 'Building B9, the 3rd floor, Capital Business Park, Western Periphery of El-Sheikh Zayed City, 6th of October, Egypt', phone: '02 25356762', visaCenter: 'TLScontact', reference: 'https://egypt.blsspainvisa.com/contact.php', mapLink: 'https://maps.app.goo.gl/tujvvKK7vuDR2hWz5', workingHours: 'Sun-Thu 8:00 AM - 4:00 PM' },
    ],
  },
  {
    country: 'Spain',
    branches: [
      { name: 'Spain Visa Application Center- CAIRO', city: 'CAIRO', address: 'Address: 6th floor, Building No. 39, Lebanon Street, Agouza, Giza', phone: '02-33459577, 02-33037810', visaCenter: 'BLS International', reference: 'https://egypt.blsspainvisa.com/contact.php', mapLink: 'https://maps.app.goo.gl/TxGPhy4HCS5NjKFz9', workingHours: 'Sun-Thu 09:00 AM to 03:00 PM' },
      { name: 'Spain Visa Application Center- Alex', city: 'CAIRO', address: 'Qasr Al Salam Building, Intersection of Abdel Salam Aref Street with Shaarawy Street Front of Laurent Tram Station - Office No.11 – 2nd floor- Alexandria / Egyp', phone: '02-33459577, 02-33037810', visaCenter: 'BLS International', reference: 'https://egypt.blsspainvisa.com/contact.php', mapLink: 'https://maps.app.goo.gl/Fe3rz2cEPAesi6kE7', workingHours: 'Sun-Thu 09:00 AM to 03:00 PM' },
    ],
  },
  {
    country: 'Italy',
    branches: [
      { name: 'Almaviva Egypt - CAIRO', city: 'Cairo', address: '20, Elmadinah Elmonawara ST. , Doki, Giza, Cairo', phone: '02 21249234', visaCenter: 'Almaviva', reference: 'https://egy.almaviva-visa.it/offices', mapLink: 'https://maps.app.goo.gl/zgD4pR6twwcMTv2n7', workingHours: 'Sun-Thu 8:00 AM - 5:00 PM' },
      { name: 'Almaviva Egypt - Alexandria', city: 'Alexandria', address: 'Building No. 230 Abdelsalam Aref - Loran - Elraml Awal, Alexandria (in front of the Loran TRAM station)', phone: '02 21249234', visaCenter: 'Almaviva', reference: 'https://egy.almaviva-visa.it/offices', mapLink: 'https://maps.app.goo.gl/3pg89PWuCrhLBJUJ8', workingHours: 'Sun-Thu 8:00 AM - 5:00 PM' },
    ],
  },
  {
    country: 'Slovakia',
    branches: [
      { name: 'Slovakia Visa Application center – Cairo', city: 'CAIRO', address: '6th floor, Building No. 39, Lebanon Street, Agouza, Giza', phone: '02 33459577, 02 33037810', visaCenter: 'BLS International', reference: 'https://blsslovakiavisa.com/egypt/contact_us.php', mapLink: 'https://maps.app.goo.gl/Mpv6NoJL9z3GHM969', workingHours: 'Sun-Thu 09:00 AM to 03:00 PM' },
      { name: 'Slovakia Visa Application center – Alexandria', city: 'Alexandria', address: 'Qasr Al Salam Building, Intersection of Abdel Salam Aref Street with Shaarawy Street Front of Laurent Tram Station - Office No.11 – 2nd floor- Alexandria / Egypt', phone: '02 33459577, 02 33037810', visaCenter: 'BLS International', reference: 'https://blsslovakiavisa.com/egypt/contact_us.php', mapLink: 'https://maps.app.goo.gl/HG6KnUYXkjnxgyid7', workingHours: 'Sun-Thu 09:00 AM to 03:00 PM' },
    ],
  },
  {
    country: 'Austria',
    branches: [
      { name: 'Austria Visa Application Center - Cairo', city: 'Cairo', address: '52 Lebanon St. 5th Floor, Mohandesine, Giza Cairo Egypt', phone: '0248837981', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/aut/attend-centre', mapLink: 'https://maps.app.goo.gl/4fhLQtXt7kw9hUof9', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
      { name: 'Austria Visa Application Center - Alexandria', city: 'Alexandria', address: '62, First floor, Giesh Road, Ibrahimya, Bab Sharki, Alexandria, Egypt', phone: '0248837981', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/aut/attend-centre', mapLink: 'https://maps.app.goo.gl/V5EjXC3LYhYTAFMw8', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
    ],
  },
  {
    country: 'Greece',
    branches: [
      { name: 'Greece Visa Application Center - Cairo', city: 'Cairo', address: '52 Lebanon St. 5th Floor, Mohandesine, Giza Cairo Egypt', phone: '0248837976', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/grc/attend-centre', mapLink: 'https://maps.app.goo.gl/ZWPJaihqs7CuyuFU9', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
      { name: 'Greece Visa Application Center - Alexandria', city: 'Alexandria', address: '62, First floor, Giesh Road, Ibrahimya, Bab Sharki, Alexandria, Egypt', phone: '0248837976', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/grc/attend-centre', mapLink: 'https://maps.app.goo.gl/BM5X5JHtwVQewkdK9', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
    ],
  },
  {
    country: 'Norway',
    branches: [
      { name: 'Norway Visa Application Center - Cairo', city: 'Cairo', address: 'Norway Application center in Cairo. 52 Lebanon St. 5th Floor, Mohandesine, Giza Cairo Egypt', phone: '0248837969', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/nor/attend-centre', mapLink: 'https://maps.app.goo.gl/qeyvL2kr21eKMwtZ9', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
    ],
  },
  {
    country: 'Sweden',
    branches: [
      { name: 'Sweden Visa Application Center - Cairo', city: 'Cairo', address: '52 Lebanon St. 4th Floor, Mohandesine, Giza Cairo Egypt', phone: '0248837967', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/swe/attend-centre', mapLink: 'https://maps.app.goo.gl/EVeH73jxX9JvWkUv6', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
      { name: 'Sweden Visa Application Center - Alexandria', city: 'Alexandria', address: '62, First floor, Giesh Road, Ibrahimya, Bab Sharki, Alexandria, Egypt', phone: '0248837967', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/swe/attend-centre', mapLink: 'https://maps.app.goo.gl/Rvnx5mk2NpPt8HhJ8', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
    ],
  },
  {
    country: 'Switzerland',
    branches: [
      { name: 'Switzerland Visa Application Center - Cairo', city: 'Cairo', address: '52 Lebanon, St, Agouza, Cairo Governorate 3752340', phone: '02 48837966', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/che/attend-centre', mapLink: 'https://maps.app.goo.gl/utSS1twPPjFWknVR6', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
    ],
  },
  {
    country: 'Netherlands',
    branches: [
      { name: 'Netherlands Visa Application Center - Cairo', city: 'Cairo', address: '52 Lebanon St. 4th Floor, Mohandesine, Giza, Egypt', phone: '0248837970', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/nld/attend-centre', mapLink: 'https://maps.app.goo.gl/y6wiRm5o9SnfBDjH8', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
    ],
  },
  {
    country: 'Malta',
    branches: [
      { name: 'Malta Visa Application Center - Cairo', city: 'Cairo', address: '52 Lebanon St. 4th Floor, Mohandesin, Giza.', phone: '0248837971', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/mlt/attend-centre', mapLink: 'https://maps.app.goo.gl/mQxHqNiCY1sU6GTo7', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
      { name: 'Malta Visa Application Center - Alexandria', city: 'Alexandria', address: '62, First floor, Giesh Road, Ibrahimya, Bab Sharki, Alexandria, Egypt', phone: '0248837971', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/mlt/attend-centre', mapLink: 'https://maps.app.goo.gl/tujvvKK7vuDR2hWz5', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
    ],
  },
  {
    country: 'Denmark',
    branches: [
      { name: 'Denmark Visa Application Center - Cairo', city: 'Cairo', address: '52 Lebanon St. 4th Floor, Mohandesine, Giza Cairo Egypt', phone: '0248837973', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/dnk/attend-centre', mapLink: 'https://maps.app.goo.gl/utSS1twPPjFWknVR6', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
      { name: 'Denmark Visa Application Center - Alexandria', city: 'Alexandria', address: '62, First floor, Giesh Road, Ibrahimya, Bab Sharki, Alexandria, Egypt', phone: '0248837973', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/dnk/attend-centre', mapLink: 'https://maps.app.goo.gl/tujvvKK7vuDR2hWz5', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
    ],
  },
  {
    country: 'Finland',
    branches: [
      { name: 'Finland Visa Application Center - Cairo', city: 'Cairo', address: '52 Lebanon St. 4th Floor, Mohandesine, Giza Cairo Egypt', phone: '0248837975', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/fin/attend-centre', mapLink: 'https://maps.app.goo.gl/utSS1twPPjFWknVR6', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
      { name: 'Finland Visa Application Center - Alexandria', city: 'Alexandria', address: '62, First floor, Giesh Road, Ibrahimya, Bab Sharki, Alexandria, Egypt', phone: '0248837975', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/fin/attend-centre', mapLink: 'https://maps.app.goo.gl/tujvvKK7vuDR2hWz5', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
    ],
  },
  {
    country: 'Hungary',
    branches: [
      { name: 'Hungary Visa Application Center - Cairo', city: 'Cairo', address: '52 Lebanon St. 4th Floor, Mohandesine, Giza Cairo Egypt', phone: '0248837979', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/hun/attend-centre', mapLink: 'https://maps.app.goo.gl/utSS1twPPjFWknVR6', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
    ],
  },
  {
    country: 'Portugal',
    branches: [
      { name: 'Portugal Visa Application Center - Cairo', city: 'Cairo', address: '52 Lebanon St. 4th Floor, Mohandesine, Giza Cairo Egypt', phone: '0248837980', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/prt/attend-centre', mapLink: 'https://maps.app.goo.gl/utSS1twPPjFWknVR6', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
      { name: 'Portugal Visa Application Center - Alexandria', city: 'Alexandria', address: '62, First floor, Giesh Road, Ibrahimya, Bab Sharki, Alexandria, Egypt', phone: '0248837980', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/prt/attend-centre', mapLink: 'https://maps.app.goo.gl/tujvvKK7vuDR2hWz5', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
    ],
  },
  {
    country: 'Latvia',
    branches: [
      { name: 'Latvia Visa Application Center - Cairo', city: 'Cairo', address: '52 Lebanon St. 4th Floor, Mohandesine, Giza Cairo Egypt', phone: '0248837982', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/lva/attend-centre', mapLink: 'https://maps.app.goo.gl/utSS1twPPjFWknVR6', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
    ],
  },
  {
    country: 'Lithuania',
    branches: [
      { name: 'Lithuania Visa Application Center - Cairo', city: 'Cairo', address: '52 Lebanon St. 4th Floor, Mohandesine, Giza Cairo Egypt', phone: '0248837983', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/ltu/attend-centre', mapLink: 'https://maps.app.goo.gl/utSS1twPPjFWknVR6', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
      { name: 'Lithuania Visa Application Center - Alexandria', city: 'Alexandria', address: '62, First floor, Giesh Road, Ibrahimya, Bab Sharki, Alexandria, Egypt', phone: '0248837983', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/ltu/attend-centre', mapLink: 'https://maps.app.goo.gl/tujvvKK7vuDR2hWz5', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
    ],
  },
  {
    country: 'Croatia',
    branches: [
      { name: 'Croatia Visa Application Center - Cairo', city: 'Cairo', address: '52 Lebanon St. 4th Floor, Mohandesine, Giza Cairo Egypt', phone: '0248837985', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/hrv/attend-centre', mapLink: 'https://maps.app.goo.gl/utSS1twPPjFWknVR6', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
    ],
  },
  {
    country: 'Estonia',
    branches: [
      { name: 'Estonia Visa Application Center - Cairo', city: 'Cairo', address: '52 Lebanon St. 4th Floor, Mohandesine, Giza Cairo Egypt', phone: '0248837986', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/est/attend-centre', mapLink: 'https://maps.app.goo.gl/utSS1twPPjFWknVR6', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
      { name: 'Estonia Visa Application Center - Alexandria', city: 'Alexandria', address: '62, First floor, Giesh Road, Ibrahimya, Bab Sharki, Alexandria, Egypt', phone: '0248837986', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/est/attend-centre', mapLink: 'https://maps.app.goo.gl/tujvvKK7vuDR2hWz5', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
    ],
  },
  {
    country: 'Iceland',
    branches: [
      { name: 'Iceland Visa Application Center - Cairo', city: 'Cairo', address: '52 Lebanon St. 4th Floor, Mohandesine, Giza Cairo Egypt', phone: '0248837987', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/isl/attend-centre', mapLink: 'https://maps.app.goo.gl/utSS1twPPjFWknVR6', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
      { name: 'Iceland Visa Application Center - Alexandria', city: 'Alexandria', address: '62, First floor, Giesh Road, Ibrahimya, Bab Sharki, Alexandria, Egypt', phone: '0248837987', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/isl/attend-centre', mapLink: 'https://maps.app.goo.gl/tujvvKK7vuDR2hWz5', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
    ],
  },
  {
    country: 'Liechtenstein',
    branches: [
      { name: 'Liechtenstein Visa Application Center - Cairo', city: 'Cairo', address: '52 Lebanon St. 4th Floor, Mohandesine, Giza Cairo Egypt', phone: '0248837988', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/lie/attend-centre', mapLink: 'https://maps.app.goo.gl/utSS1twPPjFWknVR6', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
    ],
  },
  {
    country: 'Bulgaria',
    branches: [
      { name: 'Embassy of the Republic of Bulgaria in Egypt - Cairo', city: 'Cairo', address: '6, El Malek El Afdal Str. Zamalek, Cairo, Egypt', phone: '02 27363025 - 02 27366077', visaCenter: 'Embassy', reference: 'https://shorturl.at/O0F0W', mapLink: 'https://share.google/qqXmAoKdgN64fs1hb', workingHours: 'Sun-Thu 08:30 AM to 03:00 PM' },
    ],
  },
  {
    country: 'Romania',
    branches: [
      { name: 'Romania Visa Application Center - Cairo', city: 'Cairo', address: '52 Lebanon St. 4th Floor, Mohandesine, Giza Cairo Egypt', phone: '0248837990', visaCenter: 'VFS GLOBAL', reference: 'https://visa.vfsglobal.com/egy/en/rou/attend-centre', mapLink: 'https://maps.app.goo.gl/utSS1twPPjFWknVR6', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM' },
    ],
  },
  {
    country: 'Poland',
    branches: [
      { name: 'Republic of Poland in Cairo', city: 'Cairo', address: '5, El Aziz Osman, Zamalek, Cairo, Egypt', phone: '02 27355416', visaCenter: 'Embassy', reference: 'https://www.gov.pl/web/egypt/embassy', mapLink: 'https://share.google/lFlWuOevltTDhXmqn', workingHours: 'Sun-Thu 09:00 AM to 03:00 PM' },
    ],
  },
  {
    country: 'Slovenia',
    branches: [
      { name: 'Embassy of the Republic of Slovenia in Cairo', city: 'Cairo', address: '21 Soliman Abaza Street 12311 Mohandessin, Cairo Egyp', phone: '02 37498171', visaCenter: 'Embassy', reference: 'https://www.gov.si/en/representations/embassy-cairo/consular-information-of-the-embassy-cairo/', mapLink: 'https://share.google/c75gjYFQ1m8RdLcLs', workingHours: 'Sun-Thu 10:00 AM to 02:00 PM' },
    ],
  },
  {
    country: 'Czech',
    branches: [
      { name: 'Embassy of the Czech Republic', city: 'Cairo', address: '4 Al Dokki St, Ad Doqi, Dokki, Giza Governorate 12511', phone: '02 33339700', visaCenter: 'Embassy', reference: 'https://shorturl.at/lMBG1', mapLink: 'https://share.google/Gy3KiUGFddocxgQoV', workingHours: 'Sun-Thu 8:30 AM–3:30 PM' },
    ],
  },
  {
    country: 'USA',
    branches: [
      { name: 'USA Visa Application Center - Cairo', city: 'Cairo', address: '8 Kasr El Ainy St., Garden City, Cairo, Egypt', phone: '02 27912000', visaCenter: 'Embassy', reference: 'https://eg.usembassy.gov/visas/', mapLink: 'https://maps.app.goo.gl/t8T2kRGf5w8rPvKV8', workingHours: 'Sun-Thu 07:30 AM to 4:00 PM' },
    ],
  },
  {
    country: 'United Kingdom',
    branches: [
      { name: 'UK Visa Application Center - Cairo', city: 'Cairo', address: '17 Maghrabi St., Beside Metro Market, Downtown, Cairo, Egypt', phone: '02 25356762', visaCenter: 'TLScontact', reference: 'https://visa.tlscontact.com/visa/eg/egCairoUK/home', mapLink: 'https://maps.app.goo.gl/9pZ2eL3o8t8nE9zA6', workingHours: 'Sun-Thu 08:00 AM to 3:00 PM' },
      { name: 'UK Visa Application Center - Alexandria', city: 'Alexandria', address: '62, First floor, Giesh Road, Ibrahimya, Bab Sharki, Alexandria, Egypt', phone: '02 25356762', visaCenter: 'TLScontact', reference: 'https://visa.tlscontact.com/visa/eg/egCairoUK/home', mapLink: 'https://maps.app.goo.gl/3rV2pB4b9YzVjw9k7', workingHours: 'Sun-Thu 08:00 AM to 3:00 PM' },
    ],
  },
  {
    country: 'China',
    branches: [
      { name: 'China Visa Center - Cairo', city: 'Cairo', address: '2ndFloor, City Capital Building, 6 Agriculture st., Dokki-Giza', phone: '02 37483425/27/28', visaCenter: 'VFS GLOBAL', reference: 'https://www.visaforchina.cn/CAI3_EN/guanyuwomen/bangongshijianjidizhi', mapLink: 'https://share.google/05qXktI3eXiumHPQw', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM', submissionHours: 'Submission of applications: 9:00 AM to 12:00 PM' },
      { name: 'China Visa Center - Alexandria', city: 'Alexandria', address: '14 El-Geish Road, Miami, Alexandria, Egypt', phone: '02 37483425', visaCenter: 'VFS GLOBAL', reference: 'https://www.visaforchina.cn/CAI3_EN/guanyuwomen/bangongshijianjidizhi', mapLink: 'https://share.google/8tQXktI3eXiumHPQw', workingHours: 'Sun-Thu 09:00 AM to 04:00 PM', submissionHours: 'Submission of applications: 9:00 AM to 12:00 PM' },
    ],
  },
  {
    country: 'Turkey',
    branches: [
      { name: 'Turkey Visa Application Center - Cairo', city: 'Cairo', address: '14 Adnan El Ariny St., Dokki, Giza, Egypt', phone: '02 25356762', visaCenter: 'BLS International', reference: 'https://www.blsturkeyvisa.com/', mapLink: 'https://maps.app.goo.gl/Q3jAaZ8cVzrKd3yN6', workingHours: 'Sun-Thu 09:00 AM to 4:00 PM' },
      { name: 'Turkey Visa Application Center - Alexandria', city: 'Alexandria', address: '42 El Geish Road, Mostafa Kamel, Alexandria, Egypt', phone: '02 25356762', visaCenter: 'BLS International', reference: 'https://www.blsturkeyvisa.com/', mapLink: 'https://maps.app.goo.gl/7kAaZ8cVzrKd3yN6', workingHours: 'Sun-Thu 09:00 AM to 4:00 PM' },
    ],
  },
  {
    country: 'Morocco',
    branches: [
      { name: 'Morocco Embassy - Cairo', city: 'Cairo', address: '27 Hassan Sabri St., Zamalek, Cairo, Egypt', phone: '02 27351051', visaCenter: 'Embassy', reference: 'https://www.mfa.gov.ma/en/', mapLink: 'https://maps.app.goo.gl/4kAaZ8cVzrKd3yN6', workingHours: 'Sun-Thu 09:00 AM to 3:00 PM' },
    ],
  },
  {
    country: 'India',
    branches: [
      { name: 'India Visa Application Center - Cairo', city: 'Cairo', address: '3rd Floor, Heliopolis Tower, Al Horreya St., Heliopolis, Cairo, Egypt', phone: '02 25356762', visaCenter: 'BLS International', reference: 'https://www.blsindia-egypt.com/', mapLink: 'https://maps.app.goo.gl/2kAaZ8cVzrKd3yN6', workingHours: 'Sun-Thu 09:00 AM to 3:00 PM' },
    ],
  },
  {
    country: 'Japan',
    branches: [
      { name: 'Japan Embassy - Cairo', city: 'Cairo', address: '1 Falky St., Garden City, Cairo, Egypt', phone: '02 27912000', visaCenter: 'Embassy', reference: 'https://www.eg.emb-japan.go.jp/e/', mapLink: 'https://maps.app.goo.gl/3kAaZ8cVzrKd3yN6', workingHours: 'Sun-Thu 09:00 AM to 1:00 PM' },
    ],
  },
  {
    country: 'Mexico',
    branches: [
      { name: 'Mexico Embassy', city: 'Cairo', address: '25, Maadi as Sarayat Al Gharbeyah, Maadi, Cairo Governorate 11431', phone: '23580256 - 23580258 - 23580259', visaCenter: 'Embassy', reference: 'https://shorturl.at/S6RI2', mapLink: 'https://share.google/qeGBZPKJvXTg2bYUJ', workingHours: 'Mon-Thu 09:30 AM - 1:00 PM' },
    ],
  },
]

async function main() {
  console.log('🚀 Seeding database...')

  // 1. Clean slate
  await db.branch.deleteMany()
  await db.country.deleteMany()
  await db.headOffice.deleteMany()
  await db.adminUser.deleteMany()
  await db.siteSettings.deleteMany()
  console.log('✓ Cleaned existing data')

  // 2. Admin user — username: admin / password: admin
  const hashedPassword = await bcrypt.hash('admin', 10)
  await db.adminUser.create({
    data: { username: 'admin', password: hashedPassword },
  })
  console.log('✓ Created admin user (username: admin, password: admin)')

  // 3. Head office
  await db.headOffice.create({
    data: {
      labelAr: 'المقر الرئيسي',
      labelEn: 'Head Office',
      addressAr: 'B Square، مدخل C، الدور الخامس، طريق النصر، مدينة نصر (بجوار طيبة مول، بالقرب من أول كوبري عباس العقاد)',
      addressEn: 'B Square, Entrance C, 5th Floor, El-Nasr Rd., Nasr City (Next to Taiba Mall, near the First Abbas El Akkad Bridge)',
      hoursAr: 'السبت إلى الخميس | 10:00 ص – 7:00 م (ما عدا الإجازات الرسمية)',
      hoursEn: 'Saturday–Thursday | 10:00 AM – 7:00 PM (Except official holidays)',
      mapLink: 'https://maps.app.goo.gl/daqfBDTyvVoHNnQf7',
      isActive: true,
    },
  })
  console.log('✓ Created head office')

  // 4. Countries + branches
  let totalBranches = 0
  for (let i = 0; i < DATA.length; i++) {
    const { country: countryName, branches } = DATA[i]
    const meta = COUNTRY_META[countryName] || { code: '', flag: '🌍' }

    const country = await db.country.create({
      data: {
        name: countryName,
        code: meta.code,
        flag: meta.flag,
        sortOrder: i,
        branches: {
          create: branches.map((b, j) => ({
            name: b.name,
            city: b.city,
            address: b.address,
            phone: b.phone,
            visaCenter: b.visaCenter,
            reference: b.reference ?? null,
            mapLink: b.mapLink ?? null,
            workingHours: b.workingHours ?? null,
            submissionHours: b.submissionHours ?? null,
            sortOrder: j,
          })),
        },
      },
    })

    totalBranches += branches.length
    console.log(`  ✓ ${countryName} — ${branches.length} branch(es)`)
  }

  console.log(`\n✓ Seeded ${DATA.length} countries, ${totalBranches} branches total`)
  console.log('\n🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('✗ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
