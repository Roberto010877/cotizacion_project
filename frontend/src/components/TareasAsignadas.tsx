import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import axiosInstance from '@/lib/axios';

interface TareasAsignadasProps {
  // Placeholder for future props
}

interface PedidoServicio {
  id: number;
  numero_pedido: string;
  estado: string;
  valor_total: string;
  fecha_fin?: string;
  cliente?: {
    nombre: string;
  };
  descripcion?: string;
}

const TareasAsignadas: React.FC<TareasAsignadasProps> = () => {
  const [pedidos, setPedidos] = useState<PedidoServicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/v1/pedidos-servicio/');
        setPedidos(response.data.results || response.data);
      } catch (err) {
        console.error('Error fetching service orders:', err);
        setError('No se pudieron cargar los pedidos');
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  const getEstadoBadge = (estado: string) => {
    const estadoColors: Record<string, string> = {
      'PENDIENTE': 'bg-yellow-200 text-yellow-800',
      'EN_PROGRESO': 'bg-blue-200 text-blue-800',
      'FABRICACION': 'bg-orange-200 text-orange-800',
      'INSTALACION': 'bg-purple-200 text-purple-800',
      'COMPLETADO': 'bg-green-200 text-green-800',
      'CANCELADO': 'bg-red-200 text-red-800',
    };
    return estadoColors[estado] || 'bg-gray-200 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tareas Asignadas</CardTitle>
        <CardDescription>
          Tus pedidos de servicio pendientes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading && <p className="text-gray-600 text-sm">Cargando...</p>}
          
          {error && <p className="text-red-600 text-sm">{error}</p>}
          
          {!loading && pedidos.length === 0 && (
            <p className="text-gray-600 text-sm">No hay pedidos pendientes</p>
          )}
          
          {!loading && pedidos.length > 0 && (
            <div className="space-y-3">
              {pedidos.map((pedido) => (
                <div
                  key={pedido.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {pedido.numero_pedido}
                      {pedido.cliente && ` - ${pedido.cliente.nombre}`}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {pedido.descripcion}
                    </p>
                    <p className="text-xs text-gray-500">
                      Valor: ${pedido.valor_total}
                    </p>
                    {pedido.fecha_fin && (
                      <p className="text-xs text-gray-500">
                        Entrega: {new Date(pedido.fecha_fin).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(pedido.estado)}`}>
                    {pedido.estado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TareasAsignadas;
