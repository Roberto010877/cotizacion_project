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
import { LayoutDashboard, ClipboardList, ShoppingCart, Users, Settings, LogOut, UserCircle } from "lucide-react";

import CotizacionesPage from "@/pages/Cotizaciones";
import ClientesPage from "@/pages/Clientes";
import ProveedoresPage from "@/pages/Proveedores";
import OrdenesCompraPage from "@/pages/OrdenesCompra";
import ProductosPage from "@/pages/Productos";
import PedidosServicioPage from "@/pages/PedidosServicio";
import LoginPage from "@/pages/Login";
import SettingsPage from "@/pages/Settings";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { logOut, setCredentials } from "@/redux/authSlice";
import LanguageSelector from "@/components/LanguageSelector";
import { useAppTranslation } from "@/i18n/hooks";
import type { RootState } from "./redux/store";
import { useAuthTimeout } from "./hooks/useAuthTimeout";
import axiosInstance from "./lib/axios.new";

// Placeholder components for pages
const Dashboard = () => {
  const { t } = useAppTranslation(['navigation']);
  const [pedidosPendientes, setPedidosPendientes] = useState<any[]>([]);
  const [pedidosEnFabricacion, setPedidosEnFabricacion] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        // Obtener pedidos pendientes de instalar
        const respPendientes = await axiosInstance.get('/api/v1/pedidos-servicio/?estado=LISTO_INSTALAR&page_size=5');
        setPedidosPendientes(respPendientes.data.results || []);

        // Obtener pedidos en fabricación
        const respFabricacion = await axiosInstance.get('/api/v1/pedidos-servicio/?estado=EN_FABRICACION&page_size=5');
        setPedidosEnFabricacion(respFabricacion.data.results || []);
      } catch (error) {
        console.error('Error cargando pedidos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('navigation:dashboard')}</CardTitle>
          <CardDescription>{t('navigation:dashboard_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Panel Fabricación */}
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-2xl">⚙️</span>
                  Fabricación
                </CardTitle>
                <CardDescription>Pedidos en proceso de fabricación</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse space-y-2">
                    {[1, 2].map(i => <div key={i} className="h-12 bg-gray-200 rounded"></div>)}
                  </div>
                ) : pedidosEnFabricacion.length > 0 ? (
                  <div className="space-y-3">
                    {pedidosEnFabricacion.map((pedido: any) => (
                      <div key={pedido.id} className="border rounded p-3 bg-orange-50">
                        <div className="font-semibold text-sm">{pedido.numero_pedido}</div>
                        <div className="text-xs text-gray-600">{pedido.cliente_nombre}</div>
                        <div className="text-xs mt-1 text-orange-600 font-medium">
                          {pedido.total_items || 0} items
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">No hay pedidos en fabricación</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Panel Instalación */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-2xl">🔧</span>
                  Instalación
                </CardTitle>
                <CardDescription>Pedidos listos para instalar</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse space-y-2">
                    {[1, 2].map(i => <div key={i} className="h-12 bg-gray-200 rounded"></div>)}
                  </div>
                ) : pedidosPendientes.length > 0 ? (
                  <div className="space-y-3">
                    {pedidosPendientes.map((pedido: any) => (
                      <div key={pedido.id} className="border rounded p-3 bg-green-50">
                        <div className="font-semibold text-sm">{pedido.numero_pedido}</div>
                        <div className="text-xs text-gray-600">{pedido.cliente_nombre}</div>
                        <div className="text-xs mt-1 text-green-600 font-medium">
                          {pedido.total_items || 0} items
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">No hay pedidos listos para instalar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// NavLink component to avoid repeating classes
const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => (
  <Link to={to} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
    {children}
  </Link>
);

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 p-2 rounded-full">
          <UserCircle className="h-6 w-6" />
          <span className="text-sm hidden sm:block">{user?.first_name || 'Usuario'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.first_name || 'Usuario'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
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
  useAuthTimeout(5); // Inicia el temporizador de inactividad (15 minutos)
  const user = useSelector((state: RootState) => state.auth.user); // ← Agregar esta línea

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
              <NavLink to="/cotizaciones"><ClipboardList /><span>{t('navigation:quotes')}</span></NavLink>
              <NavLink to="/pedidos-servicio"><ShoppingCart /><span>Pedidos de Servicio</span></NavLink>
              <NavLink to="/ordenes-compra"><ShoppingCart /><span>{t('navigation:purchase_orders')}</span></NavLink>
              <NavLink to="/proveedores"><Users /><span>{t('navigation:suppliers')}</span></NavLink>
              <NavLink to="/clientes"><Users /><span>{t('navigation:clients')}</span></NavLink>
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
          const userResponse = await axiosInstance.get("/api/users/me/");
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
          <Route path="cotizaciones" element={<CotizacionesPage />} />
          <Route path="ordenes-compra" element={<OrdenesCompraPage />} />
          <Route path="proveedores" element={<ProveedoresPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="productos" element={<ProductosPage />} />
          <Route path="pedidos-servicio" element={<PedidosServicioPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        {/* Optional: Redirect any other path to login or dashboard */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App;