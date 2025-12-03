import { useState } from 'react';
import { 
  Ruler, 
  Layers, 
  Settings, 
  FileText,
  ChevronDown,
  ChevronUp,
  Box,
  Home
} from 'lucide-react';
import { useAppTranslation } from '@/i18n/hooks';

interface ItemData {
  id: number;
  ambiente: string;
  modelo: string;
  tecido: string;
  largura: string;
  altura: string;
  quantidade: number;
  posicao: string;
  comando: string;
  acionamento: string;
  obs?: string;
}

interface OrderItemCardProps {
  item: ItemData;
  itemIndex: number;
}

export default function OrderItemCard({ item, itemIndex }: OrderItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { t } = useAppTranslation(['pedidos_servicio', 'common']);

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
      
      {/* ENCABEZADO ESTRUCTURADO CON TÍTULOS */}
      <div className="bg-white px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Bloque Identificador */}
        <div className="flex items-center gap-4 min-w-[120px]">
          <div className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            ITEM {itemIndex + 1}
          </div>
        </div>

        {/* Bloque de Datos Principales (Con Títulos Claros) */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 border-l border-gray-100 md:pl-6">
          
          {/* Columna Ambiente */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-1 flex items-center gap-1">
              <Home size={10} /> {t('pedidos_servicio:ambiente') || 'Ambiente'}
            </span>
            <span className="text-sm font-semibold text-gray-800">{item.ambiente}</span>
          </div>

          {/* Columna Modelo */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-1 flex items-center gap-1">
              <Box size={10} /> {t('pedidos_servicio:modelo') || 'Modelo'}
            </span>
            <span className="text-sm font-semibold text-gray-800">{item.modelo}</span>
          </div>

          {/* Columna Cantidad */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-1">
              {t('pedidos_servicio:cantidad') || 'Cantidad'}
            </span>
            <span className="text-sm font-bold text-blue-600">{item.quantidade} Pzas</span>
          </div>
        </div>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="hidden md:block text-gray-400 hover:text-blue-600 transition-colors p-2"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* CONTENIDO DETALLADO (Grid Horizontal) */}
      {isExpanded && (
        <div className="bg-gray-50/50 p-6 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* SECCIÓN 1: DIMENSIONES (Compacta) */}
            <div className="md:col-span-3">
              <h4 className="text-xs font-bold text-gray-900 uppercase mb-3 flex items-center">
                <Ruler size={14} className="mr-2 text-blue-500" /> {t('pedidos_servicio:dimensiones') || 'Dimensiones'}
              </h4>
              <div className="bg-white p-3 rounded border border-gray-200 flex items-center justify-between shadow-sm">
                <div className="text-center">
                  <span className="block text-[10px] text-gray-400 uppercase">{t('pedidos_servicio:ancho') || 'Ancho'}</span>
                  <span className="block font-mono font-medium text-gray-800">{item.largura}</span>
                </div>
                <span className="text-gray-300 text-xs">X</span>
                <div className="text-center">
                  <span className="block text-[10px] text-gray-400 uppercase">{t('pedidos_servicio:alto') || 'Alto'}</span>
                  <span className="block font-mono font-medium text-gray-800">{item.altura}</span>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: ESPECIFICACIONES TÉCNICAS */}
            <div className="md:col-span-5">
              <h4 className="text-xs font-bold text-gray-900 uppercase mb-3 flex items-center">
                <Layers size={14} className="mr-2 text-purple-500" /> {t('pedidos_servicio:especificaciones') || 'Especificaciones'}
              </h4>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-sm grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] text-gray-400 uppercase mb-0.5">{t('pedidos_servicio:tejido') || 'Tejido'}</span>
                  <span className="text-sm text-gray-700 font-medium">{item.tecido}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 uppercase mb-0.5">{t('pedidos_servicio:posicion') || 'Posición'}</span>
                  <span className="text-sm text-gray-700 font-medium">{item.posicao}</span>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: COMANDO Y ACCIONAMIENTO */}
            <div className="md:col-span-4">
              <h4 className="text-xs font-bold text-gray-900 uppercase mb-3 flex items-center">
                <Settings size={14} className="mr-2 text-orange-500" /> {t('pedidos_servicio:configuracion') || 'Configuración'}
              </h4>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-sm grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] text-gray-400 uppercase mb-0.5">{t('pedidos_servicio:comando') || 'Comando'}</span>
                  <span className="text-sm text-gray-700 font-medium">{item.comando}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 uppercase mb-0.5">{t('pedidos_servicio:sistema') || 'Sistema'}</span>
                  <span className="text-sm text-gray-700 font-medium">{item.acionamento}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Observaciones al pie */}
          {item.obs && (
            <div className="mt-4 flex items-start gap-3 pt-4 border-t border-gray-200/60">
              <FileText size={16} className="text-gray-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 italic leading-relaxed break-all overflow-hidden">
                  <span className="font-semibold text-gray-700 not-italic mr-1">{t('pedidos_servicio:nota') || 'Nota'}:</span>
                  {item.obs}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
