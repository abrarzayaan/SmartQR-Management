import csv
import io
import os
import re
import secrets
import string
import urllib.parse
import zipfile
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Request, Response, BackgroundTasks
from fastapi.responses import RedirectResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from backend.database import (
    init_db,
    create_qr_record,
    get_all_qrs,
    get_qr_by_id,
    get_qr_by_short_code,
    update_qr_record,
    delete_qr_record,
    record_scan_event,
    get_scan_analytics,
    get_overall_stats,
    verify_password,
    # Folders
    create_folder,
    get_all_folders,
    get_folder_by_id,
    update_folder,
    delete_folder,
    # Brand Kits
    create_brand_kit,
    get_all_brand_kits,
    get_brand_kit_by_id,
    delete_brand_kit,
    # Routing Rules
    create_routing_rule,
    get_routing_rules_for_qr,
    update_routing_rule,
    delete_routing_rule,
    parse_user_agent
)
from backend.models import (
    QRCodeCreateRequest, 
    QRCodeUpdateRequest,
    FolderCreate,
    FolderUpdate,
    BrandKitCreate,
    RoutingRuleCreate,
    RoutingRuleUpdate,
    BulkQRCreateRequest
)
from backend.qr_service import generate_qr_image, generate_qr_svg, generate_qr_pdf

app = FastAPI(
    title="SmartQR Management API",
    description="Enterprise-grade Smart Dynamic QR Code Generator & Analytics Platform",
    version="2.0.0"
)

# Enable CORS for development convenience
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database schema and run auto-migrations
init_db()

def generate_short_code(length: int = 6) -> str:
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def get_base_url(request: Request) -> str:
    host = request.headers.get("host", "localhost:8000")
    scheme = request.url.scheme
    return f"{scheme}://{host}"

# --- QR API ENDPOINTS ---

@app.post("/api/qr/preview")
async def preview_qr(payload: QRCodeCreateRequest):
    """Generate instant live preview image without saving to DB."""
    try:
        content = payload.target_url
        if not content:
            content = "https://smartqr.io"
            
        img_bytes = generate_qr_image(
            data=content,
            fg_color=payload.fg_color,
            bg_color=payload.bg_color,
            gradient_type=payload.gradient_type,
            fg_color_2=payload.fg_color_2,
            dot_style=payload.dot_style,
            eye_frame=payload.eye_frame,
            eye_ball=payload.eye_ball,
            eye_color=payload.eye_color,
            error_correction=payload.error_correction,
            margin=payload.margin,
            size=min(payload.size, 600),
            logo_type=payload.logo_type,
            logo_data=payload.logo_data,
            frame_style=payload.frame_style,
            frame_text=payload.frame_text or "SCAN ME",
            frame_color=payload.frame_color or "#0f172a"
        )
        return Response(content=img_bytes, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/qr")
async def create_qr(payload: QRCodeCreateRequest, request: Request):
    """Create and persist a new Smart QR code dynamically."""
    short_code = generate_short_code()
    while get_qr_by_short_code(short_code):
        short_code = generate_short_code()
        
    data = payload.model_dump()
    data['short_code'] = short_code
    if data.get('logo_type') != 'none' or data.get('logo_data'):
        data['error_correction'] = 'H'
    
    record = create_qr_record(data)
    
    base_url = get_base_url(request)
    record['dynamic_url'] = f"{base_url}/r/{short_code}"
    return record

@app.get("/api/qr")
async def list_qrs(
    request: Request, 
    search: Optional[str] = None, 
    qr_type: Optional[str] = None,
    folder_id: Optional[int] = None
):
    """Retrieve all QR codes dynamically with search, type, and folder filtering."""
    qrs = get_all_qrs(search=search, qr_type=qr_type, folder_id=folder_id)
    base_url = get_base_url(request)
    for q in qrs:
        q['dynamic_url'] = f"{base_url}/r/{q['short_code']}"
    return qrs

@app.get("/api/qr/{qr_id}")
async def get_qr(qr_id: int, request: Request):
    """Fetch single QR code by ID with dynamic routing rules."""
    qr = get_qr_by_id(qr_id)
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")
    base_url = get_base_url(request)
    qr['dynamic_url'] = f"{base_url}/r/{qr['short_code']}"
    qr['routing_rules'] = get_routing_rules_for_qr(qr_id)
    return qr

@app.put("/api/qr/{qr_id}")
async def update_qr(qr_id: int, payload: QRCodeUpdateRequest, request: Request):
    """Update destination URL, styling, folder, or access rules of an existing QR code."""
    existing = get_qr_by_id(qr_id)
    if not existing:
        raise HTTPException(status_code=404, detail="QR code not found")
        
    updates = payload.model_dump(exclude_unset=True)
    updated = update_qr_record(qr_id, updates)
    base_url = get_base_url(request)
    updated['dynamic_url'] = f"{base_url}/r/{updated['short_code']}"
    return updated

@app.delete("/api/qr/{qr_id}")
async def delete_qr(qr_id: int):
    """Delete a QR code, its routing rules, and associated scan logs."""
    existing = get_qr_by_id(qr_id)
    if not existing:
        raise HTTPException(status_code=404, detail="QR code not found")
    delete_qr_record(qr_id)
    return {"success": True, "message": "QR code deleted successfully"}

@app.get("/api/qr/{qr_id}/download/{fmt}")
async def download_qr(qr_id: int, fmt: str, request: Request, size: Optional[int] = None):
    """Download the QR code image in high-resolution PNG, SVG vector, or print-ready PDF."""
    qr = get_qr_by_id(qr_id)
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")
        
    base_url = get_base_url(request)
    encoded_data = f"{base_url}/r/{qr['short_code']}" if qr['qr_type'] == 'dynamic' else qr['target_url']
    
    clean_title = "".join(c for c in qr['title'] if c.isalnum() or c in (' ', '-', '_')).strip().replace(' ', '_')
    if not clean_title:
        clean_title = f"smart_qr_{qr['short_code']}"
        
    fmt = fmt.lower()
    if fmt == 'svg':
        svg_content = generate_qr_svg(
            data=encoded_data,
            fg_color=qr['fg_color'],
            bg_color=qr['bg_color'],
            error_correction="H" if qr.get('logo_type') != 'none' else qr['error_correction'],
            margin=qr['margin'],
            logo_type=qr.get('logo_type', 'none')
        )
        return Response(
            content=svg_content,
            media_type="image/svg+xml",
            headers={"Content-Disposition": f'attachment; filename="{clean_title}.svg"'}
        )
    elif fmt == 'pdf':
        pdf_bytes = generate_qr_pdf(
            data=encoded_data,
            title=qr['title'],
            fg_color=qr['fg_color'],
            bg_color=qr['bg_color'],
            gradient_type=qr['gradient_type'],
            fg_color_2=qr['fg_color_2'],
            dot_style=qr['dot_style'],
            eye_frame=qr.get('eye_frame', 'square'),
            eye_ball=qr.get('eye_ball', 'square'),
            eye_color=qr.get('eye_color'),
            error_correction=qr['error_correction'],
            margin=qr['margin'],
            size=size or 2400,
            logo_type=qr['logo_type'],
            logo_data=qr['logo_data'],
            frame_style=qr.get('frame_style', 'none'),
            frame_text=qr.get('frame_text', 'SCAN ME'),
            frame_color=qr.get('frame_color', '#0f172a')
        )
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{clean_title}.pdf"'}
        )
    else:
        req_size = size or qr['size'] or 800
        png_bytes = generate_qr_image(
            data=encoded_data,
            fg_color=qr['fg_color'],
            bg_color=qr['bg_color'],
            gradient_type=qr['gradient_type'],
            fg_color_2=qr['fg_color_2'],
            dot_style=qr['dot_style'],
            eye_frame=qr.get('eye_frame', 'square'),
            eye_ball=qr.get('eye_ball', 'square'),
            eye_color=qr.get('eye_color'),
            error_correction=qr['error_correction'],
            margin=qr['margin'],
            size=req_size,
            logo_type=qr['logo_type'],
            logo_data=qr['logo_data'],
            frame_style=qr.get('frame_style', 'none'),
            frame_text=qr.get('frame_text', 'SCAN ME'),
            frame_color=qr.get('frame_color', '#0f172a')
        )
        return Response(
            content=png_bytes,
            media_type="image/png",
            headers={"Content-Disposition": f'attachment; filename="{clean_title}.png"'}
        )

@app.get("/api/qr/{qr_id}/image")
async def get_qr_live_image(qr_id: int, request: Request):
    """Returns rendered thumbnail PNG image dynamically for dashboard cards."""
    qr = get_qr_by_id(qr_id)
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")
    base_url = get_base_url(request)
    encoded_data = f"{base_url}/r/{qr['short_code']}" if qr['qr_type'] == 'dynamic' else qr['target_url']
    
    png_bytes = generate_qr_image(
        data=encoded_data,
        fg_color=qr['fg_color'],
        bg_color=qr['bg_color'],
        gradient_type=qr['gradient_type'],
        fg_color_2=qr['fg_color_2'],
        dot_style=qr['dot_style'],
        eye_frame=qr.get('eye_frame', 'square'),
        eye_ball=qr.get('eye_ball', 'square'),
        eye_color=qr.get('eye_color'),
        error_correction=qr['error_correction'],
        margin=qr['margin'],
        size=400,
        logo_type=qr['logo_type'],
        logo_data=qr['logo_data'],
        frame_style=qr.get('frame_style', 'none'),
        frame_text=qr.get('frame_text', 'SCAN ME'),
        frame_color=qr.get('frame_color', '#0f172a')
    )
    return Response(content=png_bytes, media_type="image/png")

@app.get("/api/qr/{qr_id}/analytics")
async def qr_analytics(qr_id: int):
    """Get scan metrics, unique visitors, and device/OS telemetry for a QR code."""
    qr = get_qr_by_id(qr_id)
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")
    return get_scan_analytics(qr_id)

@app.get("/api/stats")
async def overall_stats():
    """Get dynamic workspace statistics."""
    return get_overall_stats()

# --- BULK GENERATION API ENDPOINTS (TASK-602) ---

@app.get("/api/qr/bulk/template")
async def download_bulk_template():
    """Download standard CSV template for bulk QR code generation."""
    csv_content = "Title,Target_URL\r\nCompany Website,https://example.com\r\nProduct Catalog,https://example.com/catalog\r\nCustomer Support,https://example.com/help\r\nVIP Promo,https://example.com/promo\r\nCEO Contact,mailto:ceo@example.com\r\n"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="smartqr_bulk_template.csv"'}
    )

@app.post("/api/qr/bulk")
async def bulk_generate_qrs(payload: BulkQRCreateRequest, request: Request):
    """
    TASK-602: Bulk QR Code Generation Engine (CSV Upload -> ZIP Export)
    Generates up to 500 QR codes from CSV rows, saves them to database,
    and returns a ZIP archive containing all PNGs + manifest.csv.
    """
    raw_csv = payload.csv_text.strip()
    if not raw_csv:
        raise HTTPException(status_code=400, detail="CSV content is empty")

    reader = csv.reader(io.StringIO(raw_csv))
    rows = []
    header_skipped = False
    for r in reader:
        if not r or not any(field.strip() for field in r):
            continue
        first_col = r[0].strip().lower()
        if not header_skipped and ("title" in first_col or "name" in first_col or "label" in first_col):
            header_skipped = True
            continue
        title = r[0].strip() if len(r) >= 1 else "Bulk QR"
        target_url = r[1].strip() if len(r) >= 2 else ""
        if target_url:
            rows.append({"title": title or "Bulk QR", "target_url": target_url})

    if not rows:
        raise HTTPException(status_code=400, detail="No valid data rows found in CSV. Expected format: Title,Target_URL")
    if len(rows) > 500:
        raise HTTPException(status_code=400, detail="Batch limit exceeded. Maximum 500 QR codes allowed per batch.")

    base_url = get_base_url(request)
    zip_buffer = io.BytesIO()
    manifest_rows = [["ID", "Short_Code", "Title", "Target_URL", "Dynamic_URL", "Created_At"]]

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for idx, item in enumerate(rows, start=1):
            short_code = generate_short_code()
            clean_title = re.sub(r'[^a-zA-Z0-9_\- ]', '', item['title']).strip() or f"qr_{idx}"
            clean_title = clean_title.replace(" ", "_")

            # Detect content type
            content_type = "url"
            tgt = item['target_url']
            if tgt.startswith("WIFI:"):
                content_type = "wifi"
            elif tgt.startswith("BEGIN:VCARD"):
                content_type = "vcard"
            elif tgt.startswith("mailto:"):
                content_type = "email"
            elif tgt.startswith("tel:"):
                content_type = "phone"
            elif tgt.startswith("sms:"):
                content_type = "sms"

            # Create DB record
            qr_data = {
                "short_code": short_code,
                "title": item['title'],
                "qr_type": payload.qr_type,
                "content_type": content_type,
                "target_url": item['target_url'],
                "fg_color": payload.fg_color,
                "bg_color": payload.bg_color,
                "gradient_type": payload.gradient_type,
                "fg_color_2": payload.fg_color_2,
                "dot_style": payload.dot_style,
                "eye_frame": payload.eye_frame,
                "eye_ball": payload.eye_ball,
                "eye_color": payload.eye_color,
                "error_correction": payload.error_correction,
                "margin": payload.margin,
                "size": payload.size,
                "folder_id": payload.folder_id
            }
            db_record = create_qr_record(qr_data)
            qr_id = db_record['id']
            dynamic_url = f"{base_url}/r/{short_code}"

            encoded_data = dynamic_url if payload.qr_type == "dynamic" else item['target_url']

            # Generate PNG
            png_bytes = generate_qr_image(
                data=encoded_data,
                fg_color=payload.fg_color,
                bg_color=payload.bg_color,
                gradient_type=payload.gradient_type,
                fg_color_2=payload.fg_color_2,
                dot_style=payload.dot_style,
                eye_frame=payload.eye_frame,
                eye_ball=payload.eye_ball,
                eye_color=payload.eye_color,
                error_correction=payload.error_correction,
                margin=payload.margin,
                size=payload.size
            )

            # Add to ZIP
            filename = f"qrcodes/{idx:03d}_{clean_title}_{short_code}.png"
            zip_file.writestr(filename, png_bytes)

            manifest_rows.append([str(qr_id), short_code, item['title'], item['target_url'], dynamic_url, db_record['created_at']])

        # Write manifest.csv into ZIP
        manifest_io = io.StringIO()
        manifest_writer = csv.writer(manifest_io)
        manifest_writer.writerows(manifest_rows)
        zip_file.writestr("manifest.csv", manifest_io.getvalue().encode("utf-8-sig"))

    zip_bytes = zip_buffer.getvalue()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="smartqr_bulk_{timestamp}.zip"'}
    )

# --- FOLDER API ENDPOINTS ---

@app.get("/api/folders")
async def list_folders():
    """List all workspace folders with dynamic QR counts."""
    return get_all_folders()

@app.post("/api/folders")
async def create_new_folder(payload: FolderCreate):
    """Create a new organization folder."""
    return create_folder(name=payload.name, color=payload.color)

@app.get("/api/folders/{folder_id}")
async def get_single_folder(folder_id: int):
    folder = get_folder_by_id(folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    return folder

@app.put("/api/folders/{folder_id}")
async def update_single_folder(folder_id: int, payload: FolderUpdate):
    folder = get_folder_by_id(folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    return update_folder(folder_id, payload.model_dump(exclude_unset=True))

@app.delete("/api/folders/{folder_id}")
async def delete_single_folder(folder_id: int):
    folder = get_folder_by_id(folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    delete_folder(folder_id)
    return {"success": True, "message": "Folder deleted successfully"}

# --- BRAND KIT API ENDPOINTS ---

@app.get("/api/brand-kits")
async def list_brand_kits():
    """List all saved Brand Kit styling presets."""
    return get_all_brand_kits()

@app.post("/api/brand-kits")
async def save_brand_kit(payload: BrandKitCreate):
    """Save a new Brand Kit preset."""
    return create_brand_kit(payload.model_dump())

@app.delete("/api/brand-kits/{kit_id}")
async def remove_brand_kit(kit_id: int):
    kit = get_brand_kit_by_id(kit_id)
    if not kit:
        raise HTTPException(status_code=404, detail="Brand kit not found")
    delete_brand_kit(kit_id)
    return {"success": True, "message": "Brand kit deleted successfully"}

# --- ROUTING RULES API ENDPOINTS ---

@app.get("/api/qr/{qr_id}/rules")
async def list_qr_routing_rules(qr_id: int):
    """List dynamic routing rules for a specific QR code."""
    qr = get_qr_by_id(qr_id)
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")
    return get_routing_rules_for_qr(qr_id)

@app.post("/api/qr/{qr_id}/rules")
async def add_qr_routing_rule(qr_id: int, payload: RoutingRuleCreate):
    """Add a dynamic routing rule (OS or time-based) to a QR code."""
    qr = get_qr_by_id(qr_id)
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")
    data = payload.model_dump()
    data['qr_id'] = qr_id
    return create_routing_rule(data)

@app.put("/api/rules/{rule_id}")
async def modify_routing_rule(rule_id: int, payload: RoutingRuleUpdate):
    rule = update_routing_rule(rule_id, payload.model_dump(exclude_unset=True))
    if not rule:
        raise HTTPException(status_code=404, detail="Routing rule not found")
    return rule

@app.delete("/api/rules/{rule_id}")
async def remove_routing_rule(rule_id: int):
    deleted = delete_routing_rule(rule_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Routing rule not found")
    return {"success": True, "message": "Routing rule deleted successfully"}

# --- MULTI-PAYLOAD ENGINES (VCARD PLUS, WI-FI, APP BRIDGES) ---

def parse_vcard_payload(payload_str: str) -> dict:
    """Parses RFC 2426 vCard format into structured contact attributes."""
    data = {
        "fn": "",
        "n": "",
        "title": "",
        "org": "",
        "tel": "",
        "email": "",
        "url": "",
        "adr": "",
        "note": ""
    }
    for line in (payload_str or "").splitlines():
        line = line.strip()
        if not line or ":" not in line:
            continue
        key_part, val = line.split(":", 1)
        key = key_part.split(";")[0].upper()
        val = val.strip()
        if key == "FN":
            data["fn"] = val
        elif key == "N" and not data["fn"]:
            parts = [p.strip() for p in val.split(";") if p.strip()]
            if len(parts) >= 2:
                data["fn"] = f"{parts[1]} {parts[0]}"
            elif parts:
                data["fn"] = parts[0]
            data["n"] = val
        elif key == "TITLE":
            data["title"] = val
        elif key == "ORG":
            data["org"] = val
        elif key == "TEL":
            data["tel"] = val
        elif key == "EMAIL":
            data["email"] = val
        elif key == "URL":
            data["url"] = val
        elif key == "ADR":
            addr_parts = [p.strip() for p in val.split(";") if p.strip()]
            data["adr"] = ", ".join(addr_parts)
        elif key == "NOTE":
            data["note"] = val
            
    if not data["fn"]:
        data["fn"] = "Contact Profile"
    return data

def generate_vcf_download_string(v: dict) -> str:
    """Builds an RFC 2426 vCard 3.0 string for contact import."""
    lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        f"FN:{v.get('fn', 'Contact')}",
    ]
    if v.get("n"):
        lines.append(f"N:{v['n']}")
    else:
        name_parts = v.get("fn", "Contact").split(None, 1)
        if len(name_parts) == 2:
            lines.append(f"N:{name_parts[1]};{name_parts[0]};;;")
        else:
            lines.append(f"N:{name_parts[0]};;;;")
            
    if v.get("org"):
        lines.append(f"ORG:{v['org']}")
    if v.get("title"):
        lines.append(f"TITLE:{v['title']}")
    if v.get("tel"):
        lines.append(f"TEL;TYPE=CELL,VOICE:{v['tel']}")
    if v.get("email"):
        lines.append(f"EMAIL;TYPE=INTERNET,PREF:{v['email']}")
    if v.get("url"):
        lines.append(f"URL:{v['url']}")
    if v.get("adr"):
        lines.append(f"ADR;TYPE=WORK:;;{v['adr']};;;")
    if v.get("note"):
        lines.append(f"NOTE:{v['note']}")
    lines.append("END:VCARD\r\n")
    return "\r\n".join(lines)

def parse_wifi_payload(payload_str: str) -> dict:
    """Parses standard WIFI:T:...;S:...;P:...;H:...;; string."""
    data = {
        "ssid": "Wi-Fi Network",
        "security": "WPA/WPA2",
        "password": "",
        "hidden": False
    }
    if not payload_str.startswith("WIFI:"):
        return data
        
    body = payload_str[5:]
    parts = body.split(";")
    for part in parts:
        if not part:
            continue
        if ":" in part:
            k, v = part.split(":", 1)
            k = k.upper()
            if k == "S":
                data["ssid"] = v
            elif k == "P":
                data["password"] = v
            elif k == "T":
                data["security"] = "None (Open)" if v.lower() == "nopass" else v
            elif k == "H":
                data["hidden"] = v.lower() in ("true", "1", "yes")
    return data

def render_not_found_html(title: str = "QR Code Not Found", message: str = "This QR code does not exist or may have been permanently removed.") -> str:
    return f"""<!DOCTYPE html>
<html>
    <head><title>{title} | SmartQR</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
    <body style="margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0f172a; color:#f8fafc; font-family:system-ui,-apple-system,sans-serif; text-align:center; padding:20px;">
        <div style="background:#1e293b; padding:40px; border-radius:16px; border:1px solid #334155; max-width:440px;">
            <h2 style="margin:0 0 12px 0; font-size:24px; color:#f43f5e;">{title}</h2>
            <p style="margin:0; color:#94a3b8; line-height:1.6;">{message}</p>
        </div>
    </body>
</html>"""

def render_vcard_html(v: dict, short_code: str, title: str, qr_id: int = None) -> str:
    """Renders a responsive, dark-luxe digital business card profile."""
    name = v.get("fn") or "Contact Profile"
    initials = "".join([part[0].upper() for part in name.split()[:2]]) or "QR"
    role = v.get("title") or ""
    org = v.get("org") or ""
    tel = v.get("tel") or ""
    email = v.get("email") or ""
    url = v.get("url") or ""
    adr = v.get("adr") or ""
    note = v.get("note") or ""
    clean_tel = re.sub(r'[^0-9+]', '', tel)
    wa_tel = clean_tel.lstrip('+')

    # Quick action buttons
    call_btn = f'<a href="tel:{tel}" class="action-circle-btn"><i class="fa-solid fa-phone"></i><span>Call</span></a>' if tel else '<span class="action-circle-btn disabled"><i class="fa-solid fa-phone"></i><span>Call</span></span>'
    email_btn = f'<a href="mailto:{email}" class="action-circle-btn"><i class="fa-solid fa-envelope"></i><span>Email</span></a>' if email else '<span class="action-circle-btn disabled"><i class="fa-solid fa-envelope"></i><span>Email</span></span>'
    wa_btn = f'<a href="https://wa.me/{wa_tel}" target="_blank" class="action-circle-btn"><i class="fa-brands fa-whatsapp"></i><span>WhatsApp</span></a>' if wa_tel else '<span class="action-circle-btn disabled"><i class="fa-brands fa-whatsapp"></i><span>WhatsApp</span></span>'
    web_target = url if url.startswith(("http://", "https://")) else f"https://{url}"
    web_btn = f'<a href="{web_target}" target="_blank" class="action-circle-btn"><i class="fa-solid fa-globe"></i><span>Website</span></a>' if url else '<span class="action-circle-btn disabled"><i class="fa-solid fa-globe"></i><span>Website</span></span>'

    # Detail rows
    detail_rows = []
    if tel:
        detail_rows.append(f"""
        <div class="info-row">
            <div class="info-left">
                <div class="info-icon"><i class="fa-solid fa-phone"></i></div>
                <div class="info-texts">
                    <span class="info-label">Mobile Phone</span>
                    <a href="tel:{tel}" class="info-value">{tel}</a>
                </div>
            </div>
            <button class="copy-btn" onclick="copyText('{tel}', this)" title="Copy Phone"><i class="fa-regular fa-copy"></i></button>
        </div>
        """)
    if email:
        detail_rows.append(f"""
        <div class="info-row">
            <div class="info-left">
                <div class="info-icon"><i class="fa-solid fa-envelope"></i></div>
                <div class="info-texts">
                    <span class="info-label">Email Address</span>
                    <a href="mailto:{email}" class="info-value">{email}</a>
                </div>
            </div>
            <button class="copy-btn" onclick="copyText('{email}', this)" title="Copy Email"><i class="fa-regular fa-copy"></i></button>
        </div>
        """)
    if adr:
        map_url = f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(adr)}"
        detail_rows.append(f"""
        <div class="info-row">
            <div class="info-left">
                <div class="info-icon"><i class="fa-solid fa-location-dot"></i></div>
                <div class="info-texts">
                    <span class="info-label">Location</span>
                    <a href="{map_url}" target="_blank" class="info-value">{adr}</a>
                </div>
            </div>
            <a href="{map_url}" target="_blank" class="copy-btn" title="Open in Maps"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
        </div>
        """)
    if note:
        detail_rows.append(f"""
        <div class="note-block">
            <div style="font-size:11px; color:#64748b; text-transform:uppercase; font-weight:600; margin-bottom:4px;">About / Bio</div>
            <div>{note}</div>
        </div>
        """)

    details_html = "".join(detail_rows)
    org_badge = f'<span class="badge-org">{org}</span>' if org else ''
    role_html = f'<div class="vcard-subtitle"><span>{role}</span>{org_badge}</div>' if (role or org) else ''

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <title>{name} | Digital Business Card</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        :root {{
            --bg-body: #0a0e17;
            --card-bg: #121824;
            --card-subtle: #172033;
            --border: #1e293b;
            --border-hover: #334155;
            --primary: #3b82f6;
            --primary-glow: rgba(59, 130, 246, 0.25);
            --emerald: #10b981;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --text-faint: #64748b;
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            background-color: var(--bg-body);
            background-image: radial-gradient(circle at 50% 0%, #1e293b 0%, #0a0e17 70%);
            color: var(--text-main);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px 16px;
        }}
        .vcard-container {{
            width: 100%;
            max-width: 440px;
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
        }}
        .vcard-header {{
            position: relative;
            background: linear-gradient(180deg, rgba(59, 130, 246, 0.15) 0%, transparent 100%);
            padding: 36px 24px 20px;
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }}
        .avatar-ring {{
            width: 88px;
            height: 88px;
            margin: 0 auto 16px;
            border-radius: 50%;
            padding: 3px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 24px var(--primary-glow);
        }}
        .avatar-inner {{
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: var(--card-subtle);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -1px;
        }}
        .vcard-name {{
            font-size: 22px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 6px;
            letter-spacing: -0.3px;
        }}
        .vcard-subtitle {{
            font-size: 14px;
            color: var(--text-muted);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            flex-wrap: wrap;
        }}
        .badge-org {{
            background: rgba(59, 130, 246, 0.15);
            color: #60a5fa;
            padding: 2px 8px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
            border: 1px solid rgba(59, 130, 246, 0.3);
        }}
        .actions-bar {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            padding: 16px 20px;
            background: var(--card-subtle);
            border-bottom: 1px solid var(--border);
        }}
        .action-circle-btn {{
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            color: var(--text-main);
            text-decoration: none;
            padding: 10px 4px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.06);
            transition: all 0.2s ease;
            font-size: 11px;
            font-weight: 500;
        }}
        .action-circle-btn:hover {{
            background: rgba(59, 130, 246, 0.15);
            border-color: rgba(59, 130, 246, 0.4);
            color: #60a5fa;
            transform: translateY(-2px);
        }}
        .action-circle-btn i {{
            font-size: 18px;
            color: #60a5fa;
        }}
        .action-circle-btn.disabled {{
            opacity: 0.3;
            pointer-events: none;
        }}
        .vcard-body {{
            padding: 24px 20px;
            display: flex;
            flex-direction: column;
            gap: 14px;
        }}
        .info-row {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 14px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border);
            border-radius: 12px;
            gap: 12px;
        }}
        .info-left {{
            display: flex;
            align-items: center;
            gap: 12px;
            overflow: hidden;
        }}
        .info-icon {{
            width: 36px;
            height: 36px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #60a5fa;
            font-size: 15px;
            flex-shrink: 0;
        }}
        .info-texts {{
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }}
        .info-label {{
            font-size: 11px;
            color: var(--text-faint);
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
        }}
        .info-value {{
            font-size: 13.5px;
            color: var(--text-main);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-decoration: none;
        }}
        .info-value:hover {{
            color: #60a5fa;
        }}
        .copy-btn {{
            background: transparent;
            border: none;
            color: var(--text-faint);
            cursor: pointer;
            padding: 6px;
            border-radius: 6px;
            transition: 0.15s;
        }}
        .copy-btn:hover {{
            color: var(--text-main);
            background: rgba(255, 255, 255, 0.08);
        }}
        .note-block {{
            padding: 14px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border);
            border-radius: 12px;
            font-size: 13px;
            color: var(--text-muted);
            line-height: 1.5;
        }}
        .btn-download-vcf {{
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            padding: 16px;
            margin-top: 8px;
            background: #2563eb;
            color: #ffffff;
            font-size: 15px;
            font-weight: 600;
            border-radius: 14px;
            text-decoration: none;
            transition: all 0.2s ease;
            box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);
        }}
        .btn-download-vcf:hover {{
            background: #1d4ed8;
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
            transform: translateY(-1px);
        }}
        .vcard-footer {{
            text-align: center;
            padding: 16px 20px 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 12px;
            color: var(--text-faint);
        }}
        .vcard-footer a {{
            color: var(--text-muted);
            text-decoration: none;
        }}
        .vcard-footer a:hover {{
            color: #60a5fa;
        }}
    </style>
</head>
<body>
    <div class="vcard-container">
        <div class="vcard-header">
            <div class="avatar-ring">
                <div class="avatar-inner">{initials}</div>
            </div>
            <h1 class="vcard-name">{name}</h1>
            {role_html}
        </div>
        
        <div class="actions-bar">
            {call_btn}
            {email_btn}
            {wa_btn}
            {web_btn}
        </div>
        
        <div class="vcard-body">
            {details_html}
            <a href="/v/{short_code}/vcf" class="btn-download-vcf">
                <i class="fa-solid fa-user-plus"></i>
                <span>Save Contact to Phone (.vcf)</span>
            </a>
        </div>
        
        <div class="vcard-footer">
            <span>Powered by <strong>SmartQR Platform</strong> • Dynamic Contact Card</span>
        </div>
    </div>
    
    <script>
    function copyText(val, btn) {{
        navigator.clipboard.writeText(val).then(() => {{
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check" style="color:#10b981;"></i>';
            setTimeout(() => {{ btn.innerHTML = orig; }}, 1600);
        }});
    }}
    </script>
</body>
</html>"""

def render_wifi_html(w: dict, short_code: str, title: str) -> str:
    """Renders a clean Wi-Fi access pass with instant password copy."""
    ssid = w.get("ssid", "Wi-Fi Network")
    password = w.get("password", "")
    sec = w.get("security", "WPA/WPA2")
    hidden_badge = '<span style="background:rgba(239, 68, 68, 0.15); color:#f87171; border:1px solid rgba(239,68,68,0.3); padding:2px 8px; border-radius:999px; font-size:11px; margin-left:6px;">Hidden SSID</span>' if w.get("hidden") else ''

    copy_btn = f'<button class="copy-pass-btn" onclick="copyWifiPass(\'{password}\', this)"><i class="fa-regular fa-copy"></i> Copy</button>' if password else ''

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wi-Fi Access Pass | SmartQR</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        :root {{
            --bg-body: #0a0e17;
            --card-bg: #121824;
            --border: #1e293b;
            --primary: #3b82f6;
            --emerald: #10b981;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            background-color: var(--bg-body);
            background-image: radial-gradient(circle at 50% 0%, #1e293b 0%, #0a0e17 70%);
            color: var(--text-main);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px 16px;
        }}
        .wifi-card {{
            width: 100%;
            max-width: 420px;
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 32px 24px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
        }}
        .wifi-icon-badge {{
            width: 72px;
            height: 72px;
            margin: 0 auto 18px;
            border-radius: 50%;
            background: rgba(59, 130, 246, 0.12);
            border: 1px solid rgba(59, 130, 246, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #60a5fa;
            font-size: 28px;
        }}
        .wifi-title {{ font-size: 22px; font-weight: 700; margin-bottom: 6px; }}
        .wifi-ssid {{
            display: inline-flex;
            align-items: center;
            background: rgba(255, 255, 255, 0.05);
            padding: 6px 14px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            color: #38bdf8;
            margin: 12px 0 20px;
            border: 1px solid rgba(56, 189, 248, 0.2);
        }}
        .pass-box {{
            background: #090d16;
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            text-align: left;
        }}
        .pass-val {{
            font-family: monospace;
            font-size: 16px;
            color: #ffffff;
            letter-spacing: 1px;
            word-break: break-all;
        }}
        .copy-pass-btn {{
            background: #2563eb;
            color: #fff;
            border: none;
            padding: 8px 14px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: 0.2s;
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
        }}
        .copy-pass-btn:hover {{ background: #1d4ed8; }}
        .guide-steps {{
            text-align: left;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 16px;
            font-size: 13px;
            color: var(--text-muted);
            line-height: 1.6;
            margin-bottom: 20px;
        }}
        .guide-steps ol {{ padding-left: 20px; }}
        .guide-steps li {{ margin-bottom: 6px; }}
        .guide-steps li:last-child {{ margin-bottom: 0; }}
    </style>
</head>
<body>
    <div class="wifi-card">
        <div class="wifi-icon-badge"><i class="fa-solid fa-wifi"></i></div>
        <h1 class="wifi-title">Wi-Fi Access Pass</h1>
        <p style="color:var(--text-muted); font-size:14px;">Connect seamlessly without manual typing</p>
        <div class="wifi-ssid"><i class="fa-solid fa-signal" style="margin-right:6px;"></i>{ssid}{hidden_badge}</div>
        
        <div class="pass-box">
            <div>
                <div style="font-size:11px; color:#64748b; text-transform:uppercase; font-weight:600; margin-bottom:4px;">Network Password ({sec})</div>
                <div class="pass-val" id="passText">{password or 'None (Open Network)'}</div>
            </div>
            {copy_btn}
        </div>
        
        <div class="guide-steps">
            <strong style="color:#f8fafc; display:block; margin-bottom:8px;">How to Connect:</strong>
            <ol>
                <li>Tap <strong>Copy</strong> to copy the password above</li>
                <li>Open your device's <strong>Wi-Fi Settings</strong></li>
                <li>Select <strong>{ssid}</strong> and paste the password</li>
            </ol>
        </div>
        
        <div style="font-size:12px; color:#64748b;">SmartQR Platform • Instant Wi-Fi Sharing</div>
    </div>
    <script>
    function copyWifiPass(pass, btn) {{
        navigator.clipboard.writeText(pass).then(() => {{
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            btn.style.background = '#10b981';
            setTimeout(() => {{
                btn.innerHTML = orig;
                btn.style.background = '#2563eb';
            }}, 2000);
        }});
    }}
    </script>
</body>
</html>"""

def render_smart_bridge_html(short_code: str, app_uri: str, fallback_url: str, app_name: str) -> str:
    """Renders a high-speed app deep-link bridge with 1.5s automatic browser fallback."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Launching {app_name} | SmartQR</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        :root {{
            --bg-body: #0a0e17;
            --card-bg: #121824;
            --border: #1e293b;
            --primary: #3b82f6;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            background-color: var(--bg-body);
            background-image: radial-gradient(circle at 50% 0%, #1e293b 0%, #0a0e17 70%);
            color: var(--text-main);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px 16px;
            text-align: center;
        }}
        .bridge-card {{
            width: 100%;
            max-width: 420px;
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 36px 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
        }}
        .pulse-icon {{
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            border-radius: 50%;
            background: rgba(59, 130, 246, 0.12);
            border: 2px solid #3b82f6;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            color: #60a5fa;
            animation: pulse-ring 2s infinite;
        }}
        @keyframes pulse-ring {{
            0% {{ box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }}
            70% {{ box-shadow: 0 0 0 16px rgba(59, 130, 246, 0); }}
            100% {{ box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }}
        }}
        .bridge-title {{ font-size: 22px; font-weight: 700; margin-bottom: 8px; }}
        .bridge-subtitle {{ font-size: 14px; color: var(--text-muted); margin-bottom: 24px; line-height: 1.5; }}
        .btn-launch {{
            display: block;
            width: 100%;
            padding: 14px;
            background: #2563eb;
            color: #fff;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            margin-bottom: 12px;
            transition: 0.2s;
        }}
        .btn-launch:hover {{ background: #1d4ed8; }}
        .btn-fallback {{
            display: block;
            width: 100%;
            padding: 13px;
            background: rgba(255, 255, 255, 0.05);
            color: var(--text-main);
            border: 1px solid var(--border);
            border-radius: 12px;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            transition: 0.2s;
        }}
        .btn-fallback:hover {{ background: rgba(255, 255, 255, 0.1); border-color: #334155; }}
        #fallbackNotice {{ display: none; margin-top: 16px; font-size: 13px; color: #94a3b8; }}
    </style>
</head>
<body>
    <div class="bridge-card">
        <div class="pulse-icon"><i class="fa-solid fa-up-right-from-square"></i></div>
        <h1 class="bridge-title">Launching {app_name}</h1>
        <p class="bridge-subtitle">Attempting to open the application on your device...</p>
        
        <a href="{app_uri}" class="btn-launch" id="btnLaunchApp"><i class="fa-solid fa-arrow-up-right-from-square" style="margin-right:6px;"></i> Launch {app_name}</a>
        <a href="{fallback_url}" class="btn-fallback" id="btnFallbackWeb"><i class="fa-solid fa-globe" style="margin-right:6px;"></i> Open in Web Browser</a>
        
        <div id="fallbackNotice">App not installed? Tap <strong>Open in Web Browser</strong> above.</div>
    </div>
    <script>
        const appUri = "{app_uri}";
        const fallbackUrl = "{fallback_url}";
        // Attempt immediate deep-link trigger
        window.location.href = appUri;
        // After 1.5 seconds, display fallback notice
        setTimeout(function() {{
            const notice = document.getElementById("fallbackNotice");
            if (notice) notice.style.display = "block";
        }}, 1500);
    </script>
</body>
</html>"""

# --- VCARD PLUS PROFILE & VCF DOWNLOAD ENDPOINTS (TASK-501) ---

@app.get("/v/{short_code}")
async def view_vcard_profile(short_code: str, request: Request, background_tasks: BackgroundTasks):
    """
    Renders the hosted Digital Business Card (vCard Plus) mobile profile.
    Logs telemetry asynchronously via BackgroundTasks.
    """
    qr = get_qr_by_short_code(short_code)
    if not qr:
        return HTMLResponse(content=render_not_found_html(), status_code=404)
        
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "")
    
    background_tasks.add_task(
        record_scan_event,
        qr_id=qr['id'],
        ip_address=client_ip,
        user_agent=user_agent,
        headers=dict(request.headers)
    )
    
    vcard = parse_vcard_payload(qr['target_url'])
    html = render_vcard_html(vcard, short_code, qr['title'], qr_id=qr['id'])
    return HTMLResponse(content=html, status_code=200)

@app.get("/v/{short_code}/vcf")
async def download_vcard_file(short_code: str):
    """
    Generates and downloads standard RFC 2426 .vcf file for direct contact import.
    """
    qr = get_qr_by_short_code(short_code)
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")
        
    vcard = parse_vcard_payload(qr['target_url'])
    vcf_content = generate_vcf_download_string(vcard)
    safe_fn = re.sub(r'[^a-zA-Z0-9_\- ]', '', vcard.get('fn', 'contact')).strip() or "contact"
    safe_fn = safe_fn.replace(" ", "_")
    
    return Response(
        content=vcf_content,
        media_type="text/vcard",
        headers={
            "Content-Disposition": f'attachment; filename="{safe_fn}.vcf"'
        }
    )

# --- ZERO-LATENCY DYNAMIC SMART REDIRECT ENGINE ---

@app.get("/r/{short_code}")
async def dynamic_redirect(short_code: str, request: Request, background_tasks: BackgroundTasks):
    """
    Core Smart QR feature:
    Zero-latency redirection pipeline (<50ms).
    Evaluates security gates, OS/device rules, and schedules, then dispatches telemetry
    logging to FastAPI BackgroundTasks without delaying the client's HTTP 307 redirect!
    """
    qr = get_qr_by_short_code(short_code)
    if not qr:
        return HTMLResponse(
            content="""
            <!DOCTYPE html>
            <html>
                <head><title>QR Code Not Found | SmartQR</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
                <body style="margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0f172a; color:#f8fafc; font-family:system-ui,-apple-system,sans-serif; text-align:center; padding:20px;">
                    <div style="background:#1e293b; padding:40px; border-radius:16px; border:1px solid #334155; max-width:440px;">
                        <h2 style="margin:0 0 12px 0; font-size:24px; color:#f43f5e;">QR Code Not Found</h2>
                        <p style="margin:0; color:#94a3b8; line-height:1.6;">This QR code does not exist or may have been permanently removed.</p>
                    </div>
                </body>
            </html>
            """,
            status_code=404
        )
        
    now = datetime.now()
    
    # 1. Expiration check
    if qr.get('expires_at'):
        try:
            exp = datetime.fromisoformat(qr['expires_at'])
            if now > exp:
                return HTMLResponse(
                    content="""
                    <!DOCTYPE html>
                    <html>
                        <head><title>Campaign Expired | SmartQR</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
                        <body style="margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0f172a; color:#f8fafc; font-family:system-ui,-apple-system,sans-serif; text-align:center; padding:20px;">
                            <div style="background:#1e293b; padding:40px; border-radius:16px; border:1px solid #334155; max-width:440px;">
                                <h2 style="margin:0 0 12px 0; font-size:24px; color:#f59e0b;">QR Code Expired</h2>
                                <p style="margin:0; color:#94a3b8; line-height:1.6;">This promotional campaign or QR destination has expired.</p>
                            </div>
                        </body>
                    </html>
                    """,
                    status_code=410
                )
        except Exception:
            pass

    # 2. Scan limit check
    if qr.get('scan_limit') and qr.get('scan_limit') > 0:
        if qr['scan_count'] >= qr['scan_limit']:
            return HTMLResponse(
                content="""
                <!DOCTYPE html>
                <html>
                    <head><title>Scan Limit Reached | SmartQR</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
                    <body style="margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0f172a; color:#f8fafc; font-family:system-ui,-apple-system,sans-serif; text-align:center; padding:20px;">
                        <div style="background:#1e293b; padding:40px; border-radius:16px; border:1px solid #334155; max-width:440px;">
                            <h2 style="margin:0 0 12px 0; font-size:24px; color:#f59e0b;">Scan Limit Reached</h2>
                            <p style="margin:0; color:#94a3b8; line-height:1.6;">This QR code has reached its maximum allowable number of scans.</p>
                        </div>
                    </body>
                </html>
                """,
                status_code=403
            )

    # 3. Password protection check
    client_pin = request.query_params.get("pin")
    auth_cookie = request.cookies.get(f"smartqr_auth_{short_code}")
    if qr.get('password_hash'):
        is_authed = (auth_cookie == "granted")
        if not is_authed and client_pin:
            if verify_password(client_pin, qr['password_hash']):
                is_authed = True
        
        if not is_authed:
            # Render clean password unlock screen
            return HTMLResponse(
                content=f"""
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>Protected QR Code | SmartQR</title>
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                        <style>
                            * {{ box-sizing: border-box; }}
                            body {{ margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0f172a; color:#f8fafc; font-family:system-ui,-apple-system,sans-serif; padding:20px; }}
                            .card {{ background:#1e293b; padding:36px; border-radius:16px; border:1px solid #334155; max-width:420px; width:100%; text-align:center; box-shadow:0 20px 40px rgba(0,0,0,0.5); }}
                            input {{ width:100%; padding:14px; border-radius:10px; border:1px solid #475569; background:#0f172a; color:#fff; font-size:16px; margin:16px 0; outline:none; text-align:center; letter-spacing:3px; }}
                            input:focus {{ border-color:#3b82f6; ring:2px solid #3b82f6; }}
                            button {{ width:100%; padding:14px; border-radius:10px; border:none; background:#3b82f6; color:#fff; font-weight:600; font-size:16px; cursor:pointer; transition:0.2s; }}
                            button:hover {{ background:#2563eb; }}
                        </style>
                    </head>
                    <body>
                        <div class="card">
                            <div style="font-size:36px; margin-bottom:12px;">🔒</div>
                            <h2 style="margin:0 0 8px 0; font-size:22px;">Password Protected</h2>
                            <p style="margin:0; color:#94a3b8; font-size:14px;">Please enter the security PIN or password to access this destination.</p>
                            <form method="GET" action="/r/{short_code}">
                                <input type="password" name="pin" placeholder="Enter PIN / Password" required autofocus />
                                <button type="submit">Unlock & Continue</button>
                            </form>
                        </div>
                    </body>
                </html>
                """,
                status_code=401
            )

    # 4. Resolve Dynamic Routing Rules (OS, Time-of-day, Date window)
    target_url = qr['target_url'].strip()
    user_agent = request.headers.get("user-agent", "")
    parsed_ua = parse_user_agent(user_agent)
    client_os = parsed_ua["os_name"].lower()
    client_device = parsed_ua["device_type"].lower()
    
    rules = get_routing_rules_for_qr(qr['id'], active_only=True)
    rule_matched = False
    
    # Priority rule evaluation
    for rule in rules:
        rtype = rule['rule_type'].lower()
        ckey = rule['condition_key'].lower()
        cval = rule['condition_value'].strip()
        rurl = rule['redirect_url'].strip()
        
        if rtype == 'os':
            # Support iOS, Android, and Desktop
            if ckey in ('ios', 'apple', 'iphone', 'ipad') and client_os in ('ios', 'apple'):
                target_url = rurl
                rule_matched = True
                break
            elif ckey in ('android', 'playstore') and client_os == 'android':
                target_url = rurl
                rule_matched = True
                break
            elif ckey in ('desktop', 'windows', 'macos', 'mac', 'linux') and (client_device == 'desktop' or client_os in ('windows', 'macos', 'linux', 'chromeos')):
                target_url = rurl
                rule_matched = True
                break
            elif ckey == client_os:
                target_url = rurl
                rule_matched = True
                break
        elif rtype == 'time':
            # e.g. condition_value == '07:00-11:00' or overnight '22:00-05:00'
            try:
                start_str, end_str = cval.split('-')
                start_h, start_m = map(int, start_str.strip().split(':'))
                end_h, end_m = map(int, end_str.strip().split(':'))
                cur_min = now.hour * 60 + now.minute
                range_start = start_h * 60 + start_m
                range_end = end_h * 60 + end_m
                if range_start <= range_end:
                    matches = (range_start <= cur_min <= range_end)
                else:
                    matches = (cur_min >= range_start or cur_min <= range_end)
                if matches:
                    target_url = rurl
                    rule_matched = True
                    break
            except Exception:
                pass
        elif rtype == 'date':
            # e.g. condition_value == '2026-11-01:2026-11-30'
            try:
                start_d_str, end_d_str = cval.split(':')
                start_d = datetime.fromisoformat(start_d_str.strip()).date()
                end_d = datetime.fromisoformat(end_d_str.strip()).date()
                if start_d <= now.date() <= end_d:
                    target_url = rurl
                    rule_matched = True
                    break
            except Exception:
                pass

    client_ip = request.client.host if request.client else "unknown"
    
    # 5. Zero-latency async logging offload via FastAPI BackgroundTasks
    background_tasks.add_task(
        record_scan_event,
        qr_id=qr['id'],
        ip_address=client_ip,
        user_agent=user_agent,
        headers=dict(request.headers)
    )

    # A. Digital Business Card (vCard Plus) hosted view
    if qr.get('content_type') == 'vcard' or target_url.startswith('BEGIN:VCARD'):
        return RedirectResponse(url=f"/v/{short_code}", status_code=307)

    # B. Wi-Fi Access Pass hosted view
    if qr.get('content_type') == 'wifi' or target_url.startswith('WIFI:'):
        wifi_data = parse_wifi_payload(target_url)
        return HTMLResponse(content=render_wifi_html(wifi_data, short_code, qr['title']), status_code=200)

    # C. App Deep Link Smart Bridge (Instagram, Facebook, bKash, UPI)
    if target_url.startswith(('instagram://', 'fb://', 'bkash://', 'upi://')):
        app_name = "Application"
        fallback_url = "https://google.com"
        if target_url.startswith('instagram://'):
            app_name = "Instagram"
            m = re.search(r'username=([a-zA-Z0-9_.]+)', target_url)
            username = m.group(1) if m else ""
            fallback_url = f"https://www.instagram.com/{username}" if username else "https://www.instagram.com"
        elif target_url.startswith('fb://'):
            app_name = "Facebook"
            m = re.search(r'(?:profile|page)/([0-9]+)', target_url)
            pid = m.group(1) if m else ""
            fallback_url = f"https://www.facebook.com/{pid}" if pid else "https://www.facebook.com"
        elif target_url.startswith('bkash://'):
            app_name = "bKash"
            fallback_url = "https://www.bkash.com"
        elif target_url.startswith('upi://'):
            app_name = "UPI Payment"
            fallback_url = "https://www.npci.org.in"

        return HTMLResponse(content=render_smart_bridge_html(short_code, target_url, fallback_url, app_name), status_code=200)

    # D. Standard URL redirect
    if not target_url.startswith(("http://", "https://", "mailto:", "tel:", "sms:")):
        target_url = f"https://{target_url}"
        
    response = RedirectResponse(url=target_url, status_code=307)
    if qr.get('password_hash') and client_pin:
        # Save session cookie for authenticated user
        response.set_cookie(key=f"smartqr_auth_{short_code}", value="granted", max_age=3600, httponly=True)
        
    return response

# --- STATIC FRONTEND MOUNTING ---

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")
CSS_DIR = os.path.join(FRONTEND_DIR, "css")
JS_DIR = os.path.join(FRONTEND_DIR, "js")

if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")
if os.path.exists(CSS_DIR):
    app.mount("/css", StaticFiles(directory=CSS_DIR), name="css")
if os.path.exists(JS_DIR):
    app.mount("/js", StaticFiles(directory=JS_DIR), name="js")

@app.get("/")
async def root():
    index_file = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "SmartQR API is running. Frontend index.html not found yet."}
