import io
import base64
import re
from typing import Optional, Tuple, Dict, Any
from PIL import Image, ImageDraw, ImageFont
import qrcode
from qrcode.constants import ERROR_CORRECT_L, ERROR_CORRECT_M, ERROR_CORRECT_Q, ERROR_CORRECT_H
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers.pil import (
    StyledPilQRModuleDrawer,
    ANTIALIASING_FACTOR,
    RoundedModuleDrawer,
    CircleModuleDrawer,
    SquareModuleDrawer,
    GappedSquareModuleDrawer,
)
from qrcode.image.styles.colormasks import (
    SolidFillColorMask,
    HorizontalGradiantColorMask,
    RadialGradiantColorMask,
)
import qrcode.image.svg

ERROR_LEVEL_MAP = {
    'L': ERROR_CORRECT_L,
    'M': ERROR_CORRECT_M,
    'Q': ERROR_CORRECT_Q,
    'H': ERROR_CORRECT_H
}

# --- CUSTOM MODULE DRAWERS ---

class ClassyModuleDrawer(StyledPilQRModuleDrawer):
    """Draws modules as crisp diamond / jewel gems."""
    diamond = None

    def initialize(self, *args, **kwargs):
        super().initialize(*args, **kwargs)
        box_size = self.img.box_size
        fake_size = box_size * ANTIALIASING_FACTOR
        self.diamond = Image.new(
            self.img.mode,
            (fake_size, fake_size),
            self.img.color_mask.back_color,
        )
        c = fake_size // 2
        pts = [(c, 0), (fake_size, c), (c, fake_size), (0, c)]
        ImageDraw.Draw(self.diamond).polygon(pts, fill=self.img.paint_color)
        self.diamond = self.diamond.resize((box_size, box_size), Image.Resampling.LANCZOS)

    def drawrect(self, box, is_active: bool):
        if is_active:
            self.img._img.paste(self.diamond, (box[0][0], box[0][1]))

class LiquidModuleDrawer(StyledPilQRModuleDrawer):
    """Draws modules as smooth fluid organic pills."""
    liquid = None

    def initialize(self, *args, **kwargs):
        super().initialize(*args, **kwargs)
        box_size = self.img.box_size
        fake_size = box_size * ANTIALIASING_FACTOR
        self.liquid = Image.new(
            self.img.mode,
            (fake_size, fake_size),
            self.img.color_mask.back_color,
        )
        pad = int(fake_size * 0.08)
        radius = int(fake_size * 0.42)
        ImageDraw.Draw(self.liquid).rounded_rectangle(
            [pad, pad, fake_size - pad, fake_size - pad],
            radius=radius,
            fill=self.img.paint_color
        )
        self.liquid = self.liquid.resize((box_size, box_size), Image.Resampling.LANCZOS)

    def drawrect(self, box, is_active: bool):
        if is_active:
            self.img._img.paste(self.liquid, (box[0][0], box[0][1]))

# --- COLOR UTILITIES ---

def is_transparent(hex_or_str: Optional[str]) -> bool:
    if not hex_or_str:
        return False
    c = str(hex_or_str).strip().lower()
    return c in ("transparent", "none", "#00000000", "rgba(0,0,0,0)", "rgba(0, 0, 0, 0)")

def hex_to_rgb(hex_code: str) -> Tuple[int, int, int]:
    if not hex_code:
        return (0, 0, 0)
    hex_code = hex_code.lstrip('#')
    if len(hex_code) == 3:
        hex_code = ''.join([c * 2 for c in hex_code])
    if len(hex_code) >= 6:
        return tuple(int(hex_code[i:i+2], 16) for i in (0, 2, 4))
    return (0, 0, 0)

def hex_to_rgba(hex_code: str, alpha: int = 255) -> Tuple[int, int, int, int]:
    r, g, b = hex_to_rgb(hex_code)
    return (r, g, b, alpha)

def get_module_drawer(style: str):
    style = (style or 'rounded').lower()
    if style == 'circle':
        return CircleModuleDrawer()
    elif style == 'square':
        return SquareModuleDrawer()
    elif style == 'gapped':
        return GappedSquareModuleDrawer()
    elif style == 'classy':
        return ClassyModuleDrawer()
    elif style == 'liquid':
        return LiquidModuleDrawer()
    else:
        return RoundedModuleDrawer()

def get_color_mask(gradient_type: str, fg_hex: str, fg2_hex: Optional[str], bg_hex: str):
    transparent_bg = is_transparent(bg_hex)
    
    if transparent_bg:
        # All colors must have matching length 4 for gradient interpolation
        bg_color = (255, 255, 255, 0)
        fg_color = hex_to_rgba(fg_hex, 255)
        fg2_color = hex_to_rgba(fg2_hex, 255) if fg2_hex else fg_color
    else:
        bg_color = hex_to_rgb(bg_hex)
        fg_color = hex_to_rgb(fg_hex)
        fg2_color = hex_to_rgb(fg2_hex) if fg2_hex else fg_color
    
    grad = (gradient_type or 'solid').lower()
    if grad == 'horizontal':
        return HorizontalGradiantColorMask(
            back_color=bg_color,
            left_color=fg_color,
            right_color=fg2_color
        )
    elif grad == 'radial':
        return RadialGradiantColorMask(
            back_color=bg_color,
            center_color=fg_color,
            edge_color=fg2_color
        )
    else:
        return SolidFillColorMask(
            back_color=bg_color,
            front_color=fg_color
        )

# --- PRESET ICONS & LOGOS ---

def create_preset_icon(icon_name: str, size: int) -> Image.Image:
    """Create a crisp minimalist vector-like icon on a circle background."""
    img = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    pad = int(size * 0.05)
    draw.ellipse([pad, pad, size - pad, size - pad], fill=(255, 255, 255, 255), outline=(226, 232, 240, 255), width=max(2, int(size * 0.04)))
    
    center = size // 2
    r = int(size * 0.32)
    accent = (15, 23, 42, 255)
    
    icon_name = (icon_name or '').lower()
    if icon_name == 'globe':
        draw.ellipse([center - r, center - r, center + r, center + r], outline=accent, width=max(2, int(size * 0.05)))
        draw.line([center - r, center, center + r, center], fill=accent, width=max(2, int(size * 0.04)))
        draw.ellipse([center - r // 2, center - r, center + r // 2, center + r], outline=accent, width=max(2, int(size * 0.04)))
    elif icon_name == 'wifi':
        w = max(2, int(size * 0.05))
        draw.arc([center - r, center - r + int(r * 0.2), center + r, center + r + int(r * 0.2)], start=200, end=340, fill=accent, width=w)
        draw.arc([center - int(r*0.65), center - int(r*0.65) + int(r * 0.5), center + int(r*0.65), center + int(r*0.65) + int(r * 0.5)], start=200, end=340, fill=accent, width=w)
        draw.ellipse([center - int(size * 0.06), center + int(r * 0.45), center + int(size * 0.06), center + int(r * 0.45) + int(size * 0.12)], fill=accent)
    elif icon_name == 'link':
        w = max(2, int(size * 0.05))
        draw.ellipse([center - r, center - r // 2, center, center + r // 2], outline=accent, width=w)
        draw.ellipse([center, center - r // 2, center + r, center + r // 2], outline=accent, width=w)
    elif icon_name == 'star':
        draw.polygon([
            (center, center - r),
            (center + int(r * 0.3), center - int(r * 0.25)),
            (center + r, center - int(r * 0.25)),
            (center + int(r * 0.45), center + int(r * 0.2)),
            (center + int(r * 0.65), center + r),
            (center, center + int(r * 0.45)),
            (center - int(r * 0.65), center + r),
            (center - int(r * 0.45), center + int(r * 0.2)),
            (center - r, center - int(r * 0.25)),
            (center - int(r * 0.3), center - int(r * 0.25)),
        ], fill=(245, 158, 11, 255))
    elif icon_name == 'whatsapp':
        draw.ellipse([pad, pad, size - pad, size - pad], fill=(37, 211, 102, 255))
        draw.ellipse([center - int(r*0.7), center - int(r*0.7), center + int(r*0.7), center + int(r*0.7)], fill=(255, 255, 255, 255))
        draw.ellipse([center - int(r*0.5), center - int(r*0.5), center + int(r*0.5), center + int(r*0.5)], fill=(37, 211, 102, 255))
    elif icon_name == 'linkedin':
        # LinkedIn professional blue badge
        draw.rounded_rectangle([pad, pad, size - pad, size - pad], radius=int(size * 0.22), fill=(10, 102, 194, 255))
        # Draw clean 'in' glyph
        draw.ellipse([center - int(r*0.55), center - int(r*0.65), center - int(r*0.25), center - int(r*0.35)], fill=(255, 255, 255, 255))
        draw.rectangle([center - int(r*0.55), center - int(r*0.2), center - int(r*0.25), center + int(r*0.65)], fill=(255, 255, 255, 255))
        draw.rectangle([center - int(r*0.05), center - int(r*0.2), center + int(r*0.25), center + int(r*0.65)], fill=(255, 255, 255, 255))
        draw.arc([center - int(r*0.05), center - int(r*0.3), center + int(r*0.6), center + int(r*0.3)], start=180, end=360, fill=(255, 255, 255, 255), width=max(2, int(size * 0.08)))
    elif icon_name == 'instagram':
        # Instagram vibrant brand badge
        draw.rounded_rectangle([pad, pad, size - pad, size - pad], radius=int(size * 0.24), fill=(225, 48, 108, 255))
        cam_pad = int(size * 0.24)
        draw.rounded_rectangle([cam_pad, cam_pad, size - cam_pad, size - cam_pad], radius=int(size * 0.16), outline=(255, 255, 255, 255), width=max(2, int(size * 0.06)))
        draw.ellipse([center - int(r*0.4), center - int(r*0.4), center + int(r*0.4), center + int(r*0.4)], outline=(255, 255, 255, 255), width=max(2, int(size * 0.06)))
        draw.ellipse([size - cam_pad - int(size * 0.12), cam_pad + int(size * 0.04), size - cam_pad - int(size * 0.04), cam_pad + int(size * 0.12)], fill=(255, 255, 255, 255))
    elif icon_name == 'maps':
        # Google Maps locator pin
        draw.ellipse([pad, pad, size - pad, size - pad], fill=(255, 255, 255, 255), outline=(226, 232, 240, 255), width=max(2, int(size * 0.04)))
        draw.ellipse([center - int(r*0.6), center - int(r*0.8), center + int(r*0.6), center + int(r*0.2)], fill=(234, 67, 53, 255))
        draw.polygon([(center - int(r*0.5), center - int(r*0.1)), (center + int(r*0.5), center - int(r*0.1)), (center, center + int(r*0.75))], fill=(234, 67, 53, 255))
        draw.ellipse([center - int(r*0.25), center - int(r*0.5), center + int(r*0.25), center], fill=(255, 255, 255, 255))
    else:
        draw.ellipse([center - r // 2, center - r // 2, center + r // 2, center + r // 2], fill=accent)
        
    return img

def overlay_logo(base_img: Image.Image, logo_type: str, logo_data: Optional[str]) -> Image.Image:
    """Overlays custom base64 or preset logo into the center of the QR code with auto-padding."""
    if not logo_type or logo_type == 'none':
        return base_img
        
    qr_w, qr_h = base_img.size
    logo_size = int(qr_w * 0.22)
    logo_img = None
    
    if logo_type == 'custom' and logo_data:
        try:
            if ',' in logo_data:
                logo_data = logo_data.split(',', 1)[1]
            img_bytes = base64.b64decode(logo_data)
            custom_img = Image.open(io.BytesIO(img_bytes)).convert("RGBA")
            custom_img.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)
            
            # Rounded badge background with protective buffer padding
            badge = Image.new("RGBA", (logo_size + 16, logo_size + 16), (255, 255, 255, 0))
            draw = ImageDraw.Draw(badge)
            radius = int((logo_size + 16) * 0.22)
            draw.rounded_rectangle(
                [0, 0, logo_size + 15, logo_size + 15], 
                radius=radius, 
                fill=(255, 255, 255, 255), 
                outline=(226, 232, 240, 255), 
                width=2
            )
            
            offset_x = (badge.width - custom_img.width) // 2
            offset_y = (badge.height - custom_img.height) // 2
            badge.paste(custom_img, (offset_x, offset_y), custom_img)
            logo_img = badge
        except Exception as e:
            print(f"Error processing custom logo: {e}")
            logo_img = None
    elif logo_type in ['globe', 'wifi', 'link', 'star', 'whatsapp', 'linkedin', 'instagram', 'maps']:
        logo_img = create_preset_icon(logo_type, logo_size)
        
    if logo_img:
        pos_x = (qr_w - logo_img.width) // 2
        pos_y = (qr_h - logo_img.height) // 2
        base_img = base_img.convert("RGBA")
        base_img.paste(logo_img, (pos_x, pos_y), logo_img)
        
    return base_img

# --- CUSTOM FINDER PATTERNS (CORNER EYES) ---

def overlay_custom_eyes(
    base_img: Image.Image,
    qr: qrcode.QRCode,
    eye_frame: str = "square",
    eye_ball: str = "square",
    eye_color: Optional[str] = None,
    default_fg: str = "#0f172a",
    bg_color: str = "#ffffff"
) -> Image.Image:
    """Overlays custom styled finder patterns (corner eyes) on the 3 QR corners."""
    eye_frame = (eye_frame or "square").lower()
    eye_ball = (eye_ball or "square").lower()
    
    if eye_frame == 'square' and eye_ball == 'square' and not eye_color:
        return base_img
        
    base_img = base_img.convert("RGBA")
    draw = ImageDraw.Draw(base_img)
    
    mat_len = len(qr.modules)
    m = qr.box_size
    border = qr.border
    offset = border * m
    eye_size = 7 * m
    
    corners = [
        (offset, offset),
        (offset + (mat_len - 7) * m, offset),
        (offset, offset + (mat_len - 7) * m)
    ]
    
    frame_color = hex_to_rgba(eye_color, 255) if eye_color else hex_to_rgba(default_fg, 255)
    ball_color = frame_color
    bg_rgba = (255, 255, 255, 0) if is_transparent(bg_color) else hex_to_rgba(bg_color, 255)
    
    for x, y in corners:
        draw.rectangle([x, y, x + eye_size, y + eye_size], fill=bg_rgba)
        
        # Outer Frame
        if eye_frame == 'circle':
            draw.ellipse([x, y, x + eye_size, y + eye_size], fill=frame_color)
            draw.ellipse([x + m, y + m, x + eye_size - m, y + eye_size - m], fill=bg_rgba)
        elif eye_frame == 'rounded':
            rad = int(eye_size * 0.28)
            draw.rounded_rectangle([x, y, x + eye_size, y + eye_size], radius=rad, fill=frame_color)
            draw.rounded_rectangle([x + m, y + m, x + eye_size - m, y + eye_size - m], radius=max(2, rad - m), fill=bg_rgba)
        elif eye_frame == 'leaf':
            rad = int(eye_size * 0.45)
            draw.rounded_rectangle([x, y, x + eye_size, y + eye_size], radius=rad, fill=frame_color)
            draw.rounded_rectangle([x + m, y + m, x + eye_size - m, y + eye_size - m], radius=max(2, rad - m), fill=bg_rgba)
        else: # square
            draw.rectangle([x, y, x + eye_size, y + eye_size], fill=frame_color)
            draw.rectangle([x + m, y + m, x + eye_size - m, y + eye_size - m], fill=bg_rgba)
            
        # Inner Ball
        bx1 = x + 2 * m
        by1 = y + 2 * m
        bx2 = x + 5 * m
        by2 = y + 5 * m
        if eye_ball == 'circle':
            draw.ellipse([bx1, by1, bx2, by2], fill=ball_color)
        elif eye_ball == 'diamond':
            cx = (bx1 + bx2) // 2
            cy = (by1 + by2) // 2
            draw.polygon([(cx, by1), (bx2, cy), (cx, by2), (bx1, cy)], fill=ball_color)
        elif eye_ball == 'leaf':
            draw.rounded_rectangle([bx1, by1, bx2, by2], radius=int(m * 1.2), fill=ball_color)
        else: # square
            draw.rectangle([bx1, by1, bx2, by2], fill=ball_color)
            
    return base_img

# --- CALL-TO-ACTION FRAMES ---

def apply_frame(
    qr_img: Image.Image,
    frame_style: str = "none",
    frame_text: str = "SCAN ME",
    frame_color: str = "#0f172a"
) -> Image.Image:
    """Renders decorative frame and CTA banner around the QR code."""
    if not frame_style or frame_style == 'none':
        return qr_img
        
    w, h = qr_img.size
    banner_height = max(50, int(h * 0.16))
    total_h = h + banner_height
    
    frame_c = hex_to_rgb(frame_color)
    framed = Image.new("RGBA", (w, total_h), (255, 255, 255, 0))
    draw = ImageDraw.Draw(framed)
    
    if frame_style == 'bottom_banner':
        framed.paste(qr_img, (0, 0), qr_img if qr_img.mode == 'RGBA' else None)
        # Draw bottom banner
        pill_margin = int(w * 0.05)
        pill_y1 = h + int(banner_height * 0.12)
        pill_y2 = total_h - int(banner_height * 0.12)
        radius = (pill_y2 - pill_y1) // 2
        draw.rounded_rectangle(
            [pill_margin, pill_y1, w - pill_margin, pill_y2],
            radius=radius,
            fill=frame_c
        )
        # Draw text centered
        text = (frame_text or "SCAN ME").upper()
        font_size = max(16, int(banner_height * 0.40))
        try:
            font = ImageFont.load_default(size=font_size)
        except:
            font = ImageFont.load_default()
        
        # Center text inside banner pill
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        text_x = (w - text_w) // 2
        text_y = pill_y1 + ((pill_y2 - pill_y1) - text_h) // 2 - 2
        draw.text((text_x, text_y), text, fill=(255, 255, 255), font=font)

    elif frame_style == 'top_banner':
        pill_margin = int(w * 0.05)
        pill_y1 = int(banner_height * 0.12)
        pill_y2 = banner_height - int(banner_height * 0.12)
        radius = (pill_y2 - pill_y1) // 2
        draw.rounded_rectangle(
            [pill_margin, pill_y1, w - pill_margin, pill_y2],
            radius=radius,
            fill=frame_c
        )
        text = (frame_text or "SCAN ME").upper()
        font_size = max(16, int(banner_height * 0.40))
        try:
            font = ImageFont.load_default(size=font_size)
        except:
            font = ImageFont.load_default()
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        text_x = (w - text_w) // 2
        text_y = pill_y1 + ((pill_y2 - pill_y1) - text_h) // 2 - 2
        draw.text((text_x, text_y), text, fill=(255, 255, 255), font=font)
        framed.paste(qr_img, (0, banner_height), qr_img if qr_img.mode == 'RGBA' else None)
    else:
        framed.paste(qr_img, (0, 0), qr_img if qr_img.mode == 'RGBA' else None)
        
    return framed

# --- CORE GENERATION ENGINES ---

def generate_qr_image(
    data: str,
    fg_color: str = "#0f172a",
    bg_color: str = "#ffffff",
    gradient_type: str = "solid",
    fg_color_2: Optional[str] = "#3b82f6",
    dot_style: str = "rounded",
    eye_frame: str = "square",
    eye_ball: str = "square",
    eye_color: Optional[str] = None,
    error_correction: str = "H",
    margin: int = 2,
    size: int = 800,
    logo_type: str = "none",
    logo_data: Optional[str] = None,
    frame_style: str = "none",
    frame_text: Optional[str] = "SCAN ME",
    frame_color: Optional[str] = "#0f172a"
) -> bytes:
    """Generate high-quality customized PNG image with full transparency and CTA frame support."""
    ec_level = ERROR_LEVEL_MAP.get(error_correction.upper(), ERROR_CORRECT_H)
    if logo_type != 'none':
        ec_level = ERROR_CORRECT_H
        
    qr = qrcode.QRCode(
        version=None,
        error_correction=ec_level,
        box_size=10,
        border=max(1, margin),
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    drawer = get_module_drawer(dot_style)
    mask = get_color_mask(gradient_type, fg_color, fg_color_2, bg_color)
    
    img = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=drawer,
        color_mask=mask
    )
    
    pil_img = img.get_image()
    if is_transparent(bg_color):
        pil_img = pil_img.convert("RGBA")
        
    # Overlay custom corner eyes (frames and balls)
    pil_img = overlay_custom_eyes(
        pil_img, 
        qr=qr, 
        eye_frame=eye_frame, 
        eye_ball=eye_ball, 
        eye_color=eye_color, 
        default_fg=fg_color, 
        bg_color=bg_color
    )
    
    # Resize to requested high-res size with Lanczos filter for razor-sharp quality
    if size and size != pil_img.size[0]:
        pil_img = pil_img.resize((size, size), Image.Resampling.LANCZOS)
        
    if logo_type != 'none':
        pil_img = overlay_logo(pil_img, logo_type, logo_data)
        
    if frame_style != 'none':
        pil_img = apply_frame(pil_img, frame_style, frame_text or "SCAN ME", frame_color or "#0f172a")
        
    buf = io.BytesIO()
    pil_img.save(buf, format="PNG")
    buf.seek(0)
    return buf.getvalue()

def generate_qr_svg(
    data: str,
    fg_color: str = "#0f172a",
    bg_color: str = "#ffffff",
    error_correction: str = "H",
    margin: int = 2,
    logo_type: str = "none"
) -> str:
    """Generate crisp vector SVG output with transparent background support."""
    ec_level = ERROR_LEVEL_MAP.get(error_correction.upper(), ERROR_CORRECT_H)
    if logo_type != 'none':
        ec_level = ERROR_CORRECT_H
    qr = qrcode.QRCode(
        version=None,
        error_correction=ec_level,
        box_size=10,
        border=max(1, margin),
        image_factory=qrcode.image.svg.SvgPathImage
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image()
    buf = io.BytesIO()
    img.save(buf)
    svg_str = buf.getvalue().decode('utf-8')
    
    # Custom foreground color replacement in SVG
    if fg_color and fg_color != '#000000':
        svg_str = re.sub(r'fill="black"', f'fill="{fg_color}"', svg_str)
        svg_str = re.sub(r'fill="#000000"', f'fill="{fg_color}"', svg_str)
        svg_str = re.sub(r'path style="fill:#000000', f'path style="fill:{fg_color}', svg_str)
        
    # Inject background if not transparent
    if not is_transparent(bg_color) and bg_color:
        bg_rect = f'<rect width="100%" height="100%" fill="{bg_color}"/>'
        # Insert after <svg ...>
        svg_str = re.sub(r'(<svg[^>]*>)', r'\1' + bg_rect, svg_str, count=1)
        
    return svg_str

def generate_qr_pdf(
    data: str,
    title: str = "Smart QR Code",
    fg_color: str = "#0f172a",
    bg_color: str = "#ffffff",
    gradient_type: str = "solid",
    fg_color_2: Optional[str] = "#3b82f6",
    dot_style: str = "rounded",
    eye_frame: str = "square",
    eye_ball: str = "square",
    eye_color: Optional[str] = None,
    error_correction: str = "H",
    margin: int = 2,
    size: int = 2400,
    logo_type: str = "none",
    logo_data: Optional[str] = None,
    frame_style: str = "none",
    frame_text: Optional[str] = "SCAN ME",
    frame_color: Optional[str] = "#0f172a"
) -> bytes:
    """Generate 300 DPI print-ready high-definition PDF document."""
    png_bytes = generate_qr_image(
        data=data,
        fg_color=fg_color,
        bg_color="#ffffff" if is_transparent(bg_color) else bg_color,
        gradient_type=gradient_type,
        fg_color_2=fg_color_2,
        dot_style=dot_style,
        eye_frame=eye_frame,
        eye_ball=eye_ball,
        eye_color=eye_color,
        error_correction=error_correction,
        margin=margin,
        size=max(size, 2000),
        logo_type=logo_type,
        logo_data=logo_data,
        frame_style=frame_style,
        frame_text=frame_text,
        frame_color=frame_color
    )
    
    img = Image.open(io.BytesIO(png_bytes)).convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="PDF", resolution=300.0, title=title)
    buf.seek(0)
    return buf.getvalue()
