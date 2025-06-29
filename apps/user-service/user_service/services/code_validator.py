import ast
FORBIDDEN_MODULES = {
    "os",
    "sys",
    "subprocess",
    "shutil",
    "ctypes",
    "pathlib",
    "requests",
    "socket",
    "asyncio",
    "multiprocessing",
}

FORBIDDEN_BUILTINS = {"open", "eval", "exec", "input"}

class CodeVisitor(ast.NodeVisitor):
    def __init__(self):
        self.violations = []

    def visit_Import(self, node: ast.Import):
        for alias in node.names:
            if alias.name in FORBIDDEN_MODULES:
                self.violations.append(f"Forbidden module import detected: '{alias.name}'")
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom):
        if node.module in FORBIDDEN_MODULES:
            self.violations.append(f"Forbidden module import detected: '{node.module}'")
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call):
        if isinstance(node.func, ast.Name) and node.func.id in FORBIDDEN_BUILTINS:
            self.violations.append(f"Potentially dangerous function call detected: '{node.func.id}()'")
        
        if isinstance(node.func, ast.Attribute):
            if node.func.attr == '__import__':
                 self.violations.append("Forbidden dynamic import `__import__` detected.")

        self.generic_visit(node)


def is_code_safe(code: str) -> tuple[bool, str]:
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return False, f"Code contains a syntax error: {e}"
    
    visitor = CodeVisitor()
    visitor.visit(tree)

    if visitor.violations:
        return False, visitor.violations[0]

    return True, "Code passed basic safety check."

