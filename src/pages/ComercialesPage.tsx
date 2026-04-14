import { useState } from "react";
import Sidebar from "../layout/Sidebar";
import { UserService } from "../services/User";
import type { User, UserVisitas } from "../types/users/User";
import type { Zona } from "../types/zonas/Zona";
import "../styles/ComercialesPage.css";
import { useInitialize } from "../hooks/useInitialize";
import showStatusAlert from "../components/utils/StatusAlert";
import ComercialesHeader from "../components/Comerciales/ComercialesHeader";
import ComercialesStatus from "../components/Comerciales/ComercialesStatus";
import ComercialesTable from "../components/Comerciales/ComercialesTable";
import ComercialesFormModal from "../components/Comerciales/ComercialesFormModal";

const Comerciales = () => {
  const [comerciales, setComerciales] = useState<UserVisitas[]>([]);
  const [expandedComercialId, setExpandedComercialId] = useState<number | null>(
    null,
  );
  const [selectedComercialIds, setSelectedComercialIds] = useState<Set<number>>(
    new Set(),
  );
  const [comercialAEditar, setComercialAEditar] = useState<User | null>(null);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleComercialVisitas = (id: number) => {
    setExpandedComercialId((prev) => (prev === id ? null : id));
  };

  const toggleSelectComercial = (
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
  };

  const handleDeleteComerciales = async () => {
    if (selectedComercialIds.size === 0) {
      return;
    }

    try {
      setIsLoading(true);
      await Promise.all(
        Array.from(selectedComercialIds).map((id) =>
          UserService.deleteUser(id),
        ),
      );

      setComerciales((prev) =>
        prev.filter((c) => !selectedComercialIds.has(c.id)),
      );
      setSelectedComercialIds(new Set());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
      showStatusAlert({
        type: "error",
        title: "Error",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useInitialize(async () => {
    try {
      showStatusAlert({
        type: "loading",
        title: "Cargando comerciales...",
        duration: null,
      });

      // Una sola petición consolida comerciales con visitas anidadas y zonas
      const data = await UserService.getComercialesAMiCargo();

      // Las visitas ya están anidadas en cada comercial con cliente y estado incluidos
      const comercialesConVisitas: UserVisitas[] =
        data.comerciales as UserVisitas[];

      setZonas(data.zonas);
      setComerciales(comercialesConVisitas);

      showStatusAlert({
        type: "success",
        title: "Información cargada",
        duration: 2000,
      });
    } catch (err) {
      showStatusAlert({
        type: "error",
        title: "Error",
        duration: 4000,
      });
      setError(
        err instanceof Error ? err.message : "Error cargando comerciales",
      );
    } finally {
      setIsLoading(false);
    }
  });

  const handleCreateComercialSuccess = (comercial: User) => {
    // Cerrar modal
    setShowCreateForm(false);
    setComercialAEditar(null);

    if (comercialAEditar) {
      // Modo edición: actualizar el comercial en la lista
      setComerciales((prev) =>
        prev.map((c) => (c.id === comercial.id ? { ...c, ...comercial } : c)),
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
          handleCreateComercialSuccess={handleCreateComercialSuccess}
        />
      </main>

      
    </>
  );
};

export default Comerciales;
