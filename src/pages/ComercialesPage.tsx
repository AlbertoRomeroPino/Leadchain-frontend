import { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import { UserService } from "../services/User";
import { clientesService } from "../services/ClientesService";
import type { User, UserVisitas } from "../types/users/User";
import { authStorage } from "../auth/authStorage";
import type { Visita } from "../types/visitas/Visita";
import { VisitasService } from "../services/VisitasService";
import type { Cliente } from "../types/clientes/Cliente";
import type { Zona } from "../types/zonas/Zona";
import "../styles/ComercialesPage.css";
import { Trash, UserPlus2, UserRoundCog } from "lucide-react";
import ComercialesForm from "../components/Comerciales/ComercialesForm";
import { ZonaService } from "../services/ZonaService";
import showStatusAlert from "../components/StatusAlert";

const Comerciales = () => {
  const [comerciales, setComerciales] = useState<UserVisitas[]>([]);
  const [expandedComercialId, setExpandedComercialId] = useState<number | null>(null);
  const [selectedComercialIds, setSelectedComercialIds] = useState<Set<number>>(new Set());
  const [comercialAEditar, setComercialAEditar] = useState<User | null>(null);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleComercialVisitas = (id: number) => {
    setExpandedComercialId((prev) => (prev === id ? null : id));
  };

  const toggleSelectComercial = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setSelectedComercialIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDeleteComerciales = async () => {
    if (selectedComercialIds.size === 0) {
      showStatusAlert({
        type: "error",
        title: "No hay seleccionados",
        description: "Selecciona al menos un comercial para eliminar",
      });
      return;
    }

    try {
      setIsLoading(true);
      await Promise.all(
        Array.from(selectedComercialIds).map((id) => UserService.deleteUser(id))
      );

      setComerciales((prev) =>
        prev.filter((c) => !selectedComercialIds.has(c.id))
      );
      setSelectedComercialIds(new Set());

      showStatusAlert({
        type: "success",
        title: "Comerciales eliminados",
        description: `Se eliminaron ${selectedComercialIds.size} comercial(es) correctamente`,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error desconocido";
      showStatusAlert({
        type: "error",
        title: "Error al eliminar comerciales",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadComerciales = async () => {
      try {
        // Usuario logueado (localStorage JWT + user)
        const session = authStorage.get();
        const currentUserId = session?.user?.id;

        if (!currentUserId) {
          throw new Error("Usuario no autenticado");
        }

        const [usuarios, visitas, clientes, zonasData] = await Promise.all([
          UserService.getUsers(),
          VisitasService.getVisitas(),
          clientesService.getClientes(),
          ZonaService.getZonas(),
        ]);

        const clienteById = new Map<number, Cliente>(
          clientes.map((cliente) => [cliente.id, cliente]),
        );

        setZonas(zonasData);

        const myComerciales = usuarios
          .filter(
            (usuario: User) =>
              usuario.rol === "comercial" &&
              usuario.id_responsable === currentUserId,
          )
          .map(
            (usuario: User): UserVisitas => ({
              ...usuario,
              visitas: visitas
                .filter((visita: Visita) => visita.id_usuario === usuario.id)
                .map((visita: Visita) => ({
                  ...visita,
                  cliente: clienteById.get(visita.id_cliente) ?? null,
                })),

            }),
          );

        setComerciales(myComerciales);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error cargando comerciales",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadComerciales();
  }, []);

  const handleCreateComercialSuccess = (comercial: User) => {
    // Cerrar modal
    setShowCreateForm(false);
    setComercialAEditar(null);

    if (comercialAEditar) {
      // Modo edición: actualizar el comercial en la lista
      setComerciales((prev) =>
        prev.map((c) =>
          c.id === comercial.id
            ? { ...c, ...comercial }
            : c
        )
      );
    } else {
      // Modo creación: agregar el nuevo comercial a la lista
      const nuevoComercialConVisitas: UserVisitas = {
        ...comercial,
        visitas: [],
      };
      setComerciales((prev) => [...prev, nuevoComercialConVisitas]);
    }
  };

  return (
    <>
      <Sidebar />

      <main className="comerciales-page comerciales-main">
        <div className="comerciales-header">
          <h1 className="comerciales-title">Comerciales a mi cargo</h1>
          <div className="comerciales-button-group">
            {selectedComercialIds.size === 1 ? (
              <button
                className="comerciales-create-button"
                onClick={() => {
                  const comercialId = Array.from(selectedComercialIds)[0];
                  const comercial = comerciales.find((c) => c.id === comercialId);
                  if (comercial) {
                    setComercialAEditar(comercial);
                    setShowCreateForm(true);
                  }
                }}
              >
                <UserRoundCog size={16} />
                Editar Usuario
              </button>
            ) : (
              <button
                className="comerciales-create-button"
                onClick={() => {
                  setComercialAEditar(null);
                  setShowCreateForm(true);
                }}
              >
                <UserPlus2 size={16} />
                Crear Comercial
              </button>
            )}
            <button
              className="comerciales-delete-button"
              onClick={handleDeleteComerciales}
              disabled={selectedComercialIds.size === 0 || isLoading}
            >
              <Trash size={16} />
              Eliminar {selectedComercialIds.size > 0 && `(${selectedComercialIds.size})`}
            </button>
          </div>
        </div>

        {isLoading && <p className="comerciales-loading">Cargando comerciales...</p>}

        {error && <p className="comerciales-error">{error}</p>}

        {!isLoading && !error && comerciales.length === 0 && (
          <p className="comerciales-not-found">No hay comerciales asignados a tu ID.</p>
        )}

        {!isLoading && !error && comerciales.length > 0 && (
          <div className="comerciales-page-container">
            <table className="comerciales-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>Seleccionar</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Zona</th>
                  <th>Visitas</th>
                </tr>
              </thead>
              <tbody>
                {comerciales.map((comercialItem) => (
                  <>
                    <tr
                      key={comercialItem.id}
                      className="comerciales-row"
                      onClick={() => toggleComercialVisitas(comercialItem.id)}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedComercialIds.has(comercialItem.id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            toggleSelectComercial(comercialItem.id, e)
                          }
                        />
                      </td>
                      <td>
                        {comercialItem.nombre} {comercialItem.apellidos}
                      </td>
                      <td>{comercialItem.email}</td>
                      <td>{zonas.find((z) => z.id === comercialItem.id_zona)?.nombre_zona || "-"}</td>
                      <td>{comercialItem.visitas.length}</td>
                    </tr>
                    {expandedComercialId === comercialItem.id ? (
                      <tr className="comerciales-subrow">
                        <td colSpan={5}>
                          <div className="comerciales-list-visitas">
                            {comercialItem.visitas.length ? (
                              <div className="visitas-grid">
                                {comercialItem.visitas.map((v: Visita) => (
                                  <div key={v.id} className="visita-card">
                                    <div className="visita-card-row">
                                      <span className="visita-card-label">Fecha:</span>
                                      <span>{new Date(v.fecha_hora).toLocaleString()}</span>
                                    </div>
                                    <div className="visita-card-row">
                                      <span className="visita-card-label">Cliente:</span>
                                      <span>{v.cliente ? `${v.cliente.nombre} ${v.cliente.apellidos}` : `ID ${v.id_cliente}`}</span>
                                    </div>
                                    <div className="visita-card-row">
                                      <span className="visita-card-label">Estado:</span>
                                      <span>{v.estado?.etiqueta ?? `#${v.id_estado}`}</span>
                                    </div>
                                    {v.observaciones && (
                                      <div className="visita-card-row">
                                        <span className="visita-card-label">Observaciones:</span>
                                        <span>{v.observaciones}</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="sin-visitas">Sin visitas registradas</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showCreateForm && (
        <div
          className="comerciales-form-overlay"
          onClick={() => {
            setShowCreateForm(false);
            setComercialAEditar(null);
          }}
        >
          <div
            className="comerciales-form-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="comerciales-form-close"
              onClick={() => {
                setShowCreateForm(false);
                setComercialAEditar(null);
              }}
            >
              Cerrar
            </button>
            <ComercialesForm
              zonas={zonas}
              comercialAEditar={comercialAEditar}
              onSuccess={handleCreateComercialSuccess}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Comerciales;
