import os

def replace_in_file(path, old, new):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

base = r'c:\Users\91639\OneDrive\Desktop\4th year\College work\Airbnb clone\frontend\src'

replace_in_file(
    os.path.join(base, r'app\host\listings\page.tsx'),
    'wizard_step || "property-type"',
    'wizard_step || "structure"'
)

replace_in_file(
    os.path.join(base, r'components\host-components\steps\ReviewStep.tsx'),
    '/property-type',
    '/structure'
)

replace_in_file(
    os.path.join(base, r'app\host\listings\[id]\edit\page.tsx'),
    'id: "property-type"',
    'id: "structure"'
)

print("property-type fixes applied")
