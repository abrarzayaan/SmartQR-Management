import sqlite3
import os
import hashlib
from datetime import datetime, date
from typing import List, Optional, Dict, Any

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "smartqr.db")

def get_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(plain_password: str) -> str:
    """Generate secure salted SHA256 password hash."""
    salt = "smartqr_secure_salt_2026"
    return hashlib.sha256(f"{salt}_{plain_password}".encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify given plain password against stored hash."""
    return hash_password(plain_password) == hashed_password

def hash_ip_address(ip: Optional[str]) -> str:
    """Generate daily salted anonymized IP hash for privacy-safe unique visitor counts."""
    if not ip or ip in ("unknown", "127.0.0.1", "localhost", "::1"):
        ip = "127.0.0.1"
    today = date.today().isoformat()
    salt = "smartqr_daily_salt"
    return hashlib.sha256(f"{ip}_{today}_{salt}".encode()).hexdigest()[:16]

def parse_user_agent(ua_raw: Optional[str]) -> Dict[str, str]:
    """Parse User-Agent string to detect Device Type, Operating System, and Browser."""
    ua = (ua_raw or "").lower()
    
    # Device Family Detection
    if any(k in ua for k in ["ipad", "tablet", "kindle"]):
        device_type = "Tablet"
    elif any(k in ua for k in ["mobile", "android", "iphone", "ipod", "blackberry", "windows phone"]):
        device_type = "Mobile"
    elif any(k in ua for k in ["bot", "crawl", "spider", "slurp", "facebookexternalhit"]):
        device_type = "Bot"
    else:
        device_type = "Desktop"

    # Operating System Detection
    if "iphone" in ua or "ipad" in ua or "ipod" in ua:
        os_name = "iOS"
    elif "android" in ua:
        os_name = "Android"
    elif "windows" in ua:
        os_name = "Windows"
    elif "macintosh" in ua or "mac os x" in ua:
        os_name = "macOS"
    elif "linux" in ua:
        os_name = "Linux"
    elif "cros" in ua:
        os_name = "ChromeOS"
    else:
        os_name = "Other"

    # Browser Detection
    if "edg" in ua or "edge" in ua:
        browser_name = "Edge"
    elif "samsungbrowser" in ua:
        browser_name = "Samsung Browser"
    elif "opr" in ua or "opera" in ua:
        browser_name = "Opera"
    elif "chrome" in ua and "chromium" not in ua and "edg" not in ua:
        browser_name = "Chrome"
    elif "firefox" in ua:
        browser_name = "Firefox"
    elif "safari" in ua and "chrome" not in ua:
        browser_name = "Safari"
    else:
        browser_name = "Other"

    return {
        "device_type": device_type,
        "os_name": os_name,
        "browser_name": browser_name
    }

def init_db():
    """Initializes tables and performs seamless schema migrations for backwards compatibility."""
    conn = get_db()
    cursor = conn.cursor()
    
    # 1. Folders table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#3b82f6',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # 2. Brand Kits table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS brand_kits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        fg_color TEXT NOT NULL DEFAULT '#0f172a',
        bg_color TEXT NOT NULL DEFAULT '#ffffff',
        gradient_type TEXT NOT NULL DEFAULT 'solid',
        fg_color_2 TEXT DEFAULT '#3b82f6',
        dot_style TEXT NOT NULL DEFAULT 'rounded',
        eye_frame TEXT NOT NULL DEFAULT 'square',
        eye_ball TEXT NOT NULL DEFAULT 'square',
        eye_color TEXT DEFAULT NULL,
        logo_data TEXT DEFAULT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # 3. QR Codes core table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS qrcodes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        short_code TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        qr_type TEXT NOT NULL DEFAULT 'dynamic',
        content_type TEXT NOT NULL DEFAULT 'url',
        target_url TEXT NOT NULL,
        fg_color TEXT NOT NULL DEFAULT '#0f172a',
        bg_color TEXT NOT NULL DEFAULT '#ffffff',
        gradient_type TEXT NOT NULL DEFAULT 'solid',
        fg_color_2 TEXT DEFAULT '#3b82f6',
        dot_style TEXT NOT NULL DEFAULT 'rounded',
        eye_frame TEXT NOT NULL DEFAULT 'square',
        eye_ball TEXT NOT NULL DEFAULT 'square',
        eye_color TEXT DEFAULT NULL,
        error_correction TEXT NOT NULL DEFAULT 'H',
        margin INTEGER NOT NULL DEFAULT 2,
        size INTEGER NOT NULL DEFAULT 800,
        logo_type TEXT NOT NULL DEFAULT 'none',
        logo_data TEXT DEFAULT NULL,
        frame_style TEXT NOT NULL DEFAULT 'none',
        frame_text TEXT DEFAULT 'SCAN ME',
        frame_color TEXT DEFAULT '#0f172a',
        folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL,
        password_hash TEXT DEFAULT NULL,
        scan_limit INTEGER DEFAULT NULL,
        expires_at TEXT DEFAULT NULL,
        scan_count INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # 4. Scan Logs telemetry table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scan_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        qr_id INTEGER NOT NULL,
        scanned_at TEXT NOT NULL,
        ip_address TEXT,
        ip_hash TEXT,
        user_agent TEXT,
        device_type TEXT,
        os_name TEXT,
        browser_name TEXT,
        country TEXT,
        city TEXT,
        FOREIGN KEY (qr_id) REFERENCES qrcodes (id) ON DELETE CASCADE
    )
    """)

    # 5. Routing Rules table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS routing_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        qr_id INTEGER NOT NULL,
        rule_type TEXT NOT NULL,
        condition_key TEXT NOT NULL,
        condition_value TEXT NOT NULL,
        redirect_url TEXT NOT NULL,
        priority INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        FOREIGN KEY (qr_id) REFERENCES qrcodes (id) ON DELETE CASCADE
    )
    """)

    # --- AUTO MIGRATION CHECK FOR EXISTING DATABASES ---
    # Check columns in qrcodes table
    cursor.execute("PRAGMA table_info(qrcodes)")
    qr_cols = [col[1] for col in cursor.fetchall()]

    new_qr_cols = [
        ("folder_id", "INTEGER REFERENCES folders(id) ON DELETE SET NULL"),
        ("eye_frame", "TEXT NOT NULL DEFAULT 'square'"),
        ("eye_ball", "TEXT NOT NULL DEFAULT 'square'"),
        ("eye_color", "TEXT DEFAULT NULL"),
        ("frame_style", "TEXT NOT NULL DEFAULT 'none'"),
        ("frame_text", "TEXT DEFAULT 'SCAN ME'"),
        ("frame_color", "TEXT DEFAULT '#0f172a'"),
        ("password_hash", "TEXT DEFAULT NULL"),
        ("scan_limit", "INTEGER DEFAULT NULL"),
        ("expires_at", "TEXT DEFAULT NULL"),
    ]
    for col_name, col_def in new_qr_cols:
        if col_name not in qr_cols:
            cursor.execute(f"ALTER TABLE qrcodes ADD COLUMN {col_name} {col_def}")

    # Check columns in scan_logs table
    cursor.execute("PRAGMA table_info(scan_logs)")
    scan_cols = [col[1] for col in cursor.fetchall()]

    new_scan_cols = [
        ("ip_hash", "TEXT DEFAULT NULL"),
        ("os_name", "TEXT DEFAULT NULL"),
        ("browser_name", "TEXT DEFAULT NULL"),
        ("country", "TEXT DEFAULT NULL"),
        ("city", "TEXT DEFAULT NULL"),
    ]
    for col_name, col_def in new_scan_cols:
        if col_name not in scan_cols:
            cursor.execute(f"ALTER TABLE scan_logs ADD COLUMN {col_name} {col_def}")

    # Indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_short_code ON qrcodes(short_code)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_qr_folder ON qrcodes(folder_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_scan_qr_id ON scan_logs(qr_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_scan_ip_hash ON scan_logs(ip_hash)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_routing_qr_id ON routing_rules(qr_id)")

    conn.commit()
    conn.close()

# --- QR CODE CRUD ---

def create_qr_record(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    
    # Process password if provided
    password_hash = None
    if data.get('password'):
        password_hash = hash_password(data['password'])

    cursor.execute("""
        INSERT INTO qrcodes (
            short_code, title, qr_type, content_type, target_url,
            fg_color, bg_color, gradient_type, fg_color_2,
            dot_style, eye_frame, eye_ball, eye_color,
            error_correction, margin, size,
            logo_type, logo_data, frame_style, frame_text, frame_color,
            folder_id, password_hash, scan_limit, expires_at,
            scan_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    """, (
        data['short_code'],
        data.get('title', 'My Smart QR'),
        data.get('qr_type', 'dynamic'),
        data.get('content_type', 'url'),
        data['target_url'],
        data.get('fg_color', '#0f172a'),
        data.get('bg_color', '#ffffff'),
        data.get('gradient_type', 'solid'),
        data.get('fg_color_2', '#3b82f6'),
        data.get('dot_style', 'rounded'),
        data.get('eye_frame', 'square'),
        data.get('eye_ball', 'square'),
        data.get('eye_color'),
        data.get('error_correction', 'H'),
        data.get('margin', 2),
        data.get('size', 800),
        data.get('logo_type', 'none'),
        data.get('logo_data'),
        data.get('frame_style', 'none'),
        data.get('frame_text', 'SCAN ME'),
        data.get('frame_color', '#0f172a'),
        data.get('folder_id'),
        password_hash,
        data.get('scan_limit'),
        data.get('expires_at'),
        now,
        now
    ))
    
    qr_id = cursor.lastrowid
    conn.commit()
    
    cursor.execute("SELECT * FROM qrcodes WHERE id = ?", (qr_id,))
    row = dict(cursor.fetchone())
    conn.close()
    row['is_password_protected'] = bool(row.get('password_hash'))
    row.pop('password_hash', None)
    return row

def get_all_qrs(
    search: Optional[str] = None, 
    qr_type: Optional[str] = None, 
    folder_id: Optional[int] = None
) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    
    query = "SELECT * FROM qrcodes WHERE 1=1"
    params = []
    
    if search:
        query += " AND (title LIKE ? OR target_url LIKE ? OR short_code LIKE ?)"
        wildcard = f"%{search}%"
        params.extend([wildcard, wildcard, wildcard])
        
    if qr_type and qr_type != 'all':
        query += " AND qr_type = ?"
        params.append(qr_type)

    if folder_id is not None:
        if folder_id == 0:
            query += " AND folder_id IS NULL"
        else:
            query += " AND folder_id = ?"
            params.append(folder_id)
        
    query += " ORDER BY id DESC"
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    rule_counts = {}
    cursor.execute("SELECT qr_id, COUNT(*) as cnt FROM routing_rules WHERE is_active = 1 GROUP BY qr_id")
    for rc in cursor.fetchall():
        rule_counts[rc['qr_id']] = rc['cnt']
        
    conn.close()
    
    results = []
    for r in rows:
        d = dict(r)
        d['is_password_protected'] = bool(d.get('password_hash'))
        d['rules_count'] = rule_counts.get(d['id'], 0)
        d.pop('password_hash', None)
        results.append(d)
    return results

def get_qr_by_id(qr_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM qrcodes WHERE id = ?", (qr_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d['is_password_protected'] = bool(d.get('password_hash'))
    return d

def get_qr_by_short_code(short_code: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM qrcodes WHERE short_code = ?", (short_code,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return dict(row)

def update_qr_record(qr_id: int, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    
    valid_fields = [
        'title', 'target_url', 'fg_color', 'bg_color', 'gradient_type',
        'fg_color_2', 'dot_style', 'eye_frame', 'eye_ball', 'eye_color',
        'error_correction', 'margin', 'size', 'logo_type', 'logo_data',
        'frame_style', 'frame_text', 'frame_color', 'folder_id',
        'scan_limit', 'expires_at'
    ]
    
    set_clauses = []
    values = []
    for k, v in updates.items():
        if k in valid_fields:
            set_clauses.append(f"{k} = ?")
            values.append(v)

    # Handle password updates
    if updates.get('remove_password'):
        set_clauses.append("password_hash = NULL")
    elif updates.get('password'):
        set_clauses.append("password_hash = ?")
        values.append(hash_password(updates['password']))
            
    if not set_clauses:
        conn.close()
        return get_qr_by_id(qr_id)
        
    set_clauses.append("updated_at = ?")
    values.append(datetime.now().isoformat())
    values.append(qr_id)
    
    query = f"UPDATE qrcodes SET {', '.join(set_clauses)} WHERE id = ?"
    cursor.execute(query, values)
    conn.commit()
    conn.close()
    return get_qr_by_id(qr_id)

def delete_qr_record(qr_id: int) -> bool:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM scan_logs WHERE qr_id = ?", (qr_id,))
    cursor.execute("DELETE FROM routing_rules WHERE qr_id = ?", (qr_id,))
    cursor.execute("DELETE FROM qrcodes WHERE id = ?", (qr_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

# --- ASYNC SCAN TELEMETRY ---

def record_scan_event(
    qr_id: int, 
    ip_address: Optional[str] = None, 
    user_agent: Optional[str] = None,
    headers: Optional[Dict[str, str]] = None
) -> None:
    """Asynchronously records scan telemetry, parses user agent, and updates scan counts."""
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    headers = headers or {}
    
    # Anonymized salted IP hash for unique visitor metrics
    ip_hash = hash_ip_address(ip_address)
    
    # Parse client user-agent
    parsed = parse_user_agent(user_agent)
    device_type = parsed["device_type"]
    os_name = parsed["os_name"]
    browser_name = parsed["browser_name"]

    # Extract Country/City from reverse proxy/CDN headers if available
    country = headers.get("cf-ipcountry") or headers.get("x-country-code") or "Local / Direct"
    city = headers.get("cf-ipcity") or headers.get("x-city-name") or "Direct Scan"
    
    cursor.execute("""
        INSERT INTO scan_logs (
            qr_id, scanned_at, ip_address, ip_hash, user_agent, 
            device_type, os_name, browser_name, country, city
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        qr_id, now, ip_address, ip_hash, user_agent, 
        device_type, os_name, browser_name, country, city
    ))
    
    cursor.execute("UPDATE qrcodes SET scan_count = scan_count + 1 WHERE id = ?", (qr_id,))
    conn.commit()
    conn.close()

def get_scan_analytics(qr_id: int) -> Dict[str, Any]:
    conn = get_db()
    cursor = conn.cursor()
    
    # Total scans
    cursor.execute("SELECT scan_count FROM qrcodes WHERE id = ?", (qr_id,))
    qr_row = cursor.fetchone()
    total_scans = qr_row['scan_count'] if qr_row else 0

    # Unique scans
    cursor.execute("SELECT COUNT(DISTINCT ip_hash) as unique_scans FROM scan_logs WHERE qr_id = ?", (qr_id,))
    uniq_row = cursor.fetchone()
    unique_scans = uniq_row['unique_scans'] if uniq_row else 0
    
    # Recent 25 scans
    cursor.execute("""
        SELECT id, qr_id, scanned_at, device_type, os_name, browser_name, country, city
        FROM scan_logs 
        WHERE qr_id = ? 
        ORDER BY id DESC 
        LIMIT 25
    """, (qr_id,))
    recent_logs = [dict(r) for r in cursor.fetchall()]
    
    # Device breakdown
    cursor.execute("""
        SELECT device_type, COUNT(*) as count 
        FROM scan_logs 
        WHERE qr_id = ? 
        GROUP BY device_type
    """, (qr_id,))
    devices = {r['device_type']: r['count'] for r in cursor.fetchall()}

    # OS breakdown
    cursor.execute("""
        SELECT os_name, COUNT(*) as count 
        FROM scan_logs 
        WHERE qr_id = ? 
        GROUP BY os_name
    """, (qr_id,))
    os_breakdown = {r['os_name']: r['count'] for r in cursor.fetchall()}

    # Browser breakdown
    cursor.execute("""
        SELECT browser_name, COUNT(*) as count 
        FROM scan_logs 
        WHERE qr_id = ? 
        GROUP BY browser_name
    """, (qr_id,))
    browser_breakdown = {r['browser_name']: r['count'] for r in cursor.fetchall()}

    # Country breakdown
    cursor.execute("""
        SELECT country, COUNT(*) as count 
        FROM scan_logs 
        WHERE qr_id = ? AND country IS NOT NULL AND country != '' AND country != 'unknown'
        GROUP BY country
        ORDER BY count DESC
        LIMIT 10
    """, (qr_id,))
    country_rows = [dict(r) for r in cursor.fetchall()]
    country_breakdown = {r['country']: r['count'] for r in country_rows}

    # Top Cities breakdown
    cursor.execute("""
        SELECT city, COUNT(*) as count 
        FROM scan_logs 
        WHERE qr_id = ? AND city IS NOT NULL AND city != '' AND city != 'unknown'
        GROUP BY city
        ORDER BY count DESC
        LIMIT 10
    """, (qr_id,))
    top_cities = [dict(r) for r in cursor.fetchall()]

    # 24-Hour Scan Heatmap / Hourly distribution
    cursor.execute("""
        SELECT substr(scanned_at, 12, 2) as scan_hour, COUNT(*) as count
        FROM scan_logs
        WHERE qr_id = ?
        GROUP BY scan_hour
        ORDER BY scan_hour ASC
    """, (qr_id,))
    hour_counts = {f"{i:02d}": 0 for i in range(24)}
    for r in cursor.fetchall():
        h = r['scan_hour']
        if h and h in hour_counts:
            hour_counts[h] = r['count']
    hourly_breakdown = [{"hour": h, "count": cnt} for h, cnt in sorted(hour_counts.items())]

    # Calculate Peak Hour
    max_h = max(hourly_breakdown, key=lambda x: x["count"]) if any(x["count"] > 0 for x in hourly_breakdown) else None
    peak_hour = f"{max_h['hour']}:00 ({max_h['count']} scans)" if (max_h and max_h["count"] > 0) else "None"

    # Mobile visitor ratio
    mobile_count = devices.get("Mobile", 0) + devices.get("Tablet", 0)
    total_logged = sum(devices.values()) or 1
    mobile_percentage = round((mobile_count / total_logged) * 100)
    
    conn.close()
    return {
        "total_scans": total_scans,
        "unique_scans": unique_scans,
        "mobile_percentage": mobile_percentage,
        "peak_hour": peak_hour,
        "hourly_breakdown": hourly_breakdown,
        "recent_scans": recent_logs,
        "device_breakdown": devices,
        "os_breakdown": os_breakdown,
        "browser_breakdown": browser_breakdown,
        "country_breakdown": country_breakdown,
        "top_countries": country_rows,
        "top_cities": top_cities
    }

def get_overall_stats() -> Dict[str, Any]:
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as total_qrs, COALESCE(SUM(scan_count), 0) as total_scans FROM qrcodes")
    summary = cursor.fetchone()

    cursor.execute("SELECT COUNT(DISTINCT ip_hash) as total_unique_scans FROM scan_logs")
    uniq_summary = cursor.fetchone()
    
    cursor.execute("SELECT COUNT(*) as dynamic_count FROM qrcodes WHERE qr_type = 'dynamic'")
    dyn = cursor.fetchone()
    
    cursor.execute("SELECT title, scan_count FROM qrcodes ORDER BY scan_count DESC LIMIT 1")
    top_qr = cursor.fetchone()
    
    conn.close()
    return {
        "total_qrs": summary['total_qrs'] if summary else 0,
        "total_scans": summary['total_scans'] if summary else 0,
        "unique_scans": uniq_summary['total_unique_scans'] if uniq_summary else 0,
        "dynamic_qrs": dyn['dynamic_count'] if dyn else 0,
        "top_qr_title": top_qr['title'] if top_qr else "None",
        "top_qr_scans": top_qr['scan_count'] if top_qr else 0
    }

# --- FOLDER CRUD ---

def create_folder(name: str, color: str = "#3b82f6") -> Dict[str, Any]:
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    cursor.execute(
        "INSERT INTO folders (name, color, created_at, updated_at) VALUES (?, ?, ?, ?)",
        (name, color, now, now)
    )
    folder_id = cursor.lastrowid
    conn.commit()
    cursor.execute("SELECT * FROM folders WHERE id = ?", (folder_id,))
    folder = dict(cursor.fetchone())
    conn.close()
    folder['qr_count'] = 0
    return folder

def get_all_folders() -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT f.*, COUNT(q.id) as qr_count 
        FROM folders f 
        LEFT JOIN qrcodes q ON q.folder_id = f.id 
        GROUP BY f.id 
        ORDER BY f.name ASC
    """)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def get_folder_by_id(folder_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT f.*, COUNT(q.id) as qr_count 
        FROM folders f 
        LEFT JOIN qrcodes q ON q.folder_id = f.id 
        WHERE f.id = ?
        GROUP BY f.id
    """, (folder_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_folder(folder_id: int, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    set_clauses = []
    values = []
    for k in ['name', 'color']:
        if k in updates and updates[k] is not None:
            set_clauses.append(f"{k} = ?")
            values.append(updates[k])
    if not set_clauses:
        conn.close()
        return get_folder_by_id(folder_id)
        
    set_clauses.append("updated_at = ?")
    values.append(datetime.now().isoformat())
    values.append(folder_id)
    cursor.execute(f"UPDATE folders SET {', '.join(set_clauses)} WHERE id = ?", values)
    conn.commit()
    conn.close()
    return get_folder_by_id(folder_id)

def delete_folder(folder_id: int) -> bool:
    conn = get_db()
    cursor = conn.cursor()
    # Unlink QRs from this folder
    cursor.execute("UPDATE qrcodes SET folder_id = NULL WHERE folder_id = ?", (folder_id,))
    cursor.execute("DELETE FROM folders WHERE id = ?", (folder_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

# --- BRAND KIT CRUD ---

def create_brand_kit(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    cursor.execute("""
        INSERT INTO brand_kits (
            name, fg_color, bg_color, gradient_type, fg_color_2,
            dot_style, eye_frame, eye_ball, eye_color, logo_data,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data['name'],
        data.get('fg_color', '#0f172a'),
        data.get('bg_color', '#ffffff'),
        data.get('gradient_type', 'solid'),
        data.get('fg_color_2', '#3b82f6'),
        data.get('dot_style', 'rounded'),
        data.get('eye_frame', 'square'),
        data.get('eye_ball', 'square'),
        data.get('eye_color'),
        data.get('logo_data'),
        now,
        now
    ))
    kit_id = cursor.lastrowid
    conn.commit()
    cursor.execute("SELECT * FROM brand_kits WHERE id = ?", (kit_id,))
    kit = dict(cursor.fetchone())
    conn.close()
    return kit

def get_all_brand_kits() -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM brand_kits ORDER BY id DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def get_brand_kit_by_id(kit_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM brand_kits WHERE id = ?", (kit_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def delete_brand_kit(kit_id: int) -> bool:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM brand_kits WHERE id = ?", (kit_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

# --- ROUTING RULES CRUD ---

def create_routing_rule(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    cursor.execute("""
        INSERT INTO routing_rules (
            qr_id, rule_type, condition_key, condition_value, redirect_url, priority, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data['qr_id'],
        data['rule_type'],
        data['condition_key'],
        data['condition_value'],
        data['redirect_url'],
        data.get('priority', 0),
        1 if data.get('is_active', True) else 0,
        now
    ))
    rule_id = cursor.lastrowid
    conn.commit()
    cursor.execute("SELECT * FROM routing_rules WHERE id = ?", (rule_id,))
    rule = dict(cursor.fetchone())
    conn.close()
    rule['is_active'] = bool(rule['is_active'])
    return rule

def get_routing_rules_for_qr(qr_id: int, active_only: bool = False) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    query = "SELECT * FROM routing_rules WHERE qr_id = ?"
    if active_only:
        query += " AND is_active = 1"
    query += " ORDER BY priority DESC, id ASC"
    cursor.execute(query, (qr_id,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    for r in rows:
        r['is_active'] = bool(r['is_active'])
    return rows

def update_routing_rule(rule_id: int, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    set_clauses = []
    values = []
    for k in ['condition_key', 'condition_value', 'redirect_url', 'priority']:
        if k in updates and updates[k] is not None:
            set_clauses.append(f"{k} = ?")
            values.append(updates[k])
    if 'is_active' in updates and updates['is_active'] is not None:
        set_clauses.append("is_active = ?")
        values.append(1 if updates['is_active'] else 0)
        
    if not set_clauses:
        conn.close()
        return None
        
    values.append(rule_id)
    cursor.execute(f"UPDATE routing_rules SET {', '.join(set_clauses)} WHERE id = ?", values)
    conn.commit()
    cursor.execute("SELECT * FROM routing_rules WHERE id = ?", (rule_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    res = dict(row)
    res['is_active'] = bool(res['is_active'])
    return res

def delete_routing_rule(rule_id: int) -> bool:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM routing_rules WHERE id = ?", (rule_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted
