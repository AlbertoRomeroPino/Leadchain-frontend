import { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import type { Cliente } from "../types/clientes/Cliente";
import { clientesService } from "../services/ClientesService";
import { useAuth } from "../auth/useAuth";
import showStatusAlert from "../components/StatusAlert";
import "../styles/Clientes.css";
import TablaCliente from "../components/Clientes/TablaCliente";
import InfoCliente from "../components/Clientes/InfoCliente";
import { UserPlus2 } from "lucide-react";
import FormCliente from "../components/Clientes/FormCliente";

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingCliente, setCreatingCliente] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const loadClientes = async () => {
      showStatusAlert({
        type: "loading",
        title: "Cargando clientes...",
      });

      try {
        const data = await clientesService.getClientes();
        setClientes(data);
        showStatusAlert({
          type: "success",
          title: "Clientes cargados correctamente",
          description: `Se han obtenido ${data.length} cliente(s).`,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al cargar clientes";
        showStatusAlert({
          type: "error",
          title: "Error al cargar clientes",
          description: message,
        });
      }
    };

    loadClientes();
  }, [user]);

  const handleCreateCliente = async (cliente: {
    nombre: string;
    apellidos: string;
    telefono?: string;
    email?: string;
  }) => {
    try {
      setCreatingCliente(true);

      const nuevoCliente = await clientesService.createCliente({
        nombre: cliente.nombre,
        apellidos: cliente.apellidos,
        ...(cliente.telefono ? { telefono: cliente.telefono } : {}),
        ...(cliente.email ? { email: cliente.email } : {}),
        id_usuario_asignado: null,
      });

      setClientes((prev) => [...prev, nuevoCliente]);
      setShowCreateForm(false);

      showStatusAlert({
        type: "success",
        title: "Cliente creado",
        description: "El cliente se creó correctamente",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear cliente";
      showStatusAlert({
        type: "error",
        title: "Error al crear cliente",
        description: message,
      });
    } finally {
      setCreatingCliente(false);
    }
  };

  return (
    <div className="clientes-wrapper">
      <Sidebar />
      <main className="clientes-main">
        {clienteSeleccionado ? (
          <>
            <InfoCliente
              cliente={clienteSeleccionado}
              onBack={() => setClienteSeleccionado(null)}
            />
          </>
        ) : (
          <>
            <div className="clientes-header">
              <h1 className="clientes-title">Clientes</h1>
              <button className="clientes-create-button" onClick={() => setShowCreateForm(true)}>
                <UserPlus2 size={16} />
                Crear cliente
              </button>
            </div>

            <div className="clientes-container">
              <table className="clientes-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Apellidos</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <TablaCliente key={cliente.id} cliente={cliente} onSelect={setClienteSeleccionado} />
                  ))}
                </tbody>
              </table>
            </div>

            {showCreateForm && (
              <div className="clientes-modal-overlay" onClick={() => setShowCreateForm(false)}>
                <div className="clientes-modal" onClick={(event) => event.stopPropagation()}>
                  <FormCliente
                    onSubmit={handleCreateCliente}
                    onCancel={() => setShowCreateForm(false)}
                    loading={creatingCliente}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Clientes;
