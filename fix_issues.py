import os

# 1. Fix messagesApi.ts
messages_path = r'c:\Users\91639\OneDrive\Desktop\4th year\College work\Airbnb clone\frontend\src\lib\messagesApi.ts'
with open(messages_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'import { API_URL }' not in content:
    content = 'import { API_URL } from "./api";\n\n' + content

content = content.replace('http://localhost:8000/api', '${API_URL}')

with open(messages_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Fix Header.tsx z-index
header_path = r'c:\Users\91639\OneDrive\Desktop\4th year\College work\Airbnb clone\frontend\src\components\Header.tsx'
with open(header_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to change the z-index of the UserMenu wrapper
# Specifically: <div className="flex-1 flex justify-end relative z-30">
content = content.replace('<div className="flex-1 flex justify-end relative z-30">', '<div className="flex-1 flex justify-end relative z-50">')
# And maybe the parent of Logo just to be safe
content = content.replace('<div className="flex-1 relative z-30">', '<div className="flex-1 relative z-50">')

with open(header_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixes applied.")
