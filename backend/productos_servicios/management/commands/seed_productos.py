from django.core.management.base import BaseCommand
from productos_servicios.models import ProductoServicio
from decimal import Decimal


class Command(BaseCommand):
    help = 'Puebla la base de datos con 30 productos y servicios de prueba.'

    def handle(self, *args, **kwargs):
        self.stdout.write('🌱 Iniciando la siembra de productos...')

        productos_data = [
            # --- CORTINAS (M2) ---
            {
                "codigo": "COR-WAV-LIN",
                "nombre": "Cortina Sistema Wave - Lino Natural",
                "tipo_producto": "CORTINA",
                "unidad_medida": "M2",
                "precio_base": "45.00",
                "requiere_medidas": True,
                "configuracion_ui": {"pide_color": True, "pide_apertura": True, "pide_riel": True}
            },
            {
                "codigo": "COR-TRA-VOI",
                "nombre": "Cortina Tradicional - Voile Blanco",
                "tipo_producto": "CORTINA",
                "unidad_medida": "M2",
                "precio_base": "30.00",
                "requiere_medidas": True,
                "configuracion_ui": {"pide_color": True, "pide_frunce": True, "pide_riel": True}
            },
            {
                "codigo": "COR-PRE-OCU",
                "nombre": "Cortina Presilla Oculta - Tusor",
                "tipo_producto": "CORTINA",
                "unidad_medida": "M2",
                "precio_base": "38.50",
                "requiere_medidas": True,
                "configuracion_ui": {"pide_color": True, "pide_barral": True}
            },

            # --- PERSIANAS (M2) ---
            {
                "codigo": "ROL-SCR-01",
                "nombre": "Roller Screen 1% - High Performance",
                "tipo_producto": "PERSIANA",
                "unidad_medida": "M2",
                "precio_base": "55.00",
                "requiere_medidas": True,
                "configuracion_ui": {"pide_color": True, "pide_mando": True, "pide_caida": True}
            },
            {
                "codigo": "ROL-SCR-03",
                "nombre": "Roller Screen 3% - Standard",
                "tipo_producto": "PERSIANA",
                "unidad_medida": "M2",
                "precio_base": "48.00",
                "requiere_medidas": True,
                "configuracion_ui": {"pide_color": True, "pide_mando": True}
            },
            {
                "codigo": "ROL-SCR-05",
                "nombre": "Roller Screen 5% - Visibilidad Alta",
                "tipo_producto": "PERSIANA",
                "unidad_medida": "M2",
                "precio_base": "42.00",
                "requiere_medidas": True,
                "configuracion_ui": {"pide_color": True, "pide_mando": True}
            },
            {
                "codigo": "ROL-BLK-USA",
                "nombre": "Roller Blackout Premium USA 4 Capas",
                "tipo_producto": "PERSIANA",
                "unidad_medida": "M2",
                "precio_base": "35.00",
                "requiere_medidas": True,
                "configuracion_ui": {"pide_color": True, "pide_mando": True, "bloqueo_luz": "100%"}
            },
            {
                "codigo": "ROL-BLK-TEX",
                "nombre": "Roller Blackout Texturado Lino",
                "tipo_producto": "PERSIANA",
                "unidad_medida": "M2",
                "precio_base": "40.00",
                "requiere_medidas": True,
                "configuracion_ui": {"pide_color": True, "pide_mando": True}
            },
            {
                "codigo": "PER-HOR-25",
                "nombre": "Persiana Horizontal Aluminio 25mm",
                "tipo_producto": "PERSIANA",
                "unidad_medida": "M2",
                "precio_base": "28.00",
                "requiere_medidas": True,
                "configuracion_ui": {"pide_color": True, "pide_mando": True}
            },
            {
                "codigo": "PER-HOR-50",
                "nombre": "Persiana Horizontal Madera 50mm",
                "tipo_producto": "PERSIANA",
                "unidad_medida": "M2",
                "precio_base": "85.00",
                "requiere_medidas": True,
                "configuracion_ui": {"pide_color": True, "pide_cinta": True}
            },
            {
                "codigo": "PER-VER-TEL",
                "nombre": "Persiana Vertical Tela 90mm",
                "tipo_producto": "PERSIANA",
                "unidad_medida": "M2",
                "precio_base": "32.00",
                "requiere_medidas": True,
                "configuracion_ui": {"pide_color": True, "pide_apertura": True}
            },
            {
                "codigo": "PAN-ORI-SCR",
                "nombre": "Panel Oriental - Tela Screen",
                "tipo_producto": "PERSIANA",
                "unidad_medida": "M2",
                "precio_base": "60.00",
                "requiere_medidas": True,
                "configuracion_ui": {"pide_paneles": True, "pide_apertura": True}
            },
            {
                "codigo": "ROM-RUS-NAT",
                "nombre": "Romana Tela Rústica",
                "tipo_producto": "PERSIANA",
                "unidad_medida": "M2",
                "precio_base": "58.00",
                "requiere_medidas": True,
                "configuracion_ui": {"pide_color": True, "pide_varillas": True}
            },

            # --- TOLDOS (M2) ---
            {
                "codigo": "TOL-VER-EXT",
                "nombre": "Toldo Vertical Exterior (Zip System)",
                "tipo_producto": "TOLDO",
                "unidad_medida": "M2",
                "precio_base": "120.00",
                "requiere_medidas": True,
                "configuracion_ui": {"pide_lona": True, "motorizado_obligatorio": True}
            },
            {
                "codigo": "TOL-BRA-INV",
                "nombre": "Toldo Brazo Invisible - Lona Acrílica",
                "tipo_producto": "TOLDO",
                "unidad_medida": "M2",
                "precio_base": "95.00",
                "requiere_medidas": True,
                "configuracion_ui": {"pide_lona": True, "pide_proyeccion": True}
            },

            # --- MOTORES (UN) ---
            {
                "codigo": "MOT-TUB-35",
                "nombre": "Motor Tubular 35mm (Hasta 10kg)",
                "tipo_producto": "MOTOR",
                "unidad_medida": "UN",
                "precio_base": "150.00",
                "requiere_medidas": False,
                "configuracion_ui": {"pide_voltaje": "220v", "incluye_control": False}
            },
            {
                "codigo": "MOT-TUB-45",
                "nombre": "Motor Tubular 45mm (Hasta 20kg)",
                "tipo_producto": "MOTOR",
                "unidad_medida": "UN",
                "precio_base": "180.00",
                "requiere_medidas": False,
                "configuracion_ui": {"pide_voltaje": "220v"}
            },
            {
                "codigo": "MOT-WIF-BAT",
                "nombre": "Motor Wifi a Batería (Recargable)",
                "tipo_producto": "MOTOR",
                "unidad_medida": "UN",
                "precio_base": "220.00",
                "requiere_medidas": False,
                "configuracion_ui": {"protocolo": "Zigbee/Wifi", "duracion_bateria": "6 meses"}
            },

            # --- RIELES Y BARRALES (ML) ---
            {
                "codigo": "RIE-EUR-ALU",
                "nombre": "Riel Europeo Aluminio Blanco",
                "tipo_producto": "RIEL",
                "unidad_medida": "ML",
                "precio_base": "15.00",
                "requiere_medidas": True,
                "configuracion_ui": {"pide_largo": True}
            },
            {
                "codigo": "RIE-HOT-REF",
                "nombre": "Riel Hotelero Reforzado",
                "tipo_producto": "RIEL",
                "unidad_medida": "ML",
                "precio_base": "22.00",
                "requiere_medidas": True,
                "configuracion_ui": {"pide_largo": True, "soporte_techo": True}
            },
            {
                "codigo": "BAR-ACE-19",
                "nombre": "Barral Acero Inoxidable 19mm",
                "tipo_producto": "RIEL",
                "unidad_medida": "ML",
                "precio_base": "28.00",
                "requiere_medidas": True,
                "configuracion_ui": {"pide_terminales": True}
            },

            # --- SERVICIOS (UN / GL) ---
            {
                "codigo": "SRV-INS-BAS",
                "nombre": "Instalación Básica (por cortina)",
                "tipo_producto": "SERVICIO",
                "unidad_medida": "UN",
                "precio_base": "25.00",
                "requiere_medidas": False,
                "configuracion_ui": {"tipo_pared": ["Durlock", "Hormigon"]}
            },
            {
                "codigo": "SRV-INS-ALT",
                "nombre": "Plus Instalación Altura (>3.5m)",
                "tipo_producto": "SERVICIO",
                "unidad_medida": "UN",
                "precio_base": "40.00",
                "requiere_medidas": False,
                "configuracion_ui": {"requiere_andamio": True}
            },
            {
                "codigo": "SRV-VIS-TEC",
                "nombre": "Visita Técnica / Rectificación de Medidas",
                "tipo_producto": "SERVICIO",
                "unidad_medida": "GL",
                "precio_base": "30.00",
                "requiere_medidas": False,
                "configuracion_ui": {"zona": "CABA/GBA"}
            },
            {
                "codigo": "SRV-DES-INS",
                "nombre": "Desinstalación Cortina Existente",
                "tipo_producto": "SERVICIO",
                "unidad_medida": "UN",
                "precio_base": "15.00",
                "requiere_medidas": False,
                "configuracion_ui": {}
            },

            # --- OTROS (ACCESORIOS) ---
            {
                "codigo": "ACC-CTL-01",
                "nombre": "Control Remoto 1 Canal",
                "tipo_producto": "OTRO",
                "unidad_medida": "UN",
                "precio_base": "18.00",
                "requiere_medidas": False,
                "configuracion_ui": {"color": "Blanco"}
            },
            {
                "codigo": "ACC-CTL-15",
                "nombre": "Control Remoto 15 Canales",
                "tipo_producto": "OTRO",
                "unidad_medida": "UN",
                "precio_base": "35.00",
                "requiere_medidas": False,
                "configuracion_ui": {"con_pantalla": True}
            },
            {
                "codigo": "ACC-SOP-INT",
                "nombre": "Soporte Intermedio Doble",
                "tipo_producto": "OTRO",
                "unidad_medida": "UN",
                "precio_base": "5.50",
                "requiere_medidas": False,
                "configuracion_ui": {}
            },
            {
                "codigo": "ACC-CAD-MET",
                "nombre": "Cadena Metálica (Repuesto)",
                "tipo_producto": "OTRO",
                "unidad_medida": "ML",
                "precio_base": "3.00",
                "requiere_medidas": True,
                "configuracion_ui": {"material": "Acero"}
            },
        ]

        count_created = 0
        count_updated = 0

        for item in productos_data:
            obj, created = ProductoServicio.objects.update_or_create(
                codigo=item['codigo'],
                defaults={
                    'nombre': item['nombre'],
                    'tipo_producto': item['tipo_producto'],
                    'unidad_medida': item['unidad_medida'],
                    'precio_base': Decimal(item['precio_base']),
                    'requiere_medidas': item['requiere_medidas'],
                    'configuracion_ui': item['configuracion_ui'],
                    'is_active': True
                }
            )
            if created:
                count_created += 1
            else:
                count_updated += 1

        self.stdout.write(self.style.SUCCESS(
            f'✅ Proceso finalizado.\nCreados: {count_created}\nActualizados: {count_updated}'
        ))
