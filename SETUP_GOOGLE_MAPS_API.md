# Configuración de Google Maps API para Validación de Direcciones

## Requerimientos

Para que la funcionalidad de validación y búsqueda de direcciones funcione correctamente, necesitas configurar una **Google Maps API Key**.

## Pasos para Obtener la API Key

### 1. Ir a Google Cloud Console
- Accede a: https://console.cloud.google.com/
- Inicia sesión con tu cuenta de Google

### 2. Crear un Proyecto (si no existe)
- Click en "Seleccionar un proyecto" (arriba a la izquierda)
- Click en "NUEVO PROYECTO"
- Nombre: "Cotidomo" (o el que prefieras)
- Click "CREAR"

### 3. Habilitar Geocoding API
- En la barra de búsqueda, busca: "Geocoding API"
- Click en "Geocoding API"
- Click en "HABILITAR"

### 4. Crear Credenciales (API Key)
- Ve a "Credenciales" en el menú izquierdo
- Click "CREAR CREDENCIALES"
- Selecciona "Clave de API"
- Se creará una clave automáticamente
- **Cópia esta clave** (la necesitarás en el siguiente paso)

### 5. Restringir la Clave (IMPORTANTE por seguridad)
- En la clave creada, click en "Editar"
- Ve a "Restricciones de API"
- Selecciona "Restringir el uso de claves a APIS o SDK de Google específicas"
- Selecciona:
  - ✅ Geocoding API
  - ✅ Maps JavaScript API
- Click "GUARDAR"

### 6. Configurar en Proyecto

#### Para Desarrollo (Frontend)
Crea o actualiza el archivo `.env.local` en la carpeta `frontend/`:

```env
VITE_GOOGLE_MAPS_API_KEY=tu_clave_aqui
```

Ejemplo:
```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyDv8pxMwqUU9ZeQrYsR9wT_2HvR7kqU3fQ
```

#### Para Producción
Configura la variable de entorno en tu servidor/plataforma de despliegue.

## Variables de Entorno Disponibles

```env
# Google Maps API Key para Geocoding y validación de direcciones
VITE_GOOGLE_MAPS_API_KEY=tu_clave_api
```

## Prueba de Funcionamiento

1. Inicia el servidor frontend
2. Abre el formulario de "Crear Cliente"
3. Llena los campos:
   - Nombre: Test
   - Teléfono: +591-2-1234567
   - País: Selecciona un país
   - Dirección: Escribe una dirección (ej: "L a Paz, Bolivia")
4. Click en "🔍 Validar Dirección"
5. Deberías ver:
   - ✅ Dirección limpia y validada
   - ✅ Coordenadas (latitud, longitud)
   - ✅ Botón "🗺️ Ver en Google Maps"

## Solución de Problemas

### Error: "Google Maps API key no configurada"
- Verifica que `.env.local` existe en `frontend/`
- Verifica que `VITE_GOOGLE_MAPS_API_KEY` está correctamente establecida
- Reinicia el servidor de desarrollo

### Error: "No se encontraron resultados para..."
- Verifica la dirección (debe ser válida)
- Verifica el país (debe ser el correcto)
- Intenta con una dirección más específica

### Error: "ZERO_RESULTS"
- La dirección no existe en Google Maps
- Prueba con una dirección diferente
- Verifica el formato: "Calle Número, Ciudad, País"

### Error: "API key restringida"
- Verifica que el dominio está en la lista blanca
- O deshabilita restricciones de dominio temporalmente para desarrollo

## Documentación Oficial

- [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

## Costo

⚠️ **Importante**: El Geocoding API tiene cuota gratuita limitada (~$0.005 por solicitud después de los primeros 40,000 créditos mensuales).

Para monitorear uso:
- Ve a "Información de Facturación" en Google Cloud Console
- Verifica los créditos disponibles
- Configura alertas si es necesario
