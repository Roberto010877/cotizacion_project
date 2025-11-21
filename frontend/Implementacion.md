# 📋 Solicitud de Implementación: Selector de Idioma Manual

## 🎯 Objetivo
Implementar un selector de idioma manual que permita a los usuarios elegir entre español, inglés y portugués, reemplazando la detección automática actual por una selección consciente del usuario.

## 📁 Archivos a Modificar/Crear

### 1. **Nuevo Hook: `useLanguageSync.ts`**
**Ubicación:** `src/hooks/useLanguageSync.ts`
```typescript
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAppTranslation } from '@/i18n/hooks';
import { updateLanguage } from '@/redux/authSlice';
import { RootState } from '@/redux/store';
import axiosInstance from '@/lib/axios';

export const useLanguageSync = () => {
  const { i18n } = useAppTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const handleLanguageChange = async (lng: string) => {
      dispatch(updateLanguage(lng));
      
      if (user) {
        try {
          await axiosInstance.patch("/api/users/me/language/", { 
            language: lng 
          });
        } catch (error) {
          console.error("Error syncing language with backend:", error);
        }
      }
    };

    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, dispatch, user]);

  useEffect(() => {
    if (user?.language && user.language !== i18n.language) {
      i18n.changeLanguage(user.language);
    }
  }, [user, i18n]);

  return { 
    currentLanguage: i18n.language,
    changeLanguage: i18n.changeLanguage 
  };
};
```

### 2. **Actualizar `authSlice.ts`**
**Ubicación:** `src/redux/authSlice.ts`
```typescript
// AGREGAR al estado inicial y reducers:
interface AuthState {
  user: any | null;
  token: string | null;
  language: string; // <- NUEVO CAMPO
}

const initialState: AuthState = {
  user: null,
  token: null,
  language: 'es', // <- VALOR INICIAL
};

// AGREGAR este reducer:
reducers: {
  // ... reducers existentes ...
  updateLanguage: (state, action: PayloadAction<string>) => {
    state.language = action.payload;
  },
}
```

### 3. **Actualizar `i18n.ts`**
**Ubicación:** `src/i18n/i18n.ts`
```typescript
// MODIFICAR la sección detection:
detection: {
  order: ['localStorage', 'navigator', 'htmlTag'], // localStorage primero
  lookupLocalStorage: 'i18nextLng',
  caches: ['localStorage'],
},
```

### 4. **Componente LanguageSelector Actualizado**
**Ubicación:** `src/components/LanguageSelector.tsx`
```tsx
import React from 'react';
import { useAppTranslation } from '@/i18n/hooks';
import { useLanguageSync } from '@/hooks/useLanguageSync';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LanguageSelector = () => {
  const { i18n } = useAppTranslation();
  const { currentLanguage } = useLanguageSync();

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
  ];

  const handleLanguageChange = async (languageCode: string) => {
    await i18n.changeLanguage(languageCode);
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <span>{currentLang.flag}</span>
          <span className="hidden sm:inline">{currentLang.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center gap-2"
          >
            <span>{language.flag}</span>
            <span>{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
```

### 5. **Integrar en Layout Principal**
**Ubicación:** `src/components/Layout/Header.tsx` (o donde tengas tu header)
```tsx
import LanguageSelector from '@/components/LanguageSelector';

// DENTRO del componente Header, agregar:
<header className="flex justify-between items-center p-4">
  <Logo />
  <div className="flex items-center gap-4">
    <LanguageSelector />
    <UserMenu />
  </div>
</header>
```

### 6. **Integrar en Página de Login**
**Ubicación:** `src/pages/LoginPage.tsx`
```tsx
import LanguageSelector from '@/components/LanguageSelector';

// DENTRO del return del LoginPage, agregar en el CardHeader:
<CardHeader>
  <div className="flex justify-between items-start">
    <div>
      <CardTitle className="text-2xl">{t('login:title')}</CardTitle>
      <CardDescription>{t('login:description')}</CardDescription>
    </div>
    <LanguageSelector /> {/* <- AQUÍ */}
  </div>
</CardHeader>
```

## 🚀 Flujo Esperado

### Antes del Login:
- Usuario ve selector de idioma en la página de login
- Al cambiar idioma, se guarda en localStorage
- Los textos cambian inmediatamente

### Después del Login:
- Si el usuario tiene idioma guardado en su perfil, se carga automáticamente
- Selector visible en el header para cambiar en cualquier momento
- Los cambios se sincronizan con el backend automáticamente

## ✅ Criterios de Aceptación

- [ ] Selector visible en página de login y layout principal
- [ ] Cambio de idioma instantáneo al seleccionar opción
- [ ] Preferencia guardada en localStorage
- [ ] Sincronización automática con backend cuando usuario está autenticado
- [ ] Idioma persistente entre sesiones
- [ ] Banderas y nombres correctos para cada idioma

## 🐛 Solución de Problemas Comunes

**Problema:** El idioma no persiste al recargar
**Solución:** Verificar que `localStorage` esté funcionando en el orden de detección

**Problema:** No se sincroniza con el backend
**Solución:** Revisar que el endpoint `/api/users/me/language/` responda correctamente

**Problema:** Los textos no cambian inmediatamente
**Solución:** Verificar que los componentes estén usando `useAppTranslation` correctamente

## 📞 Soporte
Si hay discrepancias en las claves de traducción, revisar que coincidan entre los archivos JSON y los componentes.

---

**Prioridad:** Alta  
**Tiempo Estimado:** 2-3 horas  
**Dependencias:** Backend con endpoint `/api/users/me/language/` ya implementado