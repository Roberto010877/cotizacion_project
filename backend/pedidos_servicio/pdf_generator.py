from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from django.utils import translation
from django.utils.translation import get_language
import logging

logger = logging.getLogger(__name__)

# --- CONFIGURACIÓN DE COLORES Y FUENTES ---
CORPORATE_BLUE = colors.HexColor("#1F4E79")
HEADER_GRAY = colors.HexColor("#F2F2F2")
HEADER_TABLE_GRAY = colors.HexColor("#808080")  # Gris oscuro para encabezados de tabla
TEXT_GRAY = colors.HexColor("#404040")
STATUS_GREEN = colors.HexColor("#008000")

# Fuentes estándar
FONT_MAIN = "Helvetica"
FONT_BOLD = "Helvetica-Bold"
FONT_ITALIC = "Helvetica-Oblique"

# --- DICCIONARIO DE TRADUCCIONES ---
TRANSLATIONS = {
    'es': {
        'service_order': 'PEDIDO DE SERVICIO',
        'official_document': 'Documento Oficial de Solicitud',
        'order_number': 'N° PEDIDO',
        'status': 'ESTADO',
        'date': 'FECHA',
        'requester': 'SOLICITANTE',
        'client_data': 'Datos del Cliente',
        'name_company': 'NOMBRE / RAZÓN SOCIAL',
        'id_document': 'DOCUMENTO DE IDENTIDAD',
        'email': 'CORREO ELECTRÓNICO',
        'phone': 'TELÉFONO',
        'contact_phone': 'TELÉFONO CONTACTO',
        'address': 'DIRECCIÓN',
        'assignments_deadlines': 'Asignaciones y Plazos',
        'supervisor': 'SUPERVISOR',
        'start_date': 'FECHA INICIO',
        'fabricator': 'FABRICADOR',
        'current_status': 'ESTADO ACTUAL',
        'end_date': 'FECHA FIN',
        'installer': 'INSTALADOR',
        'general_observations': 'Observaciones Generales:',
        'items_detail': 'Detalle de Ítems',
        'environment': 'Ambiente',
        'model': 'Modelo',
        'fabric': 'Tejido',
        'width': 'Ancho',
        'height': 'Alto',
        'quantity': 'Cant',
        'command': 'Comando',
        'system': 'Sistema',
        'observations': 'Observaciones:',
        'no_items': 'No hay ítems registrados en este pedido.',
        'generated': 'Generado:',
        'page': 'Pág.',
    },
    'pt': {
        'service_order': 'PEDIDO DE SERVIÇO',
        'official_document': 'Documento Oficial de Solicitação',
        'order_number': 'Nº PEDIDO',
        'status': 'STATUS',
        'date': 'DATA',
        'requester': 'SOLICITANTE',
        'client_data': 'Dados do Cliente',
        'name_company': 'NOME / RAZÃO SOCIAL',
        'id_document': 'DOCUMENTO DE IDENTIDADE',
        'email': 'E-MAIL',
        'phone': 'TELEFONE',
        'contact_phone': 'TELEFONE DE CONTATO',
        'address': 'ENDEREÇO',
        'assignments_deadlines': 'Atribuições e Prazos',
        'supervisor': 'SUPERVISOR',
        'start_date': 'DATA DE INÍCIO',
        'fabricator': 'FABRICADOR',
        'current_status': 'STATUS ATUAL',
        'end_date': 'DATA DE FIM',
        'installer': 'INSTALADOR',
        'general_observations': 'Observações Gerais:',
        'items_detail': 'Detalhe de Itens',
        'environment': 'Ambiente',
        'model': 'Modelo',
        'fabric': 'Tecido',
        'width': 'Largura',
        'height': 'Altura',
        'quantity': 'Qtd',
        'command': 'Comando',
        'system': 'Sistema',
        'observations': 'Observações:',
        'no_items': 'Não há itens registrados neste pedido.',
        'generated': 'Gerado:',
        'page': 'Pág.',
    },
    'en': {
        'service_order': 'SERVICE ORDER',
        'official_document': 'Official Request Document',
        'order_number': 'ORDER #',
        'status': 'STATUS',
        'date': 'DATE',
        'requester': 'REQUESTER',
        'client_data': 'Client Data',
        'name_company': 'NAME / COMPANY',
        'id_document': 'ID DOCUMENT',
        'email': 'EMAIL',
        'phone': 'PHONE',
        'contact_phone': 'CONTACT PHONE',
        'address': 'ADDRESS',
        'assignments_deadlines': 'Assignments and Deadlines',
        'supervisor': 'SUPERVISOR',
        'start_date': 'START DATE',
        'fabricator': 'FABRICATOR',
        'current_status': 'CURRENT STATUS',
        'end_date': 'END DATE',
        'installer': 'INSTALLER',
        'general_observations': 'General Observations:',
        'items_detail': 'Items Detail',
        'environment': 'Environment',
        'model': 'Model',
        'fabric': 'Fabric',
        'width': 'Width',
        'height': 'Height',
        'quantity': 'Qty',
        'command': 'Command',
        'system': 'System',
        'observations': 'Observations:',
        'no_items': 'No items registered in this order.',
        'generated': 'Generated:',
        'page': 'Page',
    }
}

def get_translation(key, lang_code=None):
    """Obtiene la traducción de una clave según el idioma actual o especificado."""
    if lang_code is None:
        lang_code = get_language()
    
    # Extraer solo el código de idioma (ej: 'es' de 'es-es')
    if '-' in lang_code:
        lang_code = lang_code.split('-')[0]
    
    # Usar español como idioma por defecto si no está disponible
    if lang_code not in TRANSLATIONS:
        lang_code = 'es'
    
    return TRANSLATIONS[lang_code].get(key, TRANSLATIONS['es'].get(key, key))

def generate_pedido_pdf(pedido, request=None):
    """
    Genera un PDF profesional del pedido de servicio.
    Argumentos:
        pedido: Instancia del modelo Pedido de Django.
        request: (Opcional) Request object para obtener el idioma del usuario.
    Retorna:
        Buffer (BytesIO) con el PDF generado.
    """
    
    # Determinar el idioma a usar
    user_language = 'es'  # Por defecto español
    if request and hasattr(request, 'user') and request.user.is_authenticated:
        # Obtener el idioma del usuario si está disponible
        user_language = getattr(request.user, 'language', 'es') or 'es'
    
    # Activar el idioma para esta generación de PDF
    old_language = get_language()
    translation.activate(user_language)
    
    buffer = BytesIO()
    
    # Márgenes definidos (0.8 cm)
    left_margin = 0.8 * cm
    right_margin = 0.8 * cm
    
    # Cálculo dinámico del ancho disponible real
    # A4 width (21cm) - Margen Izq - Margen Der
    available_width = A4[0] - left_margin - right_margin
    
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=right_margin,
        leftMargin=left_margin,
        topMargin=1.2*cm,
        bottomMargin=2*cm,
    )
    
    story = []
    styles = getSampleStyleSheet()
    
    # --- DEFINICIÓN DE ESTILOS ---
    style_title = ParagraphStyle('TitleStyle', parent=styles['Normal'], fontName=FONT_BOLD, fontSize=18, leading=22, textColor=CORPORATE_BLUE, spaceAfter=1*mm)
    style_subtitle = ParagraphStyle('SubtitleStyle', parent=styles['Normal'], fontName=FONT_MAIN, fontSize=9, textColor=colors.black)
    style_section_header = ParagraphStyle('SectionHeaderStyle', parent=styles['Normal'], fontName=FONT_BOLD, fontSize=11, leading=13, textColor=CORPORATE_BLUE, textTransform='uppercase', spaceBefore=2*mm, spaceAfter=1*mm)
    style_label = ParagraphStyle('LabelStyle', parent=styles['Normal'], fontName=FONT_BOLD, fontSize=7.5, textColor=TEXT_GRAY, spaceAfter=0.5*mm)
    style_value = ParagraphStyle('ValueStyle', parent=styles['Normal'], fontName=FONT_MAIN, fontSize=8.5, textColor=colors.black, spaceAfter=1.5*mm)
    
    # Estilos Tabla
    style_table_header = ParagraphStyle('TableHeaderStyle', parent=styles['Normal'], fontName=FONT_BOLD, fontSize=7.5, textColor=colors.white, alignment=TA_CENTER)
    style_table_cell = ParagraphStyle('TableCellStyle', parent=styles['Normal'], fontName=FONT_MAIN, fontSize=7.5, textColor=colors.black, alignment=TA_CENTER, leading=9)
    style_table_cell_left = ParagraphStyle('TableCellLeftStyle', parent=style_table_cell, alignment=TA_LEFT)
    
    # Estilo para observación expandida
    style_obs_row = ParagraphStyle(
        'ObsRowStyle', 
        parent=styles['Normal'], 
        fontName=FONT_ITALIC, 
        fontSize=6.5, 
        textColor=TEXT_GRAY, 
        alignment=TA_LEFT,
        leftIndent=3
    )

    # ================= ENCABEZADO PRINCIPAL (CORREGIDO) =================
    header_left_content = [Paragraph(get_translation('service_order'), style_title), Paragraph(get_translation('official_document'), style_subtitle)]
    
    estado_display = pedido.get_estado_display()
    try: 
        fecha_registro = datetime.fromisoformat(str(pedido.created_at)).strftime('%d/%m/%Y')
    except: 
        fecha_registro = str(pedido.created_at)

    header_right_data = [
        [Paragraph(get_translation('order_number'), style_label), Paragraph(f"#{pedido.numero_pedido}", style_value)],
        [Paragraph(get_translation('status'), style_label), Paragraph(f'<font color="{STATUS_GREEN.hexval()}"><b>{estado_display}</b></font>', style_value)],
        [Paragraph(get_translation('date'), style_label), Paragraph(fecha_registro, style_value)],
        [Paragraph(get_translation('requester'), style_label), Paragraph(f"{pedido.usuario_creacion.get_full_name() if pedido.usuario_creacion else '-'}", style_value)],
    ]
    
    # Ancho de la tabla derecha (3cm + 4cm = 7cm)
    right_table_width = 7 * cm
    header_right_table = Table(header_right_data, colWidths=[3*cm, 4*cm])
    header_right_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'), 
        ('VALIGN', (0, 0), (-1, -1), 'TOP'), 
        ('LEFTPADDING', (0, 0), (-1, -1), 0), 
        ('RIGHTPADDING', (0, 0), (-1, -1), 0), 
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2)
    ]))
    
    # --- CORRECCIÓN AQUÍ ---
    # 1. Usamos available_width para asegurar que ocupamos todo el ancho real
    # 2. La columna izquierda toma el espacio restante: available_width - 7cm
    # 3. La columna derecha tiene el ancho exacto de la tabla interna (7cm)
    col_widths_header = [available_width - right_table_width, right_table_width]
    
    main_header_table = Table([[header_left_content, header_right_table]], colWidths=col_widths_header)
    
    # 4. Forzamos la alineación 'RIGHT' en la segunda columna para pegarla al borde
    main_header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'), # Clave para moverlo a la derecha extrema
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0)
    ]))
    
    story.append(main_header_table)
    story.append(Spacer(1, 0.15*cm))
    
    # ================= DATOS DEL CLIENTE =================
    story.append(Paragraph(get_translation('client_data'), style_section_header))
    # Usamos available_width
    story.append(Table([['']], colWidths=[available_width], rowHeights=[1], style=TableStyle([('BACKGROUND', (0, 0), (-1, -1), CORPORATE_BLUE)])))
    story.append(Spacer(1, 0.1*cm))
    
    cliente = pedido.cliente
    num_contacto = cliente.num_contacto if cliente and hasattr(cliente, 'num_contacto') else ''
    
    client_data = [
        [[Paragraph(get_translation('name_company'), style_label), Paragraph(cliente.nombre if cliente else 'N/A', style_value)],
         [Paragraph(get_translation('id_document'), style_label), Paragraph(cliente.numero_documento if cliente else 'N/A', style_value)]],
        [[Paragraph(get_translation('email'), style_label), Paragraph(cliente.email if cliente else 'N/A', style_value)],
         [Paragraph(get_translation('phone'), style_label), Paragraph(cliente.telefono if cliente else 'N/A', style_value)]],
        [[Paragraph(get_translation('contact_phone'), style_label), Paragraph(num_contacto or 'N/A', style_value)],
         [Paragraph(get_translation('address'), style_label), Paragraph(cliente.direccion if hasattr(cliente, 'direccion') and cliente.direccion else 'N/A', style_value)]]
    ]
    # Ajustamos ancho columnas
    client_table = Table(client_data, colWidths=[available_width / 2.0] * 2)
    client_table.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (0, -1), 0), ('RIGHTPADDING', (-1, 0), (-1, -1), 0)]))
    story.append(client_table)
    story.append(Spacer(1, 0.1*cm))
    
    # ================= ASIGNACIONES Y PLAZOS =================
    story.append(Paragraph(get_translation('assignments_deadlines'), style_section_header))
    story.append(Table([['']], colWidths=[available_width], rowHeights=[1], style=TableStyle([('BACKGROUND', (0, 0), (-1, -1), CORPORATE_BLUE)])))
    story.append(Spacer(1, 0.1*cm))
    
    # Obtener manufacturador e instalador directamente del pedido
    if pedido.manufacturador:
        fabricador_nombre = f"{pedido.manufacturador.nombre} {pedido.manufacturador.apellido}".strip()
        logger.info(f"PDF - Manufacturador encontrado: {fabricador_nombre}")
    else:
        fabricador_nombre = 'N/A'
        logger.info(f"PDF - Manufacturador: N/A")
    
    # Obtener instalador directamente del pedido
    if pedido.instalador:
        instalador_nombre = f"{pedido.instalador.nombre} {pedido.instalador.apellido}".strip()
        logger.info(f"PDF - Instalador encontrado: {instalador_nombre}")
    else:
        instalador_nombre = 'N/A'
        logger.info(f"PDF - Instalador: N/A")
    
    assignments_data = [
        [[Paragraph(get_translation('supervisor'), style_label), Paragraph(pedido.supervisor or 'N/A', style_value)],
         [Paragraph(get_translation('start_date'), style_label), Paragraph(pedido.fecha_inicio.strftime('%d/%m/%Y') if pedido.fecha_inicio else 'N/A', style_value)],
         [Paragraph(get_translation('fabricator'), style_label), Paragraph(fabricador_nombre, style_value)]],
        [[Paragraph(get_translation('current_status'), style_label), Paragraph(estado_display, style_value)],
         [Paragraph(get_translation('end_date'), style_label), Paragraph(pedido.fecha_fin.strftime('%d/%m/%Y') if pedido.fecha_fin else 'N/A', style_value)],
         [Paragraph(get_translation('installer'), style_label), Paragraph(instalador_nombre, style_value)]]
    ]
    # Ajuste dinámico de columnas para llenar el ancho
    assignments_table = Table(assignments_data, colWidths=[3.0*cm, 3.0*cm, available_width - 6*cm])
    assignments_table.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (0, -1), 0), ('RIGHTPADDING', (-1, 0), (-1, -1), 0)]))
    story.append(assignments_table)
    
    if pedido.observaciones:
        story.append(Paragraph(f"<b>{get_translation('general_observations')}</b> <i>{pedido.observaciones}</i>", style_value))
    story.append(Spacer(1, 0.1*cm))
    
    # ================= DETALLE DE ÍTEMS =================
    story.append(Paragraph(get_translation('items_detail'), style_section_header))
    story.append(Table([['']], colWidths=[available_width], rowHeights=[1], style=TableStyle([('BACKGROUND', (0, 0), (-1, -1), CORPORATE_BLUE)])))
    story.append(Spacer(1, 0.1*cm))
    
    if pedido.items.exists():
        items_data = []
        
        # Iteración de Items - Cada item tiene su propio encabezado
        for item in pedido.items.all():
            # Encabezado repetido para cada item
            row_header = [
                Paragraph(get_translation('environment'), style_table_header),
                Paragraph(get_translation('model'), style_table_header),
                Paragraph(get_translation('fabric'), style_table_header),
                Paragraph(get_translation('width'), style_table_header),
                Paragraph(get_translation('height'), style_table_header),
                Paragraph(get_translation('quantity'), style_table_header),
                Paragraph(get_translation('command'), style_table_header),
                Paragraph(get_translation('system'), style_table_header),
            ]
            
            lado_comando = item.get_lado_comando_display() if item.lado_comando else '-'
            obs_text = item.observaciones if item.observaciones else ""
            
            # Fila de datos del item
            row_main = [
                Paragraph(item.ambiente or '-', style_table_cell_left),
                Paragraph(item.modelo or '-', style_table_cell),
                Paragraph(item.tejido or '-', style_table_cell),
                Paragraph(f"{item.largura:.2f}" if item.largura else '-', style_table_cell),
                Paragraph(f"{item.altura:.2f}" if item.altura else '-', style_table_cell),
                Paragraph(str(item.cantidad_piezas) if item.cantidad_piezas else '-', style_table_cell),
                Paragraph(lado_comando, style_table_cell),
                Paragraph(item.get_acionamiento_display() if item.acionamiento else '-', style_table_cell),
            ]
            
            # Fila de observación (Span completo)
            if obs_text:
                row_obs = [Paragraph(f"<b>{get_translation('observations')}</b> {obs_text}", style_obs_row)] + [''] * 7
            else:
                row_obs = [Paragraph("", style_obs_row)] + [''] * 7
            
            items_data.append(row_header)
            items_data.append(row_main)
            items_data.append(row_obs)
        
        item_col_widths = [
            available_width * 0.18, # Ambiente
            available_width * 0.14, # Modelo
            available_width * 0.18, # Tejido
            available_width * 0.08, # Ancho
            available_width * 0.08, # Alto
            available_width * 0.06, # Cant
            available_width * 0.14, # Comando
            available_width * 0.14  # Sistema
        ]
        
        items_table = Table(items_data, colWidths=item_col_widths)
        
        # Estilos para cada bloque (encabezado + datos + observaciones)
        table_style_cmds = [
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]
        
        num_items = len(pedido.items.all())
        
        for i in range(num_items):
            # Cada item ocupa 3 filas: encabezado, datos, observaciones
            row_header_idx = i * 3
            row_main_idx = row_header_idx + 1
            row_obs_idx = row_header_idx + 2
            
            # Estilo del encabezado
            table_style_cmds.append(('BACKGROUND', (0, row_header_idx), (-1, row_header_idx), HEADER_TABLE_GRAY))
            table_style_cmds.append(('LINEABOVE', (0, row_header_idx), (-1, row_header_idx), 1, HEADER_TABLE_GRAY))
            table_style_cmds.append(('TOPPADDING', (0, row_header_idx), (-1, row_header_idx), 6))
            table_style_cmds.append(('BOTTOMPADDING', (0, row_header_idx), (-1, row_header_idx), 6))
            
            # Fondo alternado para datos del item
            bg_color = HEADER_GRAY if (i % 2 == 0) else colors.white
            table_style_cmds.append(('BACKGROUND', (0, row_main_idx), (-1, row_main_idx), bg_color))
            
            # Unir celdas de observación (span completo)
            table_style_cmds.append(('SPAN', (0, row_obs_idx), (-1, row_obs_idx)))
            table_style_cmds.append(('BACKGROUND', (0, row_obs_idx), (-1, row_obs_idx), bg_color))
            table_style_cmds.append(('BOTTOMPADDING', (0, row_obs_idx), (-1, row_obs_idx), 8))
            table_style_cmds.append(('TOPPADDING', (0, row_obs_idx), (-1, row_obs_idx), 2))
            
            # Línea divisoria entre items
            table_style_cmds.append(('LINEBELOW', (0, row_obs_idx), (-1, row_obs_idx), 1, CORPORATE_BLUE))

        items_table.setStyle(TableStyle(table_style_cmds))
        story.append(items_table)
        
    else:
        story.append(Paragraph(get_translation('no_items'), style_value))
    
    doc.build(story, onFirstPage=_footer_fn, onLaterPages=_footer_fn)
    buffer.seek(0)
    
    # Restaurar el idioma anterior
    translation.activate(old_language)
    
    return buffer

def _footer_fn(canvas, doc):
    """Genera el pie de página con fecha, título y numeración."""
    canvas.saveState()
    font_size = 8
    line_y = 2 * cm
    text_y = line_y - 10
    
    canvas.setStrokeColor(colors.lightgrey)
    canvas.setLineWidth(0.5)
    canvas.line(doc.leftMargin, line_y, A4[0] - doc.rightMargin, line_y)
    
    canvas.setFont(FONT_MAIN, font_size)
    canvas.setFillColor(colors.grey)
    
    fecha_gen = datetime.now().strftime("%d/%m/%Y %H:%M")
    canvas.drawString(doc.leftMargin, text_y, f"{get_translation('generated')} {fecha_gen}")
    
    title_text = "Pedido de Servicio - Cotidomo"
    text_width = canvas.stringWidth(title_text, FONT_MAIN, font_size)
    canvas.drawString((A4[0] - text_width) / 2.0, text_y, title_text)
    
    page_num_text = f"{get_translation('page')}. {doc.page}"
    page_num_width = canvas.stringWidth(page_num_text, FONT_MAIN, font_size)
    canvas.drawString(A4[0] - doc.rightMargin - page_num_width, text_y, page_num_text)
    
    canvas.restoreState()