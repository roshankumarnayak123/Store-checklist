import re

with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Fix .app-layout desktop
css = re.sub(
    r'(@media \(min-width: 1024px\) \{.*?\.app-layout \{.*?display: flex;\s*)min-height: 100vh;\s*align-items: stretch;',
    r'\g<1>height: calc(100vh - 32px);\n    margin: 16px;\n    border-radius: 20px;\n    overflow: hidden;\n    align-items: stretch;\n    border: 1px solid var(--surface-border);\n    box-shadow: var(--shadow-lg);\n  }\n  #bgCanvas {\n    top: 16px !important;\n    left: 16px !important;\n    width: calc(100vw - 32px) !important;\n    height: calc(100vh - 32px) !important;\n    border-radius: 20px;\n  }',
    css, flags=re.DOTALL
)

# 2. Fix body in desktop (remove padding 16px)
css = re.sub(
    r'(@media \(min-width: 1024px\) \{\s*)body \{\s*padding: 16px;\s*\}',
    r'\g<1>body {\n    overflow: hidden;\n    padding: 0;\n  }',
    css, flags=re.DOTALL
)

# 3. Fix .topbar height in desktop
css = re.sub(
    r'(\.topbar \{\s*width: 270px;\s*)height: 100vh;\s*max-height: 100vh;',
    r'\g<1>height: 100%;\n    max-height: 100%;',
    css, flags=re.DOTALL
)

# 4. Fix .app-main in desktop
css = re.sub(
    r'(\.app-main \{\s*flex: 1;\s*padding: 48px;\s*max-width: 1200px;\s*margin: 0 auto;\s*)\}',
    r'\g<1>overflow-y: auto;\n    height: 100%;\n    scrollbar-width: thin;\n  }',
    css, flags=re.DOTALL
)

# 5. Move .status-right-group to top right in desktop
css = re.sub(
    r'(\.status-right-group \{\s*display: flex;\s*flex-direction: column;\s*align-items: flex-start;\s*gap: 8px;\s*width: 100%;\s*box-sizing: border-box;\s*\})',
    r'.status-right-group {\n    position: fixed;\n    top: 32px;\n    right: 48px;\n    display: flex;\n    flex-direction: row;\n    align-items: center;\n    gap: 16px;\n    width: auto;\n    background: rgba(15, 23, 42, 0.85);\n    padding: 8px 20px;\n    border-radius: 999px;\n    border: 1px solid rgba(255,255,255,0.05);\n    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.3);\n    z-index: 100;\n    backdrop-filter: blur(16px);\n    -webkit-backdrop-filter: blur(16px);\n  }\n  html[data-theme="light"] .status-right-group {\n    background: rgba(255,255,255,0.94);\n    border: 1px solid rgba(15,23,42,0.1);\n  }',
    css, count=1, flags=re.DOTALL
)

# 6. Fix .theme-toggle in desktop
css = re.sub(
    r'(\.status-right-group \.theme-toggle,\s*#themeToggle \{[^\}]*)margin: 4px 0 0 0 !important;([^}]*align-self:) flex-start !important;',
    r'\g<1>margin: 0 !important;\g<2> center !important;',
    css, count=1, flags=re.DOTALL
)

# 7. Fix #statusTimeGroup in desktop
css = re.sub(
    r'(#statusTimeGroup \{\s*display: flex;\s*)flex-direction: column;\s*align-items: flex-start;\s*gap: 6px;\s*width: 100%;',
    r'\g<1>flex-direction: row;\n    align-items: center;\n    gap: 16px;\n    width: auto;',
    css, count=1, flags=re.DOTALL
)

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Modifications applied successfully.")
