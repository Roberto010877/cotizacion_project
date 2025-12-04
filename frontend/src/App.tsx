import { Link, Routes, Route, Outlet, Navigate, useNavigate } from "react-router-dom";
import { Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// AGREGADO: Importamos 'Package' para el ícono de productos
import { LayoutDashboard, ClipboardList, ShoppingCart, Users, Settings, LogOut, UserCircle, Package } from "lucide-react";

import CotizacionesPage from "@/pages/Cotizaciones";
import ClientesPage from "@/pages/Clientes";
import ProveedoresPage from "@/pages/Proveedores";
import OrdenesCompraPage from "@/pages/OrdenesCompra";
import ProductosPage from "@/pages/ProductosServicios";
import PedidosServicioPage from "@/pages/PedidosServicio";
import MisTareasPage from "@/pages/MisDashboard/MisTareas";
import InstaladoresPage from "@/pages/Instaladores";
import LoginPage from "@/pages/Login";
import SettingsPage from "@/pages/Settings";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import RoleProtectedRoute from "@/components/common/RoleProtectedRoute";
import { logOut, setCredentials } from "@/redux/authSlice";
import LanguageSelector from "@/components/LanguageSelector";
import { useAppTranslation } from "@/i18n/hooks";
import type { RootState } from "./redux/store";
import { useAuthTimeout } from "./hooks/useAuthTimeout";
import { apiClient } from '@/lib/apiClient'; 
import { AdminDashboard, ComercialDashboard, FabricadorDashboard, InstaladorDashboard } from "@/pages/Dashboard";

// Dashboard selector based on user role
const Dashboard = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Determinar el tipo de dashboard según el rol y cargo
  if (!user) {
    return <div>Cargando usuario...</div>;
  }

  // Admin siempre ve el dashboard administrativo
  if (user.role === 'ADMIN') {
    return <AdminDashboard />;
  }

  // Si el usuario tiene manufactura_cargo, mostrar dashboard específico
  if (user.manufactura_cargo === 'MANUFACTURADOR') {
    return <FabricadorDashboard />;
  }

  if (user.manufactura_cargo === 'INSTALADOR') {
    return <InstaladorDashboard />;
  }

  // Por defecto, colaboradores ven su dashboard personal
  return <ComercialDashboard />;
};

// NavLink component - Muestra todos los enlaces, las rutas verifican permisos
const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => {
  return (
    <Link to={to} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
      {children}
    </Link>
  );
};

// UserMenu component
// UserMenu component - Versión con mejor visibilidad
const UserMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const { t } = useAppTranslation(['navigation']);

  const handleLogout = () => {
    dispatch(logOut());
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  // Obtener nombre completo del usuario
  const fullName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user?.first_name || user?.username || 'Usuario';

  // Obtener rol o grupo para mostrar
  const getRoleLabel = (user?: any) => {
    if (!user) return '';
    
    // Si tiene grupos, mostrar el primer grupo
    if (user.groups && user.groups.length > 0) {
      const group = user.groups[0];
      // Capitalizar primera letra
      return group.charAt(0).toUpperCase() + group.slice(1).toLowerCase();
    }
    
    // Fallback al campo role
    if (user.role) {
      switch (user.role) {
        case 'ADMIN':
          return t('navigation:role_admin');
        case 'COMERCIAL':
          return t('navigation:role_comercial');
        default:
          return user.role;
      }
    }
    
    return '';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 h-auto">
          <UserCircle className="h-6 w-6" />
          <div className="hidden sm:flex flex-col items-start text-left space-y-0.5">
            <span className="text-sm font-medium block">{fullName}</span>
            <span className="text-[11px] text-muted-foreground block">
              {getRoleLabel(user)}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1.5">
            <p className="text-sm font-medium">{fullName}</p>
            <p className="text-xs text-muted-foreground">
              {user?.email}
            </p>
            <p className="text-xs text-muted-foreground pt-0.5">
              {getRoleLabel(user)}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('navigation:logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// New Layout component
const DashboardLayout = () => {
  const { t } = useAppTranslation(['navigation']);
  useAuthTimeout(20); // Timeout de inactividad: 20 minutos
  const user = useSelector((state: RootState) => state.auth.user);

  // DEBUG
  console.log('🔍 DashboardLayout - User:', user);
  console.log('🔍 DashboardLayout - User exists:', !!user);


  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 p-4 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('navigation:app_name')}</CardTitle>
            <CardDescription>{t('navigation:app_subtitle')}</CardDescription>
          </CardHeader>
        </Card>
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>{t('navigation:navigation')}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <nav className="flex flex-col gap-2">
              <NavLink to="/"><LayoutDashboard /><span>{t('navigation:dashboard')}</span></NavLink>
              <NavLink to="/mis-tareas"><ClipboardList /><span>{t('pedidos_servicio:my_tasks')}</span></NavLink>
              <NavLink to="/cotizaciones"><ClipboardList /><span>{t('navigation:quotes')}</span></NavLink>
              
              {/* --- AGREGADO: Menú de Productos --- */}
              <NavLink to="/productos"><Package /><span>{t('navigation:products')}</span></NavLink>
              
              <NavLink to="/pedidos-servicio"><ShoppingCart /><span>Pedidos de Servicio</span></NavLink>
              <NavLink to="/ordenes-compra"><ShoppingCart /><span>{t('navigation:purchase_orders')}</span></NavLink>
              <NavLink to="/proveedores"><Users /><span>{t('navigation:suppliers')}</span></NavLink>
              <NavLink to="/clientes"><Users /><span>{t('navigation:clients')}</span></NavLink>
              <NavLink to="/instaladores"><Users /><span>Equipo de Trabajo</span></NavLink>
              <NavLink to="/settings"><Settings /><span>{t('navigation:settings')}</span></NavLink>
            </nav>
          </CardContent>
        </Card>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-4">
          <div></div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <UserMenu />
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 p-4"><Outlet /></main>
      </div>
    </div>
  );
};

/**
 * Hook para manejar la validación inicial de la autenticación al cargar la app.
 */
const useInitialAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken && !token) {
        try {
          const userResponse = await apiClient.get("users/me/");
          dispatch(setCredentials({ user: userResponse.data, token: storedToken }));
        } catch (error) {
          console.error("Token validation failed, logging out.", error);
          dispatch(logOut());
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setIsLoading(false);
    };

    validateToken();
  }, [dispatch, token]);

  return { isLoading };
};


function App() {
  const { isLoading } = useInitialAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="mis-tareas" element={<RoleProtectedRoute route="/mis-tareas"><MisTareasPage /></RoleProtectedRoute>} />
          <Route path="cotizaciones" element={<RoleProtectedRoute route="/cotizaciones"><CotizacionesPage /></RoleProtectedRoute>} />
          <Route path="ordenes-compra" element={<RoleProtectedRoute route="/ordenes-compra"><OrdenesCompraPage /></RoleProtectedRoute>} />
          <Route path="proveedores" element={<RoleProtectedRoute route="/proveedores"><ProveedoresPage /></RoleProtectedRoute>} />
          <Route path="clientes" element={<RoleProtectedRoute route="/clientes"><ClientesPage /></RoleProtectedRoute>} />
          
          {/* Ruta de Productos ya estaba definida, el menú es lo que habilitamos arriba */}
          <Route path="productos" element={<RoleProtectedRoute route="/productos"><ProductosPage /></RoleProtectedRoute>} />
          
          <Route path="pedidos-servicio" element={<RoleProtectedRoute route="/pedidos-servicio"><PedidosServicioPage /></RoleProtectedRoute>} />
          <Route path="instaladores" element={<RoleProtectedRoute route="/instaladores"><InstaladoresPage /></RoleProtectedRoute>} />
          <Route path="settings" element={<RoleProtectedRoute route="/settings"><SettingsPage /></RoleProtectedRoute>} />
        </Route>
        {/* Optional: Redirect any other path to login or dashboard */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App;