import os
import re

migrations_dir = 'migrations/versions'
files = [f for f in os.listdir(migrations_dir) if f.endswith('.py') and f != '__init__.py']

migrations = {}

for f in files:
    with open(os.path.join(migrations_dir, f), 'r', encoding='utf-8') as file:
        content = file.read()
        rev_match = re.search(r"revision:\s*str\s*=\s*'([a-f0-9]+)'", content)
        down_match = re.search(r"down_revision:\s*Union\[str,\s*Sequence\[str\],\s*None\]\s*=\s*'([a-f0-9]+)'", content)
        
        if rev_match:
            rev = rev_match.group(1)
            down = down_match.group(1) if down_match else None
            migrations[rev] = {'down': down, 'file': f}

# Find heads (revisions that are not down_revision for anyone)
down_revisions = set(m['down'] for m in migrations.values() if m['down'])
heads = [r for r in migrations if r not in down_revisions]

print(f"Total migrations: {len(migrations)}")
print("Heads:")
for h in heads:
    print(f"  {h} ({migrations[h]['file']}) -> {migrations[h]['down']}")

print("\nFull Chain:")
# Simple recursive print not efficient but good enough for small graph
def print_chain(rev, depth=0):
    print(f"{'  '*depth}{rev} ({migrations[rev]['file']})")
    # Find who points to this rev
    children = [r for r, m in migrations.items() if m['down'] == rev]
    for child in children:
        print_chain(child, depth+1)

# Start from roots (down is None or not in revisions)
roots = [r for r, m in migrations.items() if m['down'] is None]
for root in roots:
    print_chain(root)
