import re

with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Remove overflow from .topbar in desktop
css = re.sub(
    r'(\.topbar \{\s*width: 270px;\s*height: 100%;\s*max-height: 100%;\s*flex-shrink: 0;\s*position: sticky;\s*top: 0;\s*display: flex;\s*flex-direction: column;\s*justify-content: space-between;\s*border-bottom: none;\s*background: var\(--surface\);\s*border-right: 1px solid var\(--surface-border\);)\s*overflow-y: auto;\s*overflow-x: hidden;\s*scrollbar-width: thin;',
    r'\g<1>',
    css, flags=re.DOTALL
)

# Update .status-right-group positioning
css = re.sub(
    r'(\.status-right-group \{\s*)position: fixed;\s*top: 32px;\s*right: 48px;',
    r'\g<1>position: absolute;\n    top: 32px;\n    left: calc(100vw - 80px);\n    transform: translateX(-100%);',
    css, flags=re.DOTALL
)

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Fixes applied successfully.")
