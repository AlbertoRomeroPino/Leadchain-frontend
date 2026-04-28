import { useEffect, useState, useRef } from "react";
import { clientesService } from "../../services/ClientesService";
import type { Cliente, ClienteDetalleResponse, Edificio, Visita, Zona } from "../../types";
import "../../styles/InfoCliente.css";
import "../../styles/components/Clientes/ClienteInfo.css";
import { useAuth } from "../../auth/useAuth";
import { useInitialize } from "../../hooks/useInitialize";
import { showErrorAlert } from "../utils/errorHandler";
import InfoClienteToolbar from "./Info/InfoClienteToolbar";
import InfoClienteDatosCard from "./Info/InfoClienteDatosCard";
import InfoClienteEdificioCard from "./Info/InfoClienteEdificioCard";
import InfoClienteVisitasCard from "./Info/InfoClienteVisitasCard";
import InfoClienteEditModal from "./Info/InfoClienteEditModal";

interface InfoClienteProps {
  cliente: Cliente;
  onClienteUpdated?: (clienteActualizado: Cliente) => void;
  onClienteDeleted?: (clienteId: number) => void;
  onBack?: () => void;
}

const InfoCliente = ({
  cliente,
  onClienteUpdated,
  onClienteDeleted,
  onBack,
}: InfoClienteProps) => {
  const { user } = useAuth();
  const canManageCliente = user?.rol === "admin";
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [savingCliente, setSavingCliente] = useState(false);
  const [clienteInfo, setClienteInfo] = useState<Cliente>(cliente);
  const [edificio, setEdificio] = useState<Edificio | null>(null);
  const [zona, setZona] = useState<Zona | null>(null);
  const [ultimaVisita, setUltimaVisita] = useState<Visita | null>(null);
  const [totalVisitas, setTotalVisitas] = useState(0);
  const [ultimoEstado, setUltimoEstado] = useState("–");
  const [ultimoUsuario, setUltimoUsuario] = useState("–");
  const alertShownRef = useRef(false);
  const [deletingCliente, setDeletingCliente] = useState(false);

  useEffect(() => {
    setClienteInfo(cliente);
  }, [cliente]);

  useInitialize(
    async () => {
      try {
        setLoading(true);

        const detalle: ClienteDetalleResponse =
          await clientesService.getClienteDetalle(cliente.id);

        const edificioDetalle = detalle?.edificio ?? null;
        const zonaDetalle =
          (edificioDetalle?.zona as Zona | null | undefined) ?? null;
        const total = detalle?.visitas?.total ?? 0;
        const ultima = (detalle?.visitas?.ultima as Visita | null) ?? null;

        setEdificio(edificioDetalle);
        setZona(zonaDetalle);
        setTotalVisitas(total);
        setUltimaVisita(ultima);

        if (!ultima) {
          setUltimoEstado("–");
          setUltimoUsuario("–");
        } else {
          const nombreUsuario =
            `${ultima.usuario?.nombre ?? ""} ${ultima.usuario?.apellidos ?? ""}`.trim();
          setUltimoEstado(
            ultima.estado?.etiqueta ?? `Estado #${ultima.id_estado}`,
          );
          setUltimoUsuario(nombreUsuario || `Usuario #${ultima.id_usuario}`);
        }

        if (!alertShownRef.current) {
          alertShownRef.current = true;
        }
      } catch {
        setEdificio(null);
        setZona(null);
        setTotalVisitas(0);
        setUltimaVisita(null);
        setUltimoEstado("–");
        setUltimoUsuario("–");
        if (!alertShownRef.current) {
          alertShownRef.current = true;
        }
      } finally {
        setLoading(false);
      }
    },
    [cliente.id, onClienteUpdated]
  );

  const handleUpdateCliente = async (clienteActualizado: {
    nombre: string;
    apellidos: string;
    telefono?: string;
    email?: string;
  }) => {
    if (!canManageCliente) {
      return;
    }

    try {
      setSavingCliente(true);

      const updatedCliente = await clientesService.updateCliente(cliente.id, {
        nombre: clienteActualizado.nombre,
        apellidos: clienteActualizado.apellidos,
        ...(clienteActualizado.telefono
          ? { telefono: clienteActualizado.telefono }
          : {}),
        ...(clienteActualizado.email
          ? { email: clienteActualizado.email }
          : {}),
        id_usuario_asignado: null,
      });

      setClienteInfo(updatedCliente);
      onClienteUpdated?.(updatedCliente);
      setShowEditForm(false);
    } catch (err) {
      showErrorAlert(err, "Actualizar");
    } finally {
      setSavingCliente(false);
    }
  };

  const handleDeleteCliente = async () => {
    if (!canManageCliente) {
      return;
    }

    try {
      setDeletingCliente(true);

      await clientesService.deleteCliente(clienteInfo.id);

      onClienteDeleted?.(clienteInfo.id);
      setShowEditForm(false);
    } catch (err) {
      showErrorAlert(err, "Eliminar");
      const message =
        err instanceof Error ? err.message : "Error al eliminar cliente";

      if (
        message.includes("No query results for model [App\\Models\\Cliente]")
      ) {
        onClienteDeleted?.(clienteInfo.id);
        setShowEditForm(false);

        return;
      }

      if (
        message.toLowerCase().includes("visita") ||
        message.toLowerCase().includes("foreign key") ||
        message.toLowerCase().includes("constraint")
      ) {
        return;
      }
    } finally {
      setDeletingCliente(false);
    }
  };

  return (
    <>
      <InfoClienteToolbar
        canManageCliente={canManageCliente}
        canGoBack={Boolean(onBack)}
        deletingCliente={deletingCliente}
        onBack={onBack}
        onEditClick={() => setShowEditForm(true)}
        onDeleteClick={handleDeleteCliente}
      />

      <section className="info-cliente">
        {loading ? (
          <div className="info-cliente-loading">
            Cargando información del cliente...
          </div>
        ) : (
          <>
            <div className="info-cliente-top">
              <InfoClienteDatosCard cliente={clienteInfo} />
              <InfoClienteEdificioCard edificio={edificio} zona={zona} />
            </div>

            <InfoClienteVisitasCard
              totalVisitas={totalVisitas}
              ultimaVisita={ultimaVisita}
              ultimoEstado={ultimoEstado}
              ultimoUsuario={ultimoUsuario}
            />
          </>
        )}
      </section>

      {canManageCliente && (
        <InfoClienteEditModal
          show={showEditForm}
          loading={savingCliente}
          cliente={clienteInfo}
          onClose={() => setShowEditForm(false)}
          onSubmit={handleUpdateCliente}
        />
      )}
    </>
  );
};

export default InfoCliente;
