import { useState } from "react";
import "../../styles/components/Edificios/EdificioInfo.css";
import type { Edificio, EdificioInput, Zona} from "../../types";
import { useAuth } from "../../auth/useAuth";
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
const EdificioInfo = ({
  edificio,
  onEdificioUpdated,
  onEdificioDeleted,
  onBack,
}: EdificioInfoProps) => {
  const { user } = useAuth();
  const canManageEdificio = user?.rol === "admin";
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
      // Una sola petición trae todo: edificio, zona, bloque de edificios y todas las zonas
      const detalleCompleto = await EdificiosService.getEdificioDetalle(
        edificio.id,
      );

      // Usar los clientes desde la relación many-to-many con datos pivot
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
          clientesDelBloqueBuffer
            .map((c) => [
              `${c.cliente.id}|${c.planta ?? ""}|${c.puerta ?? ""}`,
              c,
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

  const handleDeleteEdificio = async () => {
    if (!canManageEdificio) return;

    setDeletingEdificio(true);
    try {
      await EdificiosService.deleteEdificio(edificioInfo.id);
      // Pequeño delay para que se vea el éxito antes de navegar
      setTimeout(() => {
        onEdificioDeleted?.(edificioInfo.id);
      }, 500);
    } catch (error) {
      console.error("Error al eliminar edificio:", error);
    } finally {
      setDeletingEdificio(false);
    }
  };

  const handleUpdateEdificio = async (id: number, payload: EdificioInput) => {
    setUpdatingEdificio(true);
    try {
      const edificioActualizado = await EdificiosService.updateEdificio(id, payload);
      setEdificioInfo(edificioActualizado);
      onEdificioUpdated?.(edificioActualizado);
    } finally {
      setUpdatingEdificio(false);
    }
  };

  const handleOpenEdit = () => {
    if (!canManageEdificio) return;
    setShowEditForm(true);
  };

  const handleCloseEdit = () => {
    setShowEditForm(false);
  };

  const notImplementedCreateEdificio = async (_payload: EdificioInput): Promise<Edificio> => {
    void _payload;
    throw new Error("No implementado");
  };

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
          <>
            <EdificioInfoDetailsCard
              edificio={edificioInfo}
              zona={zona}
            />

            <EdificioInfoClienteCard 
              edificioId={edificioInfo.id}
              clientes={clientesBloque}
              canManage={canManageEdificio}
              onClienteRemoved={(clienteId) => {
                setClientesBloque((prev) => 
                  prev.filter((c) => c.cliente.id !== clienteId)
                );
              }}
            />

            <EdificioInfoMapCard
              ubicacion={edificioInfo.ubicacion}
              direccion={edificioInfo.direccion_completa}
              zonaArea={zona?.area ?? null}
            />

            {showEditForm && (
              <EdificioCreateModal
                show={showEditForm}
                loading={updatingEdificio}
                zonas={zonas}
                edificios={[]}
                onClose={handleCloseEdit}
                onCreateEdificio={notImplementedCreateEdificio}
                onAppendMultipleClientes={async () => {}}
                edificioAEditar={edificioInfo}
                onUpdateEdificio={handleUpdateEdificio}
              />
            )}
          </>
      </section>

    </div>
  );
}

export default EdificioInfo;
