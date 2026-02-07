#!/usr/bin/env python3
"""Generate translations.js from all locale JSON files."""

import json
import os

locales_dir = "/Users/jakareaparvez/Documents/shopify-dev/enklab/assets/locales"
output_file = "/Users/jakareaparvez/Documents/shopify-dev/enklab/assets/translations.js"

# All 16 languages in the dropdown
languages = ['en', 'de', 'fr', 'es', 'it', 'pt', 'da', 'sv', 'no', 'nl', 'pl', 'ja', 'hi', 'ko', 'ru', 'zh']

output = []

output.append("// Embedded translations for e-ink Lab theme")
output.append("// Generated from locale JSON files - All 16 languages")
output.append("")
output.append("window.EmbeddedTranslations = {")

for i, lang in enumerate(languages):
    locale_path = os.path.join(locales_dir, f"{lang}.json")

    with open(locale_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    output.append(f"  {lang}: {{")

    # Convert to flat comma-separated format
    items = []
    for key, value in data.items():
        value_escaped = json.dumps(value, ensure_ascii=False)
        items.append(f'    "{key}": {value_escaped}')

    output.append(',\n'.join(items))

    # Add comma if not last language
    if i < len(languages) - 1:
        output.append("  },")
    else:
        output.append("  }")

output.append("};")

# Write to file
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

print(f"Generated {output_file}")
print(f"Languages: {len(languages)}")
print(f"File size: {os.path.getsize(output_file)} bytes")
