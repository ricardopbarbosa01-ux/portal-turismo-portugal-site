import sys
from html.parser import HTMLParser
import re

class HTMLValidator(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tag_stack = []
        self.errors = []
        self.void_tags = {'br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'}

    def handle_starttag(self, tag, attrs):
        if tag not in self.void_tags:
            self.tag_stack.append((tag, self.getpos()))

    def handle_endtag(self, tag):
        if not self.tag_stack:
            self.errors.append(f"Close tag </{tag}> without opening at {self.getpos()}")
            return
        opened_tag, opened_pos = self.tag_stack.pop()
        if opened_tag != tag:
            self.errors.append(f"Tag mismatch: opened <{opened_tag}> at {opened_pos}, got </{tag}> at {self.getpos()}")
            self.tag_stack.append((opened_tag, opened_pos))

def validate(filepath):
    with open(filepath, 'rb') as f:
        raw_bytes = f.read()

    # Check for BOM
    has_bom = raw_bytes[:3] == b'\xef\xbb\xbf'
    print(f"BOM presente: {has_bom}")

    # Check for double-encoding garbage
    content = raw_bytes.decode('utf-8', errors='replace')
    garbage_chars = ['├', 'Ô', '┬', 'Ã', '�']
    for char in garbage_chars:
        count = content.count(char)
        if count > 0:
            print(f"AVISO: {count} ocorrencias de '{char}' (possivel double-encoding)")
            return False

    print("Encoding: OK")

    # Parse HTML
    parser = HTMLValidator()
    try:
        parser.feed(content)
        if parser.errors:
            print(f"Erros de parsing ({len(parser.errors)}):")
            for err in parser.errors[:5]:
                print(f"  - {err}")
            return False
        if parser.tag_stack:
            print(f"Tags abertas nao fechadas ({len(parser.tag_stack)}):")
            for tag, pos in parser.tag_stack[:5]:
                print(f"  - <{tag}> at {pos}")
            return False
        print("HTML estrutura: OK")
        return True
    except Exception as e:
        print(f"Excecao de parsing: {e}")
        return False

if __name__ == '__main__':
    file = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
    ok = validate(file)
    sys.exit(0 if ok else 1)
