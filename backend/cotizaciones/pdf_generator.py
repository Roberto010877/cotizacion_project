from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from django.utils import translation
from django.utils.translation import get_language
from django.conf import settings
import os
import logging

logger = logging.getLogger(__name__)

# --- CONFIGURACIÓN DE COLORES Y FUENTES ---
HEADER_GRAY = colors.HexColor("#0F2B4F")  # Azul oscuro para encabezado ambiente
ROW_GRAY = colors.HexColor("#E6E6E6")     # Gris claro para encabezado items
TEXT_GRAY = colors.HexColor("#404040")
BORDER_GRAY = colors.HexColor("#CCCCCC")
HEADER_FOOTER_BG = colors.HexColor("#305496")  # Azul oscuro 25% para encabezado y pie de página
HEADER_ACCENT = colors.HexColor("#8B4513")  # Marrón/café para acento

# Fuentes estándar
FONT_MAIN = "Helvetica"
FONT_BOLD = "Helvetica-Bold"

# --- DICCIONARIO DE TRADUCCIONES ---
TRANSLATIONS = {
    'es': {
        'company_tagline': 'CORTINAS & PERSIANAS',
        'quote': 'PRESUPUESTO',
        'quote_number': 'Nº',
        'date': 'Fecha',
        'valid_until': 'Válido hasta',
        'client': 'Cliente',
        'phone': 'Teléfono',
        'salesperson': 'Vendedor',
        'environment': 'AMBIENTE',
        'item': 'ITEM',
        'code': 'CÓDIGO',
        'description': 'DESCRIPCIÓN',
        'qty': 'CANT.',
        'width': 'ANCHO',
        'height': 'ALTO',
        'unit': 'UN',
        'qty_total': 'Q. TOTAL',
        'unit_price': 'V.UNIT',
        'total': 'TOTAL',
        'subtotal': 'SUB.TOTAL',
        'discount': 'Descuento',
        'total_general': 'TOTAL GENERAL',
        'terms_title': 'Términos y Condiciones',
        'terms': [
            '1- Por ser material confeccionado a medida, no se puede cancelar o modificar, ya que la fabricación se inicia inmediatamente después de la autorización.',
            '2- Asumimos el compromiso de respetar las fechas de los cheques pos-fechados.',
            '3- No hacemos reserva de horario predefinido para instalación.',
            '4- No nos responsabilizamos por daños causados en la red hidráulica como consecuencia de perforaciones.',
            '5- Persianas: Previsión de entrega de hasta 15 días hábiles.',
            '6- Cortinas: Previsión de entrega de hasta 30 días hábiles.',
            '7- Pisos: Previsión de entrega de hasta 10 días hábiles.',
            '8- Papel de Pared: A consultar.',
            '9- El presente presupuesto tiene validez por 45 días.'
        ],
        'page': 'Página',
        'of': 'de'
    },
    'pt': {
        'company_tagline': 'CORTINAS & PERSIANAS',
        'quote': 'ORÇAMENTO',
        'quote_number': 'Nº',
        'date': 'Data',
        'valid_until': 'Válido até',
        'client': 'Cliente',
        'phone': 'Telefone',
        'salesperson': 'Vendedor',
        'environment': 'AMBIENTE',
        'item': 'ITEM',
        'code': 'CÓDIGO',
        'description': 'DESCRIÇÃO',
        'qty': 'QTD',
        'width': 'LARG',
        'height': 'ALT',
        'unit': 'UN',
        'qty_total': 'Q. TOTAL',
        'unit_price': 'V.UNIT',
        'total': 'TOTAL',
        'subtotal': 'SUB.TOTAL',
        'discount': 'Desconto',
        'total_general': 'TOTAL GERAL',
        'terms_title': 'Termos e Condições',
        'terms': [
            '1- Por ser material confeccionado sob medida, não podendo cancelá-lo ou modificá-lo, pois a fabricação é iniciada logo após a autorização deste.',
            '2- Assumimos o compromisso de respeitar as datas dos cheques pré-datados.',
            '3- Não fazemos marcação de horário predefinido para instalação.',
            '4- Não nos responsabilizamos por danos causados na rede hidráulica por consequência de perfurações.',
            '5- Persianas: Previsão de entrega de até 15 dias úteis.',
            '6- Cortinas: Previsão de entrega de até 30 dias úteis.',
            '7- Pisos: Previsão de entrega de até 10 dias úteis.',
            '8- Papel de Parede: A consultar.',
            '9- O presente orçamento tem validade por 45 dias.'
        ],
        'page': 'Página',
        'of': 'de'
    },
    'en': {
        'company_tagline': 'CURTAINS & BLINDS',
        'quote': 'QUOTE',
        'quote_number': 'No.',
        'date': 'Date',
        'valid_until': 'Valid until',
        'client': 'Client',
        'phone': 'Phone',
        'salesperson': 'Salesperson',
        'environment': 'ENVIRONMENT',
        'item': 'ITEM',
        'code': 'CODE',
        'description': 'DESCRIPTION',
        'qty': 'QTY',
        'width': 'WIDTH',
        'height': 'HEIGHT',
        'unit': 'UN',
        'qty_total': 'Q. TOTAL',
        'unit_price': 'U.PRICE',
        'total': 'TOTAL',
        'subtotal': 'SUBTOTAL',
        'discount': 'Discount',
        'total_general': 'GRAND TOTAL',
        'terms_title': 'Terms and Conditions',
        'terms': [
            '1- As this is custom-made material, it cannot be cancelled or modified, as manufacturing begins immediately after authorization.',
            '2- We commit to respecting the dates of post-dated checks.',
            '3- We do not schedule predefined times for installation.',
            '4- We are not responsible for damage to plumbing caused by drilling.',
            '5- Blinds: Delivery forecast up to 15 business days.',
            '6- Curtains: Delivery forecast up to 30 business days.',
            '7- Flooring: Delivery forecast up to 10 business days.',
            '8- Wallpaper: To be consulted.',
            '9- This quote is valid for 45 days.'
        ],
        'page': 'Page',
        'of': 'of'
    }
}


def get_translation(key, lang_code=None):
    if lang_code is None:
        lang_code = get_language()
    if '-' in lang_code:
        lang_code = lang_code.split('-')[0]
    if lang_code not in TRANSLATIONS:
        lang_code = 'es'
    return TRANSLATIONS[lang_code].get(key, TRANSLATIONS['es'].get(key, key))


def add_page_number(canvas, doc, lang_code='es'):
    canvas.saveState()
    
    # Diseño del encabezado con forma diagonal
    # Franja azul principal con corte diagonal
    path = canvas.beginPath()
    path.moveTo(0, A4[1])  # Esquina superior izquierda
    path.lineTo(A4[0] * 0.7, A4[1])  # Línea horizontal hasta 70% del ancho
    path.lineTo(A4[0] * 0.8, A4[1] - 3*cm)  # Línea diagonal hacia abajo
    path.lineTo(0, A4[1] - 3*cm)  # Línea horizontal hacia la izquierda
    path.close()
    
    canvas.setFillColor(HEADER_FOOTER_BG)
    canvas.drawPath(path, fill=1, stroke=0)
    
    # Franja de acento marrón/café en la esquina
    accent_path = canvas.beginPath()
    accent_path.moveTo(A4[0] * 0.7, A4[1])  # Desde donde termina el azul
    accent_path.lineTo(A4[0], A4[1])  # Hasta la esquina superior derecha
    accent_path.lineTo(A4[0], A4[1] - 2*cm)  # Hacia abajo
    accent_path.lineTo(A4[0] * 0.8, A4[1] - 3*cm)  # Conecta con la diagonal azul
    accent_path.close()
    
    canvas.setFillColor(HEADER_ACCENT)
    canvas.drawPath(accent_path, fill=1, stroke=0)
    
    # Fondo azul en el pie de página con diseño similar (reducido a 1.8cm de alto)
    footer_path = canvas.beginPath()
    footer_path.moveTo(0, 0)  # Esquina inferior izquierda
    footer_path.lineTo(A4[0] * 0.85, 0)  # Línea horizontal hasta 85% del ancho
    footer_path.lineTo(A4[0] * 0.9, 1.8*cm)  # Línea diagonal hacia arriba
    footer_path.lineTo(0, 1.8*cm)  # Línea horizontal hacia la izquierda
    footer_path.close()
    
    canvas.setFillColor(HEADER_FOOTER_BG)
    canvas.drawPath(footer_path, fill=1, stroke=0)
    
    # Acento en el pie
    footer_accent = canvas.beginPath()
    footer_accent.moveTo(A4[0] * 0.85, 0)
    footer_accent.lineTo(A4[0], 0)
    footer_accent.lineTo(A4[0], 1.2*cm)
    footer_accent.lineTo(A4[0] * 0.9, 1.8*cm)
    footer_accent.close()
    
    canvas.setFillColor(HEADER_ACCENT)
    canvas.drawPath(footer_accent, fill=1, stroke=0)
    
    # Información de contacto en el footer
    canvas.setFillColor(colors.white)
    canvas.setFont(FONT_MAIN, 8.5)
    
    # Línea 1: Teléfono, WhatsApp, Instagram
    y_position_line1 = 1.15*cm
    x_start = 0.5*cm
    
    # Teléfono (con símbolo de teléfono)
    canvas.drawString(x_start, y_position_line1, "Tel: +55119453632-4981")
    
    # WhatsApp
    x_start += 4.5*cm
    canvas.drawString(x_start, y_position_line1, "WhatsApp: +55119453632-4981")
    
    # Instagram
    x_start += 5.5*cm
    canvas.drawString(x_start, y_position_line1, "Instagram: https://instagram.com/cortinas&persianas")
    
    # Línea 2: Email y Ubicación
    y_position_line2 = 0.5*cm
    x_start = 0.5*cm
    
    # Email
    canvas.drawString(x_start, y_position_line2, "Email: ventas@cortinaspersias.com")
    
    # Ubicación
    x_start += 8*cm
    canvas.drawString(x_start, y_position_line2, "San Paulo - Brasil")
    
    # Número de página en la esquina derecha
    page_num = canvas.getPageNumber()
    total_pages = doc.page
    text = f"{get_translation('page', lang_code)} {page_num} / {total_pages}"
    canvas.drawRightString(A4[0] - 0.5*cm, 0.5*cm, text)
    
    canvas.restoreState()


def generate_cotizacion_pdf(cotizacion, request=None):
    user_language = 'es'
    if request and hasattr(request, 'user') and request.user.is_authenticated:
        user_language = getattr(request.user, 'language', 'es') or 'es'
    
    old_language = get_language()
    translation.activate(user_language)
    
    buffer = BytesIO()
    
    # --- MÁRGENES ---
    left_margin = 0.5 * cm
    right_margin = 0.5 * cm
    top_margin = 0.2 * cm  # Reducido para que el texto suba más y quede dentro del encabezado
    bottom_margin = 2.3 * cm  # Ajustado para el footer con información de contacto
    
    available_width = A4[0] - left_margin - right_margin
    
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=right_margin,
        leftMargin=left_margin,
        topMargin=top_margin,
        bottomMargin=bottom_margin,
    )
    
    story = []
    styles = getSampleStyleSheet()
    
    style_normal = ParagraphStyle('Normal', parent=styles['Normal'], fontName=FONT_MAIN, fontSize=10, leading=11)  # Reducido de 12 a 11
    style_bold = ParagraphStyle('Bold', parent=style_normal, fontName=FONT_BOLD)
    style_small = ParagraphStyle('Small', parent=style_normal, fontSize=7.5, leading=9)
    style_small_center = ParagraphStyle('SmallCenter', parent=style_small, alignment=TA_CENTER)  # Para datos centrados
    style_terms = ParagraphStyle('Terms', parent=style_normal, fontSize=8, leading=10, alignment=TA_JUSTIFY)
    
    # --- HEADER ---
    logo_path = os.path.join(settings.BASE_DIR, 'cotizaciones', 'static', 'cotizaciones', 'images', 'Logo Cortinas.png')
    
    # Logo y texto del tagline lado a lado
    left_content = []
    if os.path.exists(logo_path):
        # Logo circular
        logo = Image(logo_path, width=2.5*cm, height=2.5*cm, mask='auto')
        
        # Texto a la derecha del logo
        tagline = Paragraph(
            f"<b>{get_translation('company_tagline', user_language)}</b>", 
            ParagraphStyle('Tagline', parent=style_bold, fontSize=9, alignment=TA_LEFT, textColor=colors.white)
        )
        
        # Crear tabla interna para logo y tagline lado a lado
        logo_table = Table([[logo, tagline]], colWidths=[2.5*cm, 5*cm])
        logo_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'LEFT'),
        ]))
        left_content.append(logo_table)
    else:
        tagline = Paragraph(
            f"<b>{get_translation('company_tagline', user_language)}</b>", 
            ParagraphStyle('Tagline', parent=style_bold, fontSize=9, alignment=TA_LEFT, textColor=colors.white)
        )
        left_content.append(tagline)
    
    # Columna derecha: Reorganizada según orden solicitado
    right_content = []
    
    # 1. COTIZACIÓN (título)
    quote_title = Paragraph(
        f"<b>{get_translation('quote', user_language)}</b>",
        ParagraphStyle('QuoteTitle', parent=style_bold, fontSize=11, alignment=TA_RIGHT, textColor=colors.white)
    )
    right_content.append(quote_title)
    
    # 2. Número (COT-0000012)
    quote_number = Paragraph(
        f"<b>{cotizacion.numero}</b>",
        ParagraphStyle('QuoteNum', parent=style_bold, fontSize=10, alignment=TA_RIGHT, textColor=colors.white)
    )
    right_content.append(quote_number)
    
    # 3. Página X / Y (se calcula en el footer, aquí podemos omitirlo o dejarlo en blanco)
    # Se mostrará en el pie de página
    
    # 4. Fecha de emisión
    date_text = f"{get_translation('date', user_language)}: {cotizacion.fecha_emision.strftime('%d/%m/%Y')}"
    right_content.append(Paragraph(date_text, ParagraphStyle('DateRight', parent=style_normal, fontSize=9, alignment=TA_RIGHT, leading=10, textColor=colors.white)))
    
    # 5. Fecha de validez
    valid_until_text = f"{get_translation('valid_until', user_language)}: {cotizacion.fecha_validez.strftime('%d/%m/%Y')}"
    right_content.append(Paragraph(valid_until_text, ParagraphStyle('ValidRight', parent=style_normal, fontSize=9, alignment=TA_RIGHT, leading=10, textColor=colors.white)))
    
    header_table = Table([[left_content, right_content]], colWidths=[available_width * 0.5, available_width * 0.5])
    header_table.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('ALIGN', (0, 0), (0, 0), 'LEFT'), ('ALIGN', (1, 0), (1, 0), 'RIGHT')]))
    
    story.append(header_table)
    story.append(Spacer(1, 0.3*cm))
    
    # --- CLIENT INFO ---
    client_info = [[Paragraph(f"<b>{get_translation('client', user_language)}:</b> {cotizacion.cliente.nombre}", style_normal)]]
    if hasattr(cotizacion.cliente, 'telefono') and cotizacion.cliente.telefono:
        client_info.append([Paragraph(f"<b>{get_translation('phone', user_language)}:</b> {cotizacion.cliente.telefono}", style_normal)])
    
    vendedor_nombre = cotizacion.vendedor.username if (cotizacion.vendedor and hasattr(cotizacion.vendedor, 'username')) else (cotizacion.vendedor.nombre if (cotizacion.vendedor and hasattr(cotizacion.vendedor, 'nombre')) else "Sistema")
    client_info.append([Paragraph(f"<b>{get_translation('salesperson', user_language)}:</b> {str(vendedor_nombre).title()}", style_normal)])
    
    client_table = Table(client_info, colWidths=[available_width])
    story.append(client_table)
    story.append(Spacer(1, 0.3*cm))
    
    # --- AMBIENTES ---
    for ambiente in cotizacion.ambientes.all():
        ambiente_header = Paragraph(f"<b>{get_translation('environment', user_language)}: {ambiente.nombre.upper()}</b>", ParagraphStyle('EnvHeader', parent=style_bold, textColor=colors.white, fontSize=10))
        env_table = Table([[ambiente_header]], colWidths=[available_width])
        env_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), HEADER_GRAY),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(env_table)
        
        table_data = []
        table_styles = []
        
        header_row = [
            f"{get_translation('item', user_language)}",
            f"{get_translation('code', user_language)}",
            f"{get_translation('description', user_language)}",
            f"{get_translation('qty', user_language)}",
            f"{get_translation('width', user_language)}",
            f"{get_translation('height', user_language)}",
            f"{get_translation('unit', user_language)}",
            f"{get_translation('qty_total', user_language)}",
            f"{get_translation('unit_price', user_language)}",
            f"{get_translation('total', user_language)}",
        ]

        ambiente_subtotal = 0
        
        for i, item in enumerate(ambiente.items.all()):
            # 1. ENCABEZADO REPETIDO
            table_data.append(header_row)
            header_idx = len(table_data) - 1
            table_styles.extend([
                ('BACKGROUND', (0, header_idx), (-1, header_idx), ROW_GRAY),
                ('TEXTCOLOR', (0, header_idx), (-1, header_idx), colors.black),
                ('ALIGN', (0, header_idx), (0, header_idx), 'CENTER'),  # ITEM centrado
                ('ALIGN', (1, header_idx), (2, header_idx), 'LEFT'),    # CÓDIGO y DESCRIPCIÓN a la izquierda
                ('ALIGN', (3, header_idx), (9, header_idx), 'CENTER'),  # Resto centrado
                ('FONTNAME', (0, header_idx), (-1, header_idx), FONT_BOLD),
                ('FONTSIZE', (0, header_idx), (-1, header_idx), 7.5),
                ('TOPPADDING', (0, header_idx), (-1, header_idx), 5),
                ('BOTTOMPADDING', (0, header_idx), (-1, header_idx), 5),
            ])

            # DATA PREP
            producto_codigo = item.producto.codigo if item.producto else ''
            producto_nombre = item.producto.nombre if item.producto else ''
            unidad_medida = item.producto.unidad_medida if item.producto else 'PC'
            
            # 2. DATOS
            item_row = [
                Paragraph(f"{item.numero_item:02d}", style_small_center),
                Paragraph(producto_codigo, style_small_center),
                Paragraph(producto_nombre, style_small),
                Paragraph(str(int(float(item.cantidad))), style_small_center),
                Paragraph(f"{float(item.ancho):.3f}", style_small_center),
                Paragraph(f"{float(item.alto):.3f}", style_small_center),
                Paragraph(unidad_medida, style_small_center),
                Paragraph(str(int(float(item.cantidad))), style_small_center),
                Paragraph(f"{float(item.precio_unitario):.2f}", style_small_center),
                Paragraph(f"<b>{float(item.precio_total):.2f}</b>", style_small_center),
            ]
            table_data.append(item_row)
            data_idx = len(table_data) - 1
            
            # 3. ALINEACIONES (Ajuste Solicitado)
            # - Descripcion (2): Izquierda
            # - ITEM, CÓDIGO y todo lo numérico (0, 1, 3-9): CENTRO
            table_styles.extend([
                ('ALIGN', (0, data_idx), (1, data_idx), 'CENTER'), # Item y Código al centro
                ('ALIGN', (2, data_idx), (2, data_idx), 'LEFT'),   # Solo Descripción a la izquierda
                ('ALIGN', (3, data_idx), (9, data_idx), 'CENTER'), # Todos los datos numéricos al CENTRO
                ('VALIGN', (0, data_idx), (-1, data_idx), 'TOP'),
                ('FONTSIZE', (0, data_idx), (-1, data_idx), 7.5),
                ('TOPPADDING', (0, data_idx), (-1, data_idx), 3),
                ('BOTTOMPADDING', (0, data_idx), (-1, data_idx), 3),
            ])
            
            # 4. DESCRIPCIÓN TÉCNICA
            desc_text = item.descripcion_completa if hasattr(item, 'descripcion_completa') else (item.descripcion_tecnica if hasattr(item, 'descripcion_tecnica') else "")
            desc_row = [Paragraph(desc_text, ParagraphStyle('Desc', parent=style_small, fontSize=7, textColor=TEXT_GRAY))]
            desc_row.extend([''] * 9)
            table_data.append(desc_row)
            desc_idx = len(table_data) - 1
            table_styles.extend([
                ('SPAN', (0, desc_idx), (9, desc_idx)),
                ('VALIGN', (0, desc_idx), (-1, desc_idx), 'TOP'),
                ('ALIGN', (0, desc_idx), (0, desc_idx), 'LEFT'),
                ('TOPPADDING', (0, desc_idx), (-1, desc_idx), 0),
                ('BOTTOMPADDING', (0, desc_idx), (-1, desc_idx), 8),
            ])
            
            ambiente_subtotal += float(item.precio_total)
        
        # 5. SUBTOTAL
        subtotal_label = f"<b>{get_translation('subtotal', user_language)} - {ambiente.nombre}</b>"
        subtotal_row = [
            Paragraph(subtotal_label, style_bold),
            '', '', '', '', '', '', '', '',
            Paragraph(f"<b>{ambiente_subtotal:.2f}</b>", style_bold)
        ]
        table_data.append(subtotal_row)
        subtotal_idx = len(table_data) - 1
        table_styles.extend([
            ('BACKGROUND', (0, subtotal_idx), (-1, subtotal_idx), ROW_GRAY),
            ('SPAN', (0, subtotal_idx), (8, subtotal_idx)),
            ('ALIGN', (0, subtotal_idx), (8, subtotal_idx), 'LEFT'),
            ('ALIGN', (9, subtotal_idx), (9, subtotal_idx), 'RIGHT'),
            ('TOPPADDING', (0, subtotal_idx), (-1, subtotal_idx), 5),
            ('BOTTOMPADDING', (0, subtotal_idx), (-1, subtotal_idx), 5),
        ])
        
        # --- ANCHOS DE COLUMNA RECALCULADOS (Total 100%) ---
        # ITEM: Aumentado de 0.04 a 0.05
        # Q.TOTAL: Aumentado de 0.08 a 0.09
        # TOTAL: Disminuido de 0.09 a 0.08
        # DESCRIPCIÓN: Ajuste de 0.30 a 0.29 para cuadrar suma
        col_widths = [
            available_width * 0.05,  # ITEM (+1%)
            available_width * 0.13,  # CÓDIGO
            available_width * 0.29,  # DESCRIPCIÓN (Ajuste fino)
            available_width * 0.06,  # CANT
            available_width * 0.08,  # ANCHO
            available_width * 0.08,  # ALTO
            available_width * 0.05,  # UN
            available_width * 0.09,  # Q. TOTAL (+1%)
            available_width * 0.09,  # V.UNIT
            available_width * 0.08,  # TOTAL (-1%)
        ]
        
        items_table = Table(table_data, colWidths=col_widths)
        items_table.setStyle(TableStyle(table_styles))
        
        story.append(items_table)
        story.append(Spacer(1, 0.2*cm))  # Reducido de 0.5cm a 0.2cm
    
    # --- TOTALES FINALES ---
    totals_data = []
    if float(cotizacion.descuento_total) > 0:
        totals_data.append([
            Paragraph(f"{get_translation('discount', user_language)}:", style_bold),
            Paragraph(f"-{float(cotizacion.descuento_total):.2f}", style_normal)
        ])
    totals_data.append([
        Paragraph(f"<b>{get_translation('total_general', user_language)}:</b>", style_bold),  # Reducido de fontSize=12 a estilo normal
        Paragraph(f"<b>{float(cotizacion.total_general):.2f}</b>", style_bold)  # Reducido de fontSize=12 a estilo normal
    ])
    
    # Calcular anchos para alinear con la columna TOTAL (8% del available_width)
    totals_table = Table(totals_data, colWidths=[available_width * 0.92, available_width * 0.08])  # 92% + 8% = 100%
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LINEABOVE', (0, -1), (-1, -1), 2, colors.black),
    ]))
    
    story.append(totals_table)
    story.append(Spacer(1, 1*cm))
    
    terms_title = Paragraph(f"<b>{get_translation('terms_title', user_language)}</b>", style_bold)
    story.append(terms_title)
    story.append(Spacer(1, 0.2*cm))
    for term in get_translation('terms', user_language):
        story.append(Paragraph(term, style_terms))
        story.append(Spacer(1, 0.1*cm))
    
    doc.build(story, onFirstPage=lambda c, d: add_page_number(c, d, user_language), onLaterPages=lambda c, d: add_page_number(c, d, user_language))
    translation.activate(old_language)
    buffer.seek(0)
    return buffer