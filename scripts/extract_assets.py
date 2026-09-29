"""Extract LOGO_BASE64 and DATA array from existing index.html."""
import re

SRC = '/home/z/my-project/workspace/visa-center/index.html'
with open(SRC) as f:
    content = f.read()

# Extract logo (data:image base64)
logo_match = re.search(r'src="(data:image/[^"]+)"', content)
LOGO = logo_match.group(1) if logo_match else ''
print(f"Logo extracted: {len(LOGO)} chars")

# Extract DATA array — from "const DATA = [" to "];" at end
# Use balanced bracket matching since the array is nested
start = content.find('const DATA')
start = content.find('[', start)
# Find matching closing ]
depth = 0
i = start
while i < len(content):
    if content[i] == '[':
        depth += 1
    elif content[i] == ']':
        depth -= 1
        if depth == 0:
            break
    i += 1
DATA = content[start:i+1]
print(f"DATA extracted: {len(DATA)} chars, ends with: ...{DATA[-50:]}")

# Save
with open('/home/z/my-project/scripts/extracted_logo.txt', 'w') as f:
    f.write(LOGO)
with open('/home/z/my-project/scripts/extracted_data.txt', 'w') as f:
    f.write(DATA)

# Quick sanity check
country_count = len(re.findall(r'country:\s*"', DATA))
branch_count = len(re.findall(r'\{\s*name:\s*"', DATA))
print(f"Sanity: {country_count} countries, {branch_count} branches")
