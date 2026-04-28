import type { Cliente } from "../types";

import { useCallback, useMemo, useState } from "react";
import { ClientesService } from "../services/ClientesService";
import { useAuth } from "../auth/useAuth";
import {
  showErrorAlert,
  showSuccessAlert,
  showLoadingAlert,
} from "../components/utils/errorHandler";

import Sidebar from "../layout/Sidebar";
import InfoCliente from "../components/Clientes/ClienteInfo";
import ClientesHeader from "../components/Clientes/ClientesHeader";
import ClientesConEdificioTable from "../components/Clientes/ClientesConEdificioTable";
import ClientesSinEdificioTable from "../components/Clientes/ClientesSinEdificioTable";
import ClientesCreateModal from "../components/Clientes/ClientesCreateModal";
import { useInitialize } from "../hooks/useInitialize";

import "../styles/Clientes.css";

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesSinEdificio, setClientesSinEdificio] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<Cliente | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingCliente, setCreatingCliente] = useState(false);
  const { user } = useAuth();
  const canCreateCliente = user?.rol === "admin";

  const refreshClientes = useCallback(async () => {
    if (!user) return;

    try {
      showLoadingAlert("Cargando clientes...");

      const [clientesConEdificio, sinEdificio] = await Promise.all([
        ClientesService.getClientes(),
        user?.rol === "admin"
          ? ClientesService.getClientesSinEdificio()
          : Promise.resolve([] as Cliente[]),
      ]);

      setClientes(clientesConEdificio);
      setClientesSinEdificio(sinEdificio);

      showSuccessAlert("Información cargada");
    } catch (err) {
      showErrorAlert(err, "Cargar Clientes");
    }
  }, [user]);

  useInitialize(refreshClientes);

  const handleCreateCliente = async (cliente: {
    nombre: string;
    apellidos: string;
    telefono?: string;
    email?: string;
  }) => {
    if (!canCreateCliente) {
      return;
    }

    try {
      setCreatingCliente(true);

      const nuevoCliente = await ClientesService.createCliente({
        nombre: cliente.nombre,
        apellidos: cliente.apellidos,
        ...(cliente.telefono ? { telefono: cliente.telefono } : {}),
        ...(cliente.email ? { email: cliente.email } : {}),
        id_usuario_asignado: null,
      });

      setClientesSinEdificio((prev) => {
        if (prev.some((item) => item.id === nuevoCliente.id)) {
          return prev;
        }
        return [...prev, nuevoCliente];
      });
      setShowCreateForm(false);
      showSuccessAlert("Cliente creado");
    } catch (err) {
      showErrorAlert(err, "Crear Cliente");
    } finally {
      setCreatingCliente(false);
    }
  };

  const handleClienteUpdated = async (clienteActualizado: Cliente) => {
    setClienteSeleccionado((prev) =>
      prev?.id === clienteActualizado.id ? clienteActualizado : prev,
    );

    await refreshClientes();
  };

  const handleClienteDeleted = (clienteId: number) => {
    setClientes((prev) => prev.filter((item) => item.id !== clienteId));
    setClientesSinEdificio((prev) =>
      prev.filter((item) => item.id !== clienteId),
    );
    setClienteSeleccionado(null);
  };

  const clientesConEdificio = useMemo(() => {
    return clientes.filter((cliente) => cliente.id_usuario_asignado !== null);
  }, [clientes]);

  const clientesSinEdificioFiltrados = useMemo(() => {
    const clientesConEdificioIds = new Set(clientesConEdificio.map((cliente) => cliente.id));
    return clientesSinEdificio.filter(
      (cliente) => !clientesConEdificioIds.has(cliente.id),
    );
  }, [clientesSinEdificio, clientesConEdificio]);

  return (
    <div className="clientes-wrapper">
      <Sidebar />
      <main className="clientes-main">
        {clienteSeleccionado ? (
          <>
            <InfoCliente
              cliente={clienteSeleccionado}
              onClienteUpdated={handleClienteUpdated}
              onClienteDeleted={handleClienteDeleted}
              onBack={() => setClienteSeleccionado(null)}
            />
          </>
        ) : (
          <>
            <ClientesHeader
              canCreateCliente={canCreateCliente}
              onCreateClick={() => setShowCreateForm(true)}
            />

            <ClientesConEdificioTable
              clientes={clientesConEdificio}
              onSelectCliente={setClienteSeleccionado}
            />

            <ClientesSinEdificioTable
              isAdmin={user?.rol === "admin"}
              clientesSinEdificio={clientesSinEdificioFiltrados}
              onSelectCliente={setClienteSeleccionado}
            />

            {canCreateCliente && (
              <ClientesCreateModal
                show={showCreateForm}
                loading={creatingCliente}
                onClose={() => setShowCreateForm(false)}
                onSubmit={handleCreateCliente}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Clientes;
