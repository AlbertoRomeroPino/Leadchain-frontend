import { useState, useCallback } from "react";
import Sidebar from "../layout/Sidebar";
import { UserService } from "../services/UserService";
import type { User, UserVisitas, Zona } from "../types";
import "../styles/Comerciales.css";
import { useInitialize } from "../hooks/useInitialize";
import {
  showErrorAlert,
  showSuccessAlert,
  showLoadingAlert,
} from "../components/utils/errorHandler";
import showStatusAlert from "../components/utils/StatusAlert";
import ComercialesHeader from "../components/Comerciales/ComercialesHeader";
import ComercialesStatus from "../components/Comerciales/ComercialesStatus";
import ComercialesTable from "../components/Comerciales/ComercialesTable";
import ComercialesFormModal from "../components/Comerciales/ComercialesFormModal";

const Comerciales = () => {
  const [comerciales, setComerciales] = useState<UserVisitas[]>([]);
  const [expandedComercialId, setExpandedComercialId] = useState<number | null>(null);
  const [selectedComercialIds, setSelectedComercialIds] = useState<Set<number>>(new Set());
  const [comercialAEditar, setComercialAEditar] = useState<User | null>(null);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const error: string | null = null;

  // OPTIMIZACIÓN 1: useCallback para estabilizar las funciones de UI
  const toggleComercialVisitas = useCallback((id: number) => {
    setExpandedComercialId((prev) => (prev === id ? null : id));
  }, []);

  // OPTIMIZACIÓN 2: Limpieza de nombre de variable (adiós "edificio") y useCallback
  const toggleSelectComercial = useCallback((
    id: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
  }, []);

  // OPTIMIZACIÓN 3: Estabilizar la función de borrado con confirmación
  const handleDeleteComerciales = useCallback(async () => {
    if (selectedComercialIds.size === 0) return;

    showStatusAlert({
      title: "¿Deseas eliminar estos comerciales?",
      description: `Se eliminarán ${selectedComercialIds.size} comercial(es) y sus visitas asociadas. Esta acción no se puede deshacer.`,
      type: "action",
      actionLabel: "Sí, eliminar",
      onAction: async () => {
        try {
          setIsLoading(true);
          await Promise.all(
            Array.from(selectedComercialIds).map((id) =>
              UserService.deleteUser(id),
            ),
          );

          setComerciales((prev) =>
            prev.filter((cliente) => !selectedComercialIds.has(cliente.id)),
          );
          setSelectedComercialIds(new Set());
          showSuccessAlert("Comercial(es) eliminado(s) correctamente");
        } catch (err) {
          showErrorAlert(err, "Eliminar Comerciales");
        } finally {
          setIsLoading(false);
        }
      },
    });
  }, [selectedComercialIds]);

  useInitialize(async () => {
    try {
      showLoadingAlert("Cargando comerciales...");

      const data = await UserService.getComercialesAMiCargo();
      const comercialesConVisitas: UserVisitas[] = data.comerciales as UserVisitas[];

      setZonas(data.zonas);
      setComerciales(comercialesConVisitas);

      showSuccessAlert("Información cargada");
    } catch (err) {
      showErrorAlert(err, "Cargar Comerciales");
    } finally {
      setIsLoading(false);
    }
  });

  // OPTIMIZACIÓN 4: Estabilizar la función de éxito
  const handleCreateComercialSuccess = useCallback((comercial: User) => {
    setShowCreateForm(false);
    setComercialAEditar(null);

    setComerciales((prev) => {
      const isEdit = prev.some((c) => c.id === comercial.id);
      if (isEdit) {
        return prev.map((cliente) => 
          cliente.id === comercial.id ? { ...cliente, ...comercial } : cliente
        );
      } else {
        const nuevoComercialConVisitas: UserVisitas = { ...comercial, visitas: [] };
        return [...prev, nuevoComercialConVisitas];
      }
    });
  }, []);

  return (
    <>
      <Sidebar />

      <main className="comerciales-page comerciales-main">
        <ComercialesHeader
          selectedComercialIds={selectedComercialIds}
          comerciales={comerciales}
          setComercialAEditar={setComercialAEditar}
          setShowCreateForm={setShowCreateForm}
          handleDeleteComerciales={handleDeleteComerciales}
          isLoading={isLoading}
        />

        <ComercialesStatus
          isLoading={isLoading}
          error={error}
          comerciales={comerciales}
        />

        <ComercialesTable
          comerciales={comerciales}
          zonas={zonas}
          isLoading={isLoading}
          error={error}
          selectedComercialIds={selectedComercialIds}
          expandedComercialId={expandedComercialId}
          toggleSelectComercial={toggleSelectComercial}
          toggleComercialVisitas={toggleComercialVisitas}
        />
        
        <ComercialesFormModal
          showCreateForm={showCreateForm}
          setShowCreateForm={setShowCreateForm}
          comercialAEditar={comercialAEditar}
          setComercialAEditar={setComercialAEditar}
          zonas={zonas}
          comerciales={comerciales}
          handleCreateComercialSuccess={handleCreateComercialSuccess}
        />
      </main>
    </>
  );
};

export default Comerciales;