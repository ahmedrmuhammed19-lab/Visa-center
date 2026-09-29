"""
Build the new visa-center index.html with 2026 design.

Steps:
1. Read extracted DATA (37 countries / 59 branches).
2. Read template.html, inject LOGO + DATA.
3. Write to /home/z/my-project/workspace/visa-center/index.html
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

# --- 2. Use original DATA only (no new branches) ---
DATA_FULL = DATA

# Sanity check
new_country_count = len(re.findall(r'country:\s*"', DATA_FULL))
new_branch_count = len(re.findall(r'\{\s*name:\s*"', DATA_FULL))
print(f"Data: {new_country_count} countries, {new_branch_count} branches")
assert new_country_count == 37, f"Expected 37 countries, got {new_country_count}"
assert new_branch_count == 59, f"Expected 59 branches, got {new_branch_count}"

# --- 3. Read template, inject placeholders ---
with open(TEMPLATE_PATH) as f:
    template = f.read()

output = template.replace('__LOGO__', LOGO).replace('__DATA__', DATA_FULL)

assert '__LOGO__' not in output, "LOGO placeholder not replaced"
assert '__DATA__' not in output, "DATA placeholder not replaced"

print(f"Final HTML size: {len(output):,} chars ({len(output.splitlines())} lines)")

# --- 4. Write to index.html ---
with open(OUTPUT_PATH, 'w') as f:
    f.write(output)

print(f"\n✓ Wrote new index.html to: {OUTPUT_PATH}")
print(f"  Size: {os.path.getsize(OUTPUT_PATH):,} bytes")
