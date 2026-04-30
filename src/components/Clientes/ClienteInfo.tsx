import { useEffect, useState, useCallback, memo } from "react";
import { ClientesService } from "../../services/ClientesService";
import type { Cliente, ClienteDetalleResponse, Edificio, Visita, Zona } from "../../types";
import "../../styles/InfoCliente.css";
import "../../styles/components/Clientes/ClienteInfo.css";
import { useAuth } from "../../context/useAuth";
import { useInitialize } from "../../hooks/useInitialize";
import { showErrorAlert, showSuccessAlert } from "../utils/errorHandler";
import InfoClienteToolbar from "./Info/InfoClienteToolbar";
import InfoClienteDatosCard from "./Info/InfoClienteDatosCard";
import InfoClienteEdificioCard from "./Info/InfoClienteEdificioCard";
import InfoClienteVisitasCard from "./Info/InfoClienteVisitasCard";
import InfoClienteEditModal from "./Info/InfoClienteEditModal";
import showStatusAlert from "../utils/StatusAlert";

interface InfoClienteProps {
  cliente: Cliente;
  onClienteUpdated?: (clienteActualizado: Cliente) => void;
  onClienteDeleted?: (clienteId: number) => void;
  onBack?: () => void;
}

const InfoCliente = memo(({
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
  const [deletingCliente, setDeletingCliente] = useState(false);
  
  const [clienteInfo, setClienteInfo] = useState<Cliente>(cliente);
  const [edificio, setEdificio] = useState<Edificio | null>(null);
  const [zona, setZona] = useState<Zona | null>(null);
  const [ultimaVisita, setUltimaVisita] = useState<Visita | null>(null);
  const [totalVisitas, setTotalVisitas] = useState(0);

  // Sincronizar prop con estado local
  useEffect(() => {
    setClienteInfo(cliente);
  }, [cliente]);

  useInitialize(
    async () => {
      try {
        setLoading(true);

        const detalle: ClienteDetalleResponse = await ClientesService.getClienteDetalle(cliente.id);

        setEdificio(detalle?.edificio ?? null);
        setZona((detalle?.edificio?.zona as Zona | null | undefined) ?? null);
        setTotalVisitas(detalle?.visitas?.total ?? 0);
        setUltimaVisita((detalle?.visitas?.ultima as Visita | null) ?? null);

      } catch {
        setEdificio(null);
        setZona(null);
        setTotalVisitas(0);
        setUltimaVisita(null);
      } finally {
        setLoading(false);
      }
    },
    // Eliminamos onClienteUpdated de las dependencias para evitar peticiones redundantes
    [cliente.id] 
  );

  // OPTIMIZACIÓN: Calculados al vuelo, sin usar useState
  const ultimoEstado = ultimaVisita 
    ? (ultimaVisita.estado?.etiqueta ?? `Estado #${ultimaVisita.id_estado}`) 
    : "–";

  const ultimoUsuario = ultimaVisita 
    ? (`${ultimaVisita.usuario?.nombre ?? ""} ${ultimaVisita.usuario?.apellidos ?? ""}`.trim() || `Usuario #${ultimaVisita.id_usuario}`) 
    : "–";

  // OPTIMIZACIÓN: useCallback para estabilizar las funciones
  const handleUpdateCliente = useCallback(async (clienteActualizado: {
    nombre: string;
    apellidos: string;
    telefono?: string;
    email?: string;
  }) => {
    if (!canManageCliente) return;

    try {
      setSavingCliente(true);

      const updatedCliente = await ClientesService.updateCliente(clienteInfo.id, {
        nombre: clienteActualizado.nombre,
        apellidos: clienteActualizado.apellidos,
        ...(clienteActualizado.telefono ? { telefono: clienteActualizado.telefono } : {}),
        ...(clienteActualizado.email ? { email: clienteActualizado.email } : {}),
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
  }, [canManageCliente, clienteInfo.id, onClienteUpdated]);

  const handleDeleteCliente = useCallback(() => {
  if (!canManageCliente) return;

  showStatusAlert({
    title: "¿Deseas eliminar este cliente?",
    description: `Esta acción eliminará permanentemente a "${clienteInfo.nombre || 'este cliente'}" y no se puede deshacer.`,
    type: "action",
    actionLabel: "Sí, eliminar",
    onAction: async () => {
      try {
        setDeletingCliente(true);
        await ClientesService.deleteCliente(clienteInfo.id);
        
        // Flujo normal de éxito
        onClienteDeleted?.(clienteInfo.id);
        setShowEditForm(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al eliminar cliente";

        // 1. Si el error dice que ya no existe en BD, lo tratamos como éxito (ya se cumplió el objetivo)
        if (message.includes("No query results for model [App\\Models\\Cliente]")) {
          onClienteDeleted?.(clienteInfo.id);
          setShowEditForm(false);
          return;
        }

        // 2. Errores de integridad (tiene visitas o restricciones de DB)
        if (
          message.toLowerCase().includes("visita") ||
          message.toLowerCase().includes("foreign key") ||
          message.toLowerCase().includes("constraint")
        ) {
          showErrorAlert(err, "No se puede eliminar: El cliente tiene datos vinculados.");
          return;
        }

        // 3. Error genérico
        showErrorAlert(err, "Eliminar");
        console.error("Error al eliminar cliente:", err);
      } finally {
        setDeletingCliente(false);
      }
      showSuccessAlert("Cliente eliminado", 2000);
    },
  });
}, [
  canManageCliente, 
  clienteInfo.id, 
  clienteInfo.nombre, 
  onClienteDeleted, 
  setShowEditForm, 
]);

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
});

InfoCliente.displayName = "InfoCliente";

export default InfoCliente;