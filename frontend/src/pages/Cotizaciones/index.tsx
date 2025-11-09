import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/DataTable";
import { useAppTranslation } from "@/i18n/hooks"; // ← ESTA IMPORTACIÓN SÍ SE USA

// Define the shape of our data
type Cotizacion = {
  id: string;
  cliente: string;
  fecha: string;
  total: number;
  estado: string;
};

// Mock data based on ROADMAP.md
const cotizacionesData: Cotizacion[] = [
  {
    id: "COT-001",
    cliente: "Cliente Ejemplo 1",
    fecha: "2025-10-22",
    total: 1500.0,
    estado: "Enviada",
  },
  {
    id: "COT-002",
    cliente: "Cliente Ejemplo 2",
    fecha: "2025-10-21",
    total: 250.75,
    estado: "Borrador",
  },
  {
    id: "COT-003",
    cliente: "Cliente Ejemplo 3",
    fecha: "2025-10-20",
    total: 3200.5,
    estado: "Aceptada",
  },
];

const CotizacionesPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Cotizacion[]>([]);
  const { t } = useAppTranslation(['navigation']); // ← AHORA SÍ SE USA

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      setData(cotizacionesData);
      setIsLoading(false);
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, []);

  // Define the columns for the table - DENTRO del componente para usar t()
  const columns: ColumnDef<Cotizacion>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "cliente",
      header: t('navigation:client'), // ← TRADUCIDO
    },
    {
      accessorKey: "fecha", 
      header: t('navigation:date'), // ← TRADUCIDO
    },
    {
      accessorKey: "total",
      header: () => <div className="text-right">{t('navigation:total')}</div>, // ← TRADUCIDO
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("total"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);

        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "estado",
      header: t('navigation:status'), // ← TRADUCIDO
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('navigation:quotes_panel')}</CardTitle> {/* ← TRADUCIDO */}
          <CardDescription>
            {t('navigation:quotes_description')} {/* ← TRADUCIDO */}
          </CardDescription>
        </div>
        <Button>{t('navigation:create_quote')}</Button> {/* ← TRADUCIDO */}
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
};

export default CotizacionesPage;