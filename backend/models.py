from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class QRCodeCreateRequest(BaseModel):
    title: str = Field(default="My Smart QR", max_length=100)
    qr_type: str = Field(default="dynamic", description="'dynamic' (trackable & editable) or 'static'")
    content_type: str = Field(default="url", description="url, wifi, vcard, text, email, sms, phone")
    target_url: str = Field(..., description="Destination URL or payload")
    
    # Customization options
    fg_color: str = Field(default="#0f172a", description="Foreground hex color")
    bg_color: str = Field(default="#ffffff", description="Background hex or 'transparent'")
    gradient_type: str = Field(default="solid", description="solid, horizontal, radial")
    fg_color_2: Optional[str] = Field(default="#3b82f6", description="Secondary color for gradient")
    
    dot_style: str = Field(default="rounded", description="rounded, circle, square, gapped, classy, liquid")
    eye_frame: str = Field(default="square", description="square, rounded, circle, leaf")
    eye_ball: str = Field(default="square", description="square, circle, diamond, leaf")
    eye_color: Optional[str] = Field(default=None, description="Optional custom eye color")
    
    error_correction: str = Field(default="H", description="L, M, Q, H")
    margin: int = Field(default=2, ge=0, le=10)
    size: int = Field(default=800, ge=200, le=4000)
    
    # Center logo
    logo_type: Optional[str] = Field(default="none", description="none, globe, wifi, link, star, whatsapp, custom")
    logo_data: Optional[str] = Field(default=None, description="Base64 encoded custom logo image if any")
    
    # Pre-built Frames & CTA
    frame_style: str = Field(default="none", description="none, bottom_banner, top_banner, badge")
    frame_text: Optional[str] = Field(default="SCAN ME", description="Call to action text")
    frame_color: Optional[str] = Field(default="#0f172a", description="Frame background color")
    
    # Workspace & Security
    folder_id: Optional[int] = Field(default=None, description="Folder / Project ID")
    password: Optional[str] = Field(default=None, description="Optional plain PIN/Password to protect the QR")
    scan_limit: Optional[int] = Field(default=None, description="Max allowed scans before expiration")
    expires_at: Optional[str] = Field(default=None, description="ISO format datetime for automatic expiry")

class QRCodeUpdateRequest(BaseModel):
    title: Optional[str] = None
    target_url: Optional[str] = None
    fg_color: Optional[str] = None
    bg_color: Optional[str] = None
    gradient_type: Optional[str] = None
    fg_color_2: Optional[str] = None
    dot_style: Optional[str] = None
    eye_frame: Optional[str] = None
    eye_ball: Optional[str] = None
    eye_color: Optional[str] = None
    error_correction: Optional[str] = None
    margin: Optional[int] = None
    size: Optional[int] = None
    logo_type: Optional[str] = None
    logo_data: Optional[str] = None
    frame_style: Optional[str] = None
    frame_text: Optional[str] = None
    frame_color: Optional[str] = None
    folder_id: Optional[int] = None
    password: Optional[str] = None
    remove_password: Optional[bool] = False
    scan_limit: Optional[int] = None
    expires_at: Optional[str] = None

class ScanEvent(BaseModel):
    id: int
    qr_id: int
    scanned_at: str
    ip_address: Optional[str] = None
    ip_hash: Optional[str] = None
    user_agent: Optional[str] = None
    device_type: Optional[str] = None
    os_name: Optional[str] = None
    browser_name: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None

class QRCodeResponse(BaseModel):
    id: int
    short_code: str
    title: str
    qr_type: str
    content_type: str
    target_url: str
    dynamic_url: Optional[str] = None
    scan_count: int
    created_at: str
    updated_at: str
    
    # Styling fields
    fg_color: str
    bg_color: str
    gradient_type: str
    fg_color_2: Optional[str] = None
    dot_style: str
    eye_frame: str = "square"
    eye_ball: str = "square"
    eye_color: Optional[str] = None
    error_correction: str
    margin: int
    size: int
    logo_type: str
    logo_data: Optional[str] = None
    
    # Frame fields
    frame_style: str = "none"
    frame_text: Optional[str] = "SCAN ME"
    frame_color: Optional[str] = "#0f172a"
    
    # Workspace & Security
    folder_id: Optional[int] = None
    is_password_protected: bool = False
    scan_limit: Optional[int] = None
    expires_at: Optional[str] = None

# Folder Models
class FolderCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    color: str = Field(default="#3b82f6", max_length=20)

class FolderUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None

class FolderResponse(BaseModel):
    id: int
    name: str
    color: str
    qr_count: int = 0
    created_at: str
    updated_at: str

# Brand Kit Models
class BrandKitCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    fg_color: str = Field(default="#0f172a")
    bg_color: str = Field(default="#ffffff")
    gradient_type: str = Field(default="solid")
    fg_color_2: Optional[str] = Field(default="#3b82f6")
    dot_style: str = Field(default="rounded")
    eye_frame: str = Field(default="square")
    eye_ball: str = Field(default="square")
    eye_color: Optional[str] = None
    logo_data: Optional[str] = None

class BrandKitResponse(BaseModel):
    id: int
    name: str
    fg_color: str
    bg_color: str
    gradient_type: str
    fg_color_2: Optional[str] = None
    dot_style: str
    eye_frame: str
    eye_ball: str
    eye_color: Optional[str] = None
    logo_data: Optional[str] = None
    created_at: str
    updated_at: str

# Routing Rule Models
class RoutingRuleCreate(BaseModel):
    qr_id: Optional[int] = None
    rule_type: str = Field(..., description="'os', 'time', 'date'")
    condition_key: str = Field(..., description="e.g. 'ios', 'android', 'desktop', 'time_range', 'date_range'")
    condition_value: str = Field(..., description="e.g. '07:00-11:00' or '2026-11-01:2026-11-30'")
    redirect_url: str = Field(..., min_length=1)
    priority: int = Field(default=0)
    is_active: bool = Field(default=True)

class RoutingRuleUpdate(BaseModel):
    condition_key: Optional[str] = None
    condition_value: Optional[str] = None
    redirect_url: Optional[str] = None
    priority: Optional[int] = None
    is_active: Optional[bool] = None

class RoutingRuleResponse(BaseModel):
    id: int
    qr_id: int
    rule_type: str
    condition_key: str
    condition_value: str
    redirect_url: str
    priority: int
    is_active: bool
    created_at: str

class BulkQRCreateRequest(BaseModel):
    csv_text: str = Field(..., description="CSV content containing title and destination target_url rows")
    folder_id: Optional[int] = Field(default=None, description="Optional folder/campaign ID to assign the batch")
    qr_type: str = Field(default="dynamic", description="'dynamic' or 'static'")
    fg_color: str = Field(default="#0f172a")
    bg_color: str = Field(default="#ffffff")
    gradient_type: str = Field(default="solid")
    fg_color_2: Optional[str] = Field(default="#3b82f6")
    dot_style: str = Field(default="rounded")
    eye_frame: str = Field(default="square")
    eye_ball: str = Field(default="square")
    eye_color: Optional[str] = Field(default=None)
    error_correction: str = Field(default="H")
    margin: int = Field(default=2)
    size: int = Field(default=800)
