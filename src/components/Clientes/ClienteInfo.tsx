import { useEffect, useState, useRef } from "react";
import showStatusAlert from "../StatusAlert";
import { clientesService } from "../../services/ClientesService";
import type { Cliente } from "../../types/clientes/Cliente";
import type { ClienteDetalleResponse } from "../../types/clientes/ClienteDetalle";
import type { Edificio } from "../../types/edificios/Edificio";
import type { Visita } from "../../types/visitas/Visita";
import "../../styles/InfoCliente.css";
import type { Zona } from "../../types/zonas/Zona";
import { useAuth } from "../../auth/useAuth";
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

  useEffect(() => {
    alertShownRef.current = false;
    const loadData = async () => {
      try {
        setLoading(true);
        showStatusAlert({
          type: "loading",
          title: "Cargando información del cliente...",
          description: "Por favor espera",
          duration: 3000,
        });

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
          showStatusAlert({
            type: "success",
            title: "Información cargada",
            duration: 1000,
          });
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
          showStatusAlert({
            type: "error",
            title: "Error al cargar",
            description: "No se pudieron cargar los datos del cliente",
            duration: 3000,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [cliente.id]);

  const handleUpdateCliente = async (clienteActualizado: {
    nombre: string;
    apellidos: string;
    telefono?: string;
    email?: string;
  }) => {
    if (!canManageCliente) {
      showStatusAlert({
        type: "error",
        title: "No autorizado",
        description: "No tienes permisos para actualizar clientes",
      });
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

      showStatusAlert({
        type: "success",
        title: "Cliente actualizado",
        description: "Los datos se guardaron correctamente",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al actualizar cliente";
      showStatusAlert({
        type: "error",
        title: "Error al actualizar cliente",
        description: message,
      });
    } finally {
      setSavingCliente(false);
    }
  };

  const handleDeleteCliente = async () => {
    if (!canManageCliente) {
      showStatusAlert({
        type: "error",
        title: "No autorizado",
        description: "No tienes permisos para eliminar clientes",
      });
      return;
    }

    try {
      setDeletingCliente(true);

      await clientesService.deleteCliente(clienteInfo.id);

      onClienteDeleted?.(clienteInfo.id);
      setShowEditForm(false);

      showStatusAlert({
        type: "success",
        title: "Cliente eliminado",
        description: "El cliente se eliminó correctamente",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al eliminar cliente";

      if (
        message.includes("No query results for model [App\\Models\\Cliente]")
      ) {
        onClienteDeleted?.(clienteInfo.id);
        setShowEditForm(false);
        showStatusAlert({
          type: "success",
          title: "Cliente ya eliminado",
          description: "El cliente ya no existía en base de datos",
        });
        return;
      }

      if (
        message.toLowerCase().includes("visita") ||
        message.toLowerCase().includes("foreign key") ||
        message.toLowerCase().includes("constraint")
      ) {
        showStatusAlert({
          type: "error",
          title: "No se puede eliminar",
          description: "Este cliente tiene visitas asociadas. Debes eliminar las visitas primero antes de eliminar el cliente.",
        });
        return;
      }

      showStatusAlert({
        type: "error",
        title: "Error al eliminar cliente",
        description: "No se pudo eliminar el cliente. Por favor intenta más tarde.",
      });
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
