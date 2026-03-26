import React, { useEffect, useState } from "react";
import type { Edificio } from "../../types/edificios/Edificio";
import type { Zona } from "../../types/zonas/Zona";
import { useAuth } from "../../auth/useAuth";
import showStatusAlert from "../StatusAlert";
import { EdificioService } from "../../services/EdificiosService";
import { ZonaService } from "../../services/ZonaService";
import { clientesService } from "../../services/ClientesService";
import "../../styles/InfoEdificio.css";
import EdificioInfoToolbar from "./Info/EdificioInfoToolbar";
import EdificioInfoDetailsCard from "./Info/EdificioInfoDetailsCard";
import EdificioInfoClienteCard from "./Info/EdificioInfoClienteCard";
import EdificioInfoMapCard from "./Info/EdificioInfoMapCard";

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
  const [clientesBloque, setClientesBloque] = useState<
    Array<{ nombre: string; planta: string | null; puerta: string | null }>
  >([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [deletingEdificio, setDeletingEdificio] = useState(false);
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

        const detalle: Edificio = await EdificioService.getEdificioById(
          edificio.id,
        );
        const zonaDetalle = await ZonaService.getZonaById(detalle.id_zona);

        // Detectar si hay otros usuarios en el mismo bloque de pisos (misma dirección, distinto id)
        const allEdificios =
          (await EdificioService.getEdificios()) as Edificio[];
        const sameBlock = allEdificios.filter(
          (edif: Edificio) =>
            edif.direccion_completa === detalle.direccion_completa &&
            edif.id !== detalle.id,
        );

        const clientesDelBloqueBuffer = await Promise.all(
          [detalle, ...sameBlock].map(async (edif: Edificio) => {
            if (!edif.id_cliente) return null;
            const c = await clientesService.getClienteById(edif.id_cliente);
            if (!c) return null;
            return {
              nombre: `${c.nombre} ${c.apellidos}`,
              planta: edif.planta ?? null,
              puerta: edif.puerta ?? null,
            };
          }),
        );

        const clientesBloqueUnicos = Array.from(
          new Map(
            clientesDelBloqueBuffer
              .filter(
                (
                  c,
                ): c is {
                  nombre: string;
                  planta: string | null;
                  puerta: string | null;
                } => Boolean(c),
              )
              .map((c) => [
                `${c.nombre}|${c.planta ?? ""}|${c.puerta ?? ""}`,
                c,
              ]),
          ).values(),
        );

        if (!isMounted) return;

        setZona(zonaDetalle);
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
    setDeletingEdificio(true);
    try {
      onEdificioDeleted?.(edificioInfo.id);
    } finally {
      setDeletingEdificio(false);
    }
  };

  const handleOpenEdit = () => {
    if (!canManageEdificio) return;
    setShowEditForm(true);
  };

  const handleCloseEdit = () => {
    setShowEditForm(false);
  };

  const clientesLista = clientesBloque
    .map(
      (c) =>
        `${c.nombre} (planta ${c.planta ?? "-"}, puerta ${c.puerta ?? "-"})`,
    )
    .filter((x, i, arr) => arr.indexOf(x) === i);

  return (
    <>
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

            <EdificioInfoClienteCard clientes={clientesLista} />

            <EdificioInfoMapCard
              ubicacion={edificioInfo.ubicacion}
              direccion={edificioInfo.direccion_completa}
              zonaArea={zona?.area ?? null}
            />

            {showEditForm && (
              <div className="edificio-edit-modal">
                <p>Modo edición activado (a implementar).</p>
                <button onClick={handleCloseEdit}>Cerrar</button>
              </div>
            )}
          </>
        )}
      </section>

    </>
  );
};

export default EdificioInfo;
