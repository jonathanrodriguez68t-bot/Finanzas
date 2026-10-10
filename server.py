#!/usr/bin/env python3
"""Local finance tracker. Saves dreams, payments, expenses and sales as JSON and exports a PDF report."""
import json
import os
from datetime import date
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
DREAMS = DATA / "dreams.json"
PAYMENTS = DATA / "payments.json"
EXPENSES = DATA / "expenses.json"
SALES = DATA / "sales.json"
FILES = {"dreams": DREAMS, "payments": PAYMENTS, "expenses": EXPENSES, "sales": SALES}
PORT = int(os.environ.get("PORT", "8765"))
HTML = ROOT / "index.html"


def read_json(path):
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8") or "[]")


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def money(n):
    return f"${float(n):,.2f}"


def pdf_escape(text):
    raw = str(text).encode("cp1252", errors="replace")
    out = []
    for b in raw:
        if b in (40, 41, 92):
            out.extend((92, b))
        else:
            out.append(b)
    return bytes(out)


def build_pdf(lines):
    # Simple multi-page PDF, Helvetica, WinAnsi.
    pages = []
    current = []
    y = 760
    for line, size, color in lines:
        if y < 56:
            pages.append(current)
            current = []
            y = 760
        current.append((line, size, color, y))
        y -= 16 if size < 14 else 22
    if current:
        pages.append(current)
    if not pages:
        pages = [[]]

    objects = []

    def add(obj):
        objects.append(obj)
        return len(objects)

    font = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
    font_b = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")
    page_ids = []
    content_ids = []
    for page in pages:
        chunks = ["0.08 0.12 0.2 rg", "36 800 m 559 800 l 559 36 l 36 36 l h f"]
        for line, size, color, yy in page:
            r, g, b = color
            face = font_b if size >= 14 else font
            chunks.append(f"{r:.2f} {g:.2f} {b:.2f} rg")
            chunks.append("BT")
            chunks.append(f"/F{1 if face == font else 2} {size} Tf")
            chunks.append(f"48 {yy} Td")
            chunks.append(b"(" + pdf_escape(line) + b") Tj")
            chunks.append("ET")
        stream = b"\n".join(
            c if isinstance(c, bytes) else c.encode("ascii") for c in chunks
        )
        content_ids.append(
            add(f"<< /Length {len(stream)} >>\nstream\n".encode("ascii") + stream + b"\nendstream")
        )
        page_ids.append(None)
    kids = []
    for i, cid in enumerate(content_ids):
        pid = add(
            f"<< /Type /Page /Parent 0 0 R /MediaBox [0 0 612 792] "
            f"/Contents {cid} 0 R /Resources << /Font << /F1 {font} 0 R /F2 {font_b} 0 R >> >> >>"
        )
        kids.append(pid)
    kids_ref = " ".join(f"{k} 0 R" for k in kids)
    pages_id = add(f"<< /Type /Pages /Count {len(kids)} /Kids [{kids_ref}] >>")
    # fix parent refs
    fixed = []
    for obj in objects:
        if isinstance(obj, str) and "/Parent 0 0 R" in obj:
            fixed.append(obj.replace("/Parent 0 0 R", f"/Parent {pages_id} 0 R"))
        else:
            fixed.append(obj)
    objects[:] = fixed
    catalog = add(f"<< /Type /Catalog /Pages {pages_id} 0 R >>")

    out = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for i, obj in enumerate(objects, start=1):
        offsets.append(len(out))
        if isinstance(obj, str):
            body = obj.encode("ascii")
        else:
            body = obj
        out += f"{i} 0 obj\n".encode("ascii") + body + b"\nendobj\n"
    xref = len(out)
    out += f"xref\n0 {len(objects)+1}\n".encode("ascii")
    out += b"0000000000 65535 f \n"
    for off in offsets[1:]:
        out += f"{off:010d} 00000 n \n".encode("ascii")
    out += f"trailer << /Size {len(objects)+1} /Root {catalog} 0 R >>\nstartxref\n{xref}\n%%EOF".encode("ascii")
    return bytes(out)


def report_lines(dream, payments):
    saved = sum(float(p["amount"]) for p in payments)
    price = float(dream["price"])
    left = max(0, price - saved)
    pct = 0 if price <= 0 else min(100, round(saved / price * 100))
    blue = (0.15, 0.35, 0.75)
    black = (0.08, 0.09, 0.12)
    muted = (0.25, 0.32, 0.42)
    lines = [
        ("Reporte de dream", 18, blue),
        (dream["name"], 16, black),
        (f"Generado el {date.today().isoformat()}", 11, muted),
        ("", 11, black),
        (f"Precio de la meta: {money(price)}", 12, black),
        (f"Fecha limite: {dream['date']}", 12, black),
        (f"Ahorrado: {money(saved)}", 12, black),
        (f"Falta: {money(left)}", 12, black),
        (f"Avance: {pct}%", 12, black),
        ("", 11, black),
        ("Abonos", 14, blue),
        ("Fecha            Monto           Acumulado", 11, muted),
    ]
    running = 0
    ordered = sorted(payments, key=lambda p: p["date"])
    if not ordered:
        lines.append(("Sin abonos registrados.", 12, black))
    for p in ordered:
        running += float(p["amount"])
        lines.append((f"{p['date']}        {money(p['amount']):<14} {money(running)}", 12, black))
    return lines


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        return

    def send(self, code, body, content_type, filename=None):
        data = body if isinstance(body, bytes) else body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        if filename:
            self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        path = urlparse(self.path).path
        if path in ("/", "/index.html"):
            self.send(200, HTML.read_text(encoding="utf-8"), "text/html; charset=utf-8")
            return
        if path == "/api/data":
            payload = {key: read_json(path) for key, path in FILES.items()}
            self.send(200, json.dumps(payload), "application/json; charset=utf-8")
            return
        if path.startswith("/api/report/"):
            dream_id = path.rsplit("/", 1)[-1]
            dreams = read_json(DREAMS)
            payments = [p for p in read_json(PAYMENTS) if p.get("dreamId") == dream_id]
            dream = next((d for d in dreams if d.get("id") == dream_id), None)
            if not dream:
                self.send(404, "Dream no encontrado", "text/plain; charset=utf-8")
                return
            safe = "".join(c if c.isascii() and c.isalnum() else "-" for c in dream["name"]).strip("-") or "dream"
            pdf = build_pdf(report_lines(dream, payments))
            self.send(200, pdf, "application/pdf", f"reporte-{safe}.pdf")
            return
        self.send(404, "No encontrado", "text/plain; charset=utf-8")

    def do_POST(self):
        if urlparse(self.path).path != "/api/data":
            self.send(404, "No encontrado", "text/plain; charset=utf-8")
            return
        length = int(self.headers.get("Content-Length", "0"))
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
        except (ValueError, UnicodeDecodeError):
            self.send(400, '{"ok":false,"error":"JSON invalido"}', "application/json")
            return
        if not isinstance(payload, dict):
            self.send(400, '{"ok":false,"error":"Se esperaba un objeto"}', "application/json")
            return
        DATA.mkdir(exist_ok=True)
        # Only overwrite collections that were sent, so older clients never wipe new files.
        for key, path in FILES.items():
            if key in payload:
                value = payload[key]
                if not isinstance(value, list):
                    self.send(400, json.dumps({"ok": False, "error": f"{key} debe ser una lista"}), "application/json")
                    return
        for key, path in FILES.items():
            if key in payload:
                write_json(path, payload[key])
        self.send(200, '{"ok":true}', "application/json")


if __name__ == "__main__":
    DATA.mkdir(exist_ok=True)
    for path in FILES.values():
        if not path.exists():
            write_json(path, [])
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"Abre http://127.0.0.1:{PORT}")
    server.serve_forever()
