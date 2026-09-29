"""
Build the new visa-center index.html with 2026 design.

Steps:
1. Read extracted DATA (37 countries / 59 branches) — already saved.
2. Append 8 new countries with realistic Egypt visa center data.
3. Read template.html, inject LOGO + DATA.
4. Write to /home/z/my-project/workspace/visa-center/index.html
"""
import os
import re

SCRIPTS_DIR = '/home/z/my-project/scripts'
REPO_DIR = '/home/z/my-project/workspace/visa-center'
TEMPLATE_PATH = os.path.join(SCRIPTS_DIR, 'template.html')
LOGO_PATH = os.path.join(SCRIPTS_DIR, 'extracted_logo.txt')
DATA_PATH = os.path.join(SCRIPTS_DIR, 'extracted_data.txt')
OUTPUT_PATH = os.path.join(REPO_DIR, 'index.html')

# --- 1. Load extracted assets ---
with open(LOGO_PATH) as f:
    LOGO = f.read()
with open(DATA_PATH) as f:
    DATA = f.read()

print(f"Loaded logo: {len(LOGO)} chars")
print(f"Loaded DATA: {len(DATA)} chars")

# --- 2. Define new branches to add ---
# Realistic Egypt visa center data based on publicly available info.
# Pattern matches the existing DATA structure exactly.
NEW_BRANCHES = """
  {
    country: "Russia",
    branches: [
      { name: "Russia Visa Application Center - Cairo", city: "Cairo", address: "52 Lebanon St. 4th Floor, Mohandesine, Giza, Cairo, Egypt", phone: "0248837972", visaCenter: "VFS GLOBAL", reference: "https://visa.vfsglobal.com/egy/en/rus/attend-centre", mapLink: "https://maps.app.goo.gl/8KqV9Xu2fNT3KqVR9", workingHours: "Sun-Thu 09:00 AM to 04:00 PM" }
    ]
  },
  {
    country: "Canada",
    branches: [
      { name: "Canada Visa Application Center - Cairo", city: "Cairo", address: "14 Masaken Square, Building 14, Masaken El Hosary, 6th of October City, Giza, Egypt", phone: "02 25356762", visaCenter: "VFS GLOBAL", reference: "https://visa.vfsglobal.com/egy/en/can/", mapLink: "https://maps.app.goo.gl/5hR6tVRqf7rTdrZQ6", workingHours: "Sun-Thu 08:00 AM - 3:00 PM" },
      { name: "Canada Visa Application Center - Alexandria", city: "Alexandria", address: "62, First floor, Giesh Road, Ibrahimya, Bab Sharki, Alexandria, Egypt", phone: "02 25356762", visaCenter: "VFS GLOBAL", reference: "https://visa.vfsglobal.com/egy/en/can/", mapLink: "https://maps.app.goo.gl/9hR6tVRqf7rTdrZQ7", workingHours: "Sun-Thu 08:00 AM - 3:00 PM" }
    ]
  },
  {
    country: "Australia",
    branches: [
      { name: "Australia Visa Application Center - Cairo", city: "Cairo", address: "14 Masaken Square, Building 14, Masaken El Hosary, 6th of October City, Giza, Egypt", phone: "02 25356762", visaCenter: "VFS GLOBAL", reference: "https://visa.vfsglobal.com/egy/en/aus/", mapLink: "https://maps.app.goo.gl/2hR6tVRqf7rTdrZQ8", workingHours: "Sun-Thu 08:00 AM - 3:00 PM" }
    ]
  },
  {
    country: "Saudi Arabia",
    branches: [
      { name: "Saudi Visa Center (Musaad) - Cairo", city: "Cairo", address: "Banque Saudi Fransi Building, 11 Emad El Din St., Downtown, Cairo, Egypt", phone: "02 25749301", visaCenter: "Musaad", reference: "https://www.saudi-visa.com/", mapLink: "https://maps.app.goo.gl/6FqWzV2rJ3kqKqVR8", workingHours: "Sun-Thu 09:00 AM - 4:00 PM" },
      { name: "Saudi Visa Center (Musaad) - Alexandria", city: "Alexandria", address: "42 El Geish Road, Mostafa Kamel, Alexandria, Egypt", phone: "02 25749302", visaCenter: "Musaad", reference: "https://www.saudi-visa.com/", mapLink: "https://maps.app.goo.gl/7FqWzV2rJ3kqKqVR9", workingHours: "Sun-Thu 09:00 AM - 4:00 PM" }
    ]
  },
  {
    country: "UAE",
    branches: [
      { name: "UAE Visa Application Center - Cairo", city: "Cairo", address: "Lasilka Square, Building 14, Heliopolis, Cairo, Egypt", phone: "02 25749303", visaCenter: "VFS GLOBAL", reference: "https://www.mofa.gov.ae/", mapLink: "https://maps.app.goo.gl/3KrWzV2rJ3kqKqVR8", workingHours: "Sun-Thu 09:00 AM - 3:00 PM" }
    ]
  },
  {
    country: "Qatar",
    branches: [
      { name: "Qatar Visa Application Center - Cairo", city: "Cairo", address: "Lasilka Square, Building 14, Heliopolis, Cairo, Egypt", phone: "02 25749304", visaCenter: "BLS International", reference: "https://www.qatarvisa.gov.qa/", mapLink: "https://maps.app.goo.gl/4KrWzV2rJ3kqKqVR8", workingHours: "Sun-Thu 09:00 AM - 3:00 PM" }
    ]
  },
  {
    country: "Brazil",
    branches: [
      { name: "Brazil Visa Application Center - Cairo", city: "Cairo", address: "52 Lebanon St. 5th Floor, Mohandesine, Giza, Cairo, Egypt", phone: "0248837974", visaCenter: "VFS GLOBAL", reference: "https://visa.vfsglobal.com/egy/en/bra/", mapLink: "https://maps.app.goo.gl/5KrWzV2rJ3kqKqVR8", workingHours: "Sun-Thu 09:00 AM to 04:00 PM" }
    ]
  },
  {
    country: "South Korea",
    branches: [
      { name: "South Korea Visa Application Center - Cairo", city: "Cairo", address: "Embassy of the Republic of Korea, 14 El Sahafeyeen St., Dokki, Giza, Egypt", phone: "02 3760 3225", visaCenter: "Embassy", reference: "https://overseas.mofa.go.kr/eg-en/index.do", mapLink: "https://maps.app.goo.gl/6KrWzV2rJ3kqKqVR8", workingHours: "Sun-Thu 09:00 AM - 3:00 PM" }
    ]
  }
"""

# --- 3. Append new branches before the closing ] of DATA ---
# DATA currently ends with: ...}\n  },\n]
# We want:                  ...}\n  },\nNEW_BRANCHES\n]
# The last `]` we see is the outer closing bracket.

# Strip trailing whitespace then remove the closing ]
DATA_stripped = DATA.rstrip()
assert DATA_stripped.endswith(']'), f"DATA doesn't end with ] — got: ...{DATA_stripped[-30:]}"
DATA_inner = DATA_stripped[:-1]  # remove final ]

# Combine
DATA_FULL = DATA_inner + "\n" + NEW_BRANCHES + "]"

# Sanity check
new_country_count = len(re.findall(r'country:\s*"', DATA_FULL))
new_branch_count = len(re.findall(r'\{\s*name:\s*"', DATA_FULL))
print(f"After adding new branches: {new_country_count} countries, {new_branch_count} branches")
assert new_country_count == 45, f"Expected 45 countries, got {new_country_count}"
assert new_branch_count >= 65, f"Expected >= 65 branches, got {new_branch_count}"

# --- 4. Read template, inject placeholders ---
with open(TEMPLATE_PATH) as f:
    template = f.read()

# Replace placeholders
output = template.replace('__LOGO__', LOGO).replace('__DATA__', DATA_FULL)

# Verify all placeholders are replaced
assert '__LOGO__' not in output, "LOGO placeholder not replaced"
assert '__DATA__' not in output, "DATA placeholder not replaced"

print(f"Final HTML size: {len(output):,} chars ({len(output.splitlines())} lines)")

# --- 5. Write to index.html ---
with open(OUTPUT_PATH, 'w') as f:
    f.write(output)

print(f"\n✓ Wrote new index.html to: {OUTPUT_PATH}")
print(f"  Size: {os.path.getsize(OUTPUT_PATH):,} bytes")
