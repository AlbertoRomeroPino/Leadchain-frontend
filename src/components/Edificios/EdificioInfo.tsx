import React, { useEffect, useState } from "react";
import type { Edificio, EdificioInput } from "../../types/edificios/Edificio";
import type { Zona } from "../../types/zonas/Zona";
import { useAuth } from "../../auth/useAuth";
import showStatusAlert from "../StatusAlert";
import { EdificiosService } from "../../services/EdificiosService";
import { ZonaService } from "../../services/ZonaService";
import { clientesService } from "../../services/ClientesService";
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
// TODO: implementar la vista
const EdificioInfo = ({
  edificio,
  onEdificioUpdated,
  onEdificioDeleted,
  onBack,
}: EdificioInfoProps) => {
  const { user } = useAuth();
  const canManageEdificio = user?.rol === "admin";
  const [loading, setLoading] = useState(true);
  const [edificioInfo, setEdificioInfo] = useState<Edificio>(edificio);
  const [zona, setZona] = useState<Zona | null>(null);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [clientesBloque, setClientesBloque] = useState<
    Array<{ cliente: import("../../types/clientes/Cliente").Cliente; planta: string | null; puerta: string | null }>
  >([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [deletingEdificio, setDeletingEdificio] = useState(false);
  const [updatingEdificio, setUpdatingEdificio] = useState(false);
  const alertShownRef = React.useRef(false);
  const prevEdificioRef = React.useRef<Edificio>(edificio);

  useEffect(() => {
    setEdificioInfo(edificio);
  }, [edificio]);

  useEffect(() => {
    let isMounted = true;
    alertShownRef.current = false;

    const loadData = async () => {
      try {
        setLoading(true);
        showStatusAlert({
          type: "loading",
          title: "Cargando información del edificio...",
          description: "Por favor espera",
          duration: 3000,
        });

        const detalle: Edificio = await EdificiosService.getEdificioById(
          edificio.id,
        );
        const zonaDetalle = await ZonaService.getZonaById(detalle.id_zona);
        const todasLasZonas = await ZonaService.getZonas();

        // Detectar si hay otros usuarios en el mismo bloque de pisos (misma dirección, distinto id)
        const allEdificios =
          (await EdificiosService.getEdificios()) as Edificio[];
        const sameBlock = allEdificios.filter(
          (edif: Edificio) =>
            edif.direccion_completa === detalle.direccion_completa &&
            edif.id !== detalle.id,
        );

        // Usar los clientes desde la relación many-to-many con datos pivot
        const clientesDelBloqueBuffer = [detalle, ...sameBlock]
          .flatMap((edif: Edificio) => {
            if (!edif.clientes || edif.clientes.length === 0) return [];
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

        if (!isMounted) return;

        setZona(zonaDetalle);
        setZonas(todasLasZonas);
        setClientesBloque(clientesBloqueUnicos);
        prevEdificioRef.current = detalle;
        setEdificioInfo(detalle);

        if (!alertShownRef.current) {
          alertShownRef.current = true;
          showStatusAlert({
            type: "success",
            title: "Información del edificio cargada",
            duration: 3000,
          });
        }
      } catch (error) {
        if (isMounted) {
          showStatusAlert({
            type: "error",
            title: "Error al cargar edificio",
            description:
              error instanceof Error
                ? error.message
                : "Error al cargar la información del edificio",
            duration: 3000,
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [edificio.id, onEdificioUpdated]);

  const handleDeleteEdificio = async () => {
    if (!canManageEdificio) return;

    showStatusAlert({
      type: "action",
      title: "Eliminar edificio",
      description: `¿Estás seguro de que deseas eliminar el edificio "${edificioInfo.direccion_completa}"? Esta acción no se puede deshacer.`,
      actionLabel: "Eliminar",
      onAction: async () => {
        setDeletingEdificio(true);
        try {
          await EdificiosService.deleteEdificio(edificioInfo.id);
          
          // Mostrar éxito y cerrar
          showStatusAlert({
            type: "success",
            title: "Edificio eliminado",
            description: "El edificio ha sido eliminado correctamente",
            duration: 2000,
          });
          
          // Pequeño delay para que se vea el éxito antes de navegar
          setTimeout(() => {
            onEdificioDeleted?.(edificioInfo.id);
          }, 500);
          
        } catch (error) {
          showStatusAlert({
            type: "error",
            title: "Error al eliminar",
            description:
              error instanceof Error
                ? error.message
                : "Error al eliminar el edificio",
            duration: 3000,
          });
        } finally {
          setDeletingEdificio(false);
        }
      },
    });
  };

  const handleUpdateEdificio = async (id: number, payload: EdificioInput) => {
    setUpdatingEdificio(true);
    try {
      const edificioActualizado = await EdificiosService.updateEdificio(id, payload);
      setEdificioInfo(edificioActualizado);
      onEdificioUpdated?.(edificioActualizado);
      showStatusAlert({
        type: "success",
        title: "Edificio actualizado",
        description: "Los cambios se han guardado correctamente",
        duration: 3000,
      });
    } catch (error) {
      showStatusAlert({
        type: "error",
        title: "Error al actualizar",
        description:
          error instanceof Error
            ? error.message
            : "Error al actualizar el edificio",
        duration: 3000,
      });
      throw error;
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
        {loading ? (
          <div>Cargando información del edificio...</div>
        ) : (
          <>
            <EdificioInfoDetailsCard
              edificio={edificioInfo}
              zona={zona}
            />

            <EdificioInfoClienteCard clientes={clientesBloque} />

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
                onCreateEdificio={async () => {}}
                onAppendToExisting={async () => {}}
                edificioAEditar={edificioInfo}
                onUpdateEdificio={handleUpdateEdificio}
              />
            )}
          </>
        )}
      </section>

    </div>
  );
};

export default EdificioInfo;
