import { useState, useCallback, memo } from "react";
import "../../styles/components/Edificios/EdificioInfo.css";
import type { Edificio, EdificioInput, Zona } from "../../types";
import { useAuth } from "../../context/useAuth";
import { EdificiosService } from "../../services/EdificiosService";
import { useInitialize } from "../../hooks/useInitialize";
import showStatusAlert from "../utils/StatusAlert";
import EdificioInfoToolbar from "./Info/EdificioInfoToolbar";
import EdificioInfoDetailsCard from "./Info/EdificioInfoDetailsCard";
import EdificioInfoClienteCard from "./Info/EdificioInfoClienteCard";
import EdificioInfoMapCard from "./Info/EdificioInfoMapCard";
import EdificioCreateModal from "./EdificioCreateModal";

interface EdificioInfoProps {
  edificio: Edificio;
  onEdificioUpdated?: (edificioActualizado: Edificio) => void;
  onEdificioDeleted?: (edificioId: number) => void;
  onBack?: () => void;
}

// OPTIMIZACIÓN 1: Funciones estáticas fuera del componente.
// Al no depender de ningún estado de React, declararlas fuera evita 
// que se re-asignen en memoria cada vez que el componente se actualiza.
const notImplementedCreateEdificio = async (_payload: EdificioInput): Promise<Edificio> => {
  void _payload; // Mantiene a ESLint contento
  throw new Error("No implementado");
};

const dummyAppendClientes = async () => {};

// OPTIMIZACIÓN 2: memo() para proteger al componente de re-renders innecesarios
// causados por su componente padre.
const EdificioInfo = memo(({
  edificio,
  onEdificioUpdated,
  onEdificioDeleted,
  onBack,
}: EdificioInfoProps) => {
  const { user } = useAuth();
  const canManageEdificio = user?.rol === "admin";
  
  // Nota: Considera utilizar la variable de carga (loading) en tu UI si la necesitas 
  // para ocultar la sección principal antes de que los datos estén listos.
  const [, setLoading] = useState(true); 
  
  const [edificioInfo, setEdificioInfo] = useState<Edificio>(edificio);
  const [zona, setZona] = useState<Zona | null>(null);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [clientesBloque, setClientesBloque] = useState<
    Array<{ cliente: import("../../types/clientes/Cliente").Cliente; planta: string | null; puerta: string | null }>
  >([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [deletingEdificio, setDeletingEdificio] = useState(false);
  const [updatingEdificio, setUpdatingEdificio] = useState(false);

  useInitialize(async () => {
    try {
      showStatusAlert({
        type: "loading",
        title: "Cargando información del edificio...",
        duration: null,
      });
      
      const detalleCompleto = await EdificiosService.getEdificioDetalle(edificio.id);

      const clientesDelBloqueBuffer = [detalleCompleto, ...(detalleCompleto.bloqueEdificios || [])]
        .flatMap((edif: Edificio) => {
          if (!Array.isArray(edif.clientes) || edif.clientes.length === 0) return [];
          return edif.clientes.map((cliente) => ({
            cliente,
            planta: cliente.planta ?? null,
            puerta: cliente.puerta ?? null,
          }));
        });

      const clientesBloqueUnicos = Array.from(
        new Map(
          clientesDelBloqueBuffer.map((cliente) => [
            `${cliente.cliente.id}|${cliente.planta ?? ""}|${cliente.puerta ?? ""}`,
            cliente,
          ]),
        ).values(),
      );

      setZona(detalleCompleto.zona || null);
      setZonas(detalleCompleto.todasLasZonas || []);
      setClientesBloque(clientesBloqueUnicos);
      setEdificioInfo(detalleCompleto);
      
      showStatusAlert({
        type: "success",
        title: "Información cargada",
        duration: 2000,
      });
    } catch (error) {
      showStatusAlert({
        type: "error",
        title: "Error",
        duration: 4000,
      });
      console.error("Error al cargar detalle del edificio:", error);
    } finally {
      setLoading(false);
    }
  }, [edificio.id]);

  // OPTIMIZACIÓN 3: useCallback para estabilizar todas las funciones que se pasan a los hijos.
  const handleDeleteEdificio = useCallback(async () => {
    if (!canManageEdificio) return;

    setDeletingEdificio(true);
    try {
      await EdificiosService.deleteEdificio(edificioInfo.id);
      setTimeout(() => {
        onEdificioDeleted?.(edificioInfo.id);
      }, 500);
    } catch (error) {
      console.error("Error al eliminar edificio:", error);
    } finally {
      setDeletingEdificio(false);
    }
  }, [canManageEdificio, edificioInfo.id, onEdificioDeleted]);

  const handleUpdateEdificio = useCallback(async (id: number, payload: EdificioInput) => {
    setUpdatingEdificio(true);
    try {
      const edificioActualizado = await EdificiosService.updateEdificio(id, payload);
      setEdificioInfo(edificioActualizado);
      onEdificioUpdated?.(edificioActualizado);
    } finally {
      setUpdatingEdificio(false);
    }
  }, [onEdificioUpdated]);

  const handleOpenEdit = useCallback(() => {
    if (canManageEdificio) setShowEditForm(true);
  }, [canManageEdificio]);

  const handleCloseEdit = useCallback(() => {
    setShowEditForm(false);
  }, []);

  const handleClienteRemoved = useCallback((clienteId: number) => {
    setClientesBloque((prev) => 
      prev.filter((cliente) => cliente.cliente.id !== clienteId)
    );
  }, []);

  return (
    <div className="info-edificio info-edificio-main">
      <EdificioInfoToolbar
        canManageEdificio={canManageEdificio}
        canGoBack={!!onBack}
        deletingEdificio={deletingEdificio}
        onBack={onBack}
        onEditClick={handleOpenEdit}
        onDeleteClick={handleDeleteEdificio}
      />

      <section>
        <EdificioInfoDetailsCard
          edificio={edificioInfo}
          zona={zona}
        />

        <EdificioInfoClienteCard 
          edificioId={edificioInfo.id}
          clientes={clientesBloque}
          canManage={canManageEdificio}
          onClienteRemoved={handleClienteRemoved}
        />

        <EdificioInfoMapCard
          edificio={edificioInfo}
          zona={zona}
          userRole={user?.rol} // Opcional, si GlovalMap lo necesita para restringir la vista
        />

        {showEditForm && (
          <EdificioCreateModal
            show={showEditForm}
            loading={updatingEdificio}
            zonas={zonas}
            edificios={[]}
            onClose={handleCloseEdit}
            onCreateEdificio={notImplementedCreateEdificio}
            onAppendMultipleClientes={dummyAppendClientes}
            edificioAEditar={edificioInfo}
            onUpdateEdificio={handleUpdateEdificio}
          />
        )}
      </section>
    </div>
  );
});

EdificioInfo.displayName = "EdificioInfo";

export default EdificioInfo;