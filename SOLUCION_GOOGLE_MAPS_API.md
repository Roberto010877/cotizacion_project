# 🔧 Solución: Error REQUEST_DENIED en Google Maps API

Si ves el error **REQUEST_DENIED** al validar direcciones, significa que la API key no tiene los permisos necesarios.

## ✅ Pasos para Resolver

### 1. Verifica que tengas la API Key configurada
```bash
# En frontend/.env.local debe existir:
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

### 2. En Google Cloud Console

#### A) Habilitar Geocoding API
1. Ve a https://console.cloud.google.com/
2. Selecciona tu proyecto
3. Ve a **APIs y Servicios** → **Biblioteca**
4. Busca **Geocoding API**
5. Click en ella y presiona **HABILITAR**

#### B) Verificar que la API Key sea válida
1. Ve a **APIs y Servicios** → **Credenciales**
2. Busca tu API Key
3. Click en ella para ver detalles
4. En **Restricción de API**, asegúrate de que **Geocoding API** esté en la lista
5. Si está vacío, selecciona **Geocoding API** explícitamente

#### C) Configurar restricciones de dominio
1. En la misma página de detalles de la API Key
2. Ve a **Restricciones de dominio (HTTP)** o **Application restrictions**
3. Agrega:
   - `localhost:5173` (desarrollo)
   - `localhost:3000` (si usas puerto diferente)
   - Tu dominio de producción (cuando despliegues)

### 3. Opciones de API Key (elige UNA):

**Opción A: Sin restricciones (SOLO para desarrollo)**
- Ve a **Restricciones de aplicaciones**
- Selecciona **Sin restricciones**
- ⚠️ NO usar en producción

**Opción B: Restricción de dominio HTTP (RECOMENDADO)**
- Ve a **Restricciones de dominio (HTTP)**
- Agrega: `localhost:5173`

### 4. Reinicia el Frontend
```bash
cd frontend
npm run dev
```

### 5. Limpia el cache
1. En DevTools del navegador (F12)
2. Click derecho en el botón recargar
3. Selecciona **Vaciar caché y recargar de todo**

## 🧪 Prueba Rápida

Para verificar que la API key funciona:
```javascript
// En la consola del navegador (F12)
fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=La Paz Bolivia&key=YOUR_API_KEY`)
  .then(r => r.json())
  .then(console.log)
```

Si ves `status: "OK"` → ✅ Todo funciona
Si ves `status: "REQUEST_DENIED"` → ❌ Revisa permisos

## 📋 Checklist

- [ ] API Key configurada en `.env.local`
- [ ] Geocoding API habilitada en Google Cloud
- [ ] API Key tiene acceso a Geocoding API
- [ ] Restricciones de dominio configuradas (`localhost:5173`)
- [ ] Frontend reiniciado
- [ ] Cache del navegador limpiado

## 🆘 Si aún no funciona

1. **Verifica el error exacto** en la consola del navegador (F12)
2. **Comprueba la API Key** - Algunos caracteres pueden copiarse mal
3. **Crea una nueva API Key** - A veces son necesarios permisos específicos
4. **Espera 5-10 minutos** - A veces tarda en propagarse

## 📚 Referencias

- [Google Maps Geocoding API Docs](https://developers.google.com/maps/documentation/geocoding)
- [API Key Setup Guide](https://developers.google.com/maps/documentation/geocoding/get-api-key)
