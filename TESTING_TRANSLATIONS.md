# 🌐 Guía de Prueba - Sistema de Traducciones

## Cambios Realizados

### 1. ✅ Archivos Creados
- `frontend/src/i18n/locales/en/clientes.json` - Traducciones al inglés
- `frontend/src/i18n/locales/pt/clientes.json` - Traducciones al portugués

### 2. ✅ Archivos Actualizados
- `frontend/src/i18n/i18n.ts` - Importa nuevas traducciones
- `frontend/src/i18n/hooks.ts` - Corrige importación de tipos
- `frontend/src/i18n/locales/en/common.json` - Agrega "edit" y "delete"
- `frontend/src/i18n/locales/pt/common.json` - Agrega "edit" y "deletar"

## Cómo Probar

### Paso 1: Reinicia el Frontend
```bash
cd frontend
npm run dev
```

### Paso 2: Navega a Clientes
- URL: http://localhost:5173/clientes
- Deberías ver la tabla con encabezados en español

### Paso 3: Cambia el Idioma
1. Busca el selector de idioma en la UI
2. Cambia a **English** - La tabla completa debe traducirse:
   - "Client Management" → tabla
   - "Name", "Email", "Phone", etc.
   - Botones "Edit" y "Delete"
   - Placeholders de filtros

3. Cambia a **Português** - Igual que arriba pero en portugués:
   - "Gestão de Clientes"
   - "Nome", "Email", "Telefone", etc.
   - "Editar" e "Deletar"

### Paso 4: Verifica Funcionalidad
- [ ] Los headers de la tabla se traducen
- [ ] Los placeholders de filtros se traducen
- [ ] Los botones de acciones se traducen
- [ ] El cambio es reactivo (sin recargar página)
- [ ] Los estilos se mantienen

## Archivos de Traducción

```
frontend/src/i18n/locales/
├── es/
│   ├── clientes.json ✅
│   ├── common.json ✅
│   ├── dashboard.json
│   ├── login.json
│   └── navigation.json
├── en/
│   ├── clientes.json ✅ (NUEVO)
│   ├── common.json ✅ (ACTUALIZADO)
│   ├── dashboard.json
│   ├── login.json
│   └── navigation.json
└── pt/
    ├── clientes.json ✅ (NUEVO)
    ├── common.json ✅ (ACTUALIZADO)
    ├── dashboard.json
    ├── login.json
    └── navigation.json
```

## Strings Traducidos

### Namespace: `clientes`
- client_management
- filter_by_name
- filter_by_country
- filter_by_client_type
- create_client
- table_header_name
- table_header_document
- table_header_country
- table_header_email
- table_header_phone
- table_header_client_type
- table_header_actions
- no_clients_found

### Namespace: `common`
- edit (Editar / Editar)
- delete (Delete / Deletar)
- error_loading_data

## En Caso de Error

Si ves errores de traducción:

1. Abre la consola del navegador (F12)
2. Revisa los logs de i18n
3. Verifica que el idioma está guardado en localStorage:
   ```js
   localStorage.getItem("i18nextLng")
   ```

4. Limpia el caché y recarga:
   ```js
   localStorage.removeItem("i18nextLng")
   location.reload()
   ```
