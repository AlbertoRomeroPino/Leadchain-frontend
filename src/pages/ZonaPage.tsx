import { useMemo, useState } from "react";
import Sidebar from "../layout/Sidebar";
import type { GeoPoint, Zona } from "../types";
import { ZonaService } from "../services/ZonaService";
import { useInitialize } from "../hooks/useInitialize";
import showStatusAlert from "../components/utils/StatusAlert";
import ZonaFormularioModal from "../components/Zona/FormularioModal/ZonaFormularioModal";
import ZonaHeader from "../components/Zona/ZonaHeader";
import ZonaInfo from "../components/Zona/ZonaInfo";
import ZonaList from "../components/Zona/ZonaList";
import "leaflet/dist/leaflet.css";
import "../styles/Zona.css";
import { showErrorAlert, showSuccessAlert } from "../components/utils/errorHandler";

const Zona = () => {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [selectedZona, setSelectedZona] = useState<Zona | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingZona, setCreatingZona] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Cargar datos optimizados en una única consulta
  useInitialize(async () => {
    try {
      showStatusAlert({
        type: "loading",
        title: "Cargando zonas...",
        duration: null,
      });

      const zonasResponse = await ZonaService.getZonasPageData();
      setZonas(zonasResponse);

      showStatusAlert({
        type: "success",
        title: "Información cargada",
        duration: 2000,
      });
    } catch {
      showStatusAlert({
        type: "error",
        title: "Error",
        duration: 4000,
      });
      console.error("Error fetching zonas:");
    }
  });

  const handleCreateZona = async (zona: { nombre: string; area: GeoPoint[] }) => {
    try {
      setCreatingZona(true);
      await ZonaService.createZona(zona);
      const zonasResponse = await ZonaService.getZonasPageData();
      setZonas(zonasResponse);
      setShowCreateForm(false);
      setEditMode(false);
    } catch {
      // Error al crear zona
    } finally {
      setCreatingZona(false);
    }
  };

  const handleUpdateZona = async (zona: { nombre: string; area: GeoPoint[] }) => {
    if (!selectedZona) return;
    try {
      setCreatingZona(true);
      await ZonaService.updateZona(selectedZona.id, zona);
      const zonasResponse = await ZonaService.getZonasPageData();
      setZonas(zonasResponse);
      const updatedZona = zonasResponse.find((zona: Zona) => zona.id === selectedZona.id);
      if (updatedZona) setSelectedZona(updatedZona);
      setShowCreateForm(false);
      setEditMode(false);
    } catch {
      // Error al actualizar zona
    } finally {
      setCreatingZona(false);
    }
  };

  const handleFormSubmit = async (zona: { nombre: string; area: GeoPoint[] }) => {
    if (editMode && selectedZona) {
      await handleUpdateZona(zona);
    } else {
      await handleCreateZona(zona);
    }
  };

  const handleOpenCreate = () => {
    setEditMode(false);
    setShowCreateForm(true);
  };

  const handleOpenEdit = () => {
    setEditMode(true);
    setShowCreateForm(true);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setEditMode(false);
  };

  const handleDeleteZona = async () => {
  if (!selectedZona) return;

  // 1. Validación previa: Si tiene edificios, mostramos error y paramos la ejecución.
  if (selectedZona.edificios && selectedZona.edificios.length > 0) {
    showStatusAlert({
      type: "error",
      title: "No se puede eliminar la zona",
      description: "La zona tiene edificios asociados. Elimina los edificios primero.",
      duration: 4000,
    });
    return;
  }

  // 2. Si pasa la validación, disparamos la alerta de confirmación (tipo "action").
  showStatusAlert({
    title: `¿Deseas eliminar la zona "${selectedZona.nombre}"?`,
    description: "Esta acción eliminará todos los datos asociados y no se puede deshacer.",
    type: "action",
    actionLabel: "Sí, eliminar",
    onAction: async () => {
      try {
        setCreatingZona(true);
        
        // Ejecución de la eliminación
        await ZonaService.deleteZona(selectedZona.id);
        
        // Refresco de datos
        const zonasResponse = await ZonaService.getZonasPageData();
        setZonas(zonasResponse);
        setSelectedZona(null);

      
        showSuccessAlert("Zona eliminada correctamente");
        
      } catch (error) {
        console.error("Error al eliminar zona:", error);
        showErrorAlert(error, "Eliminar Zona");
      } finally {
        setCreatingZona(false);
      }
    },
  });
};

  // Obtener edificios de la zona seleccionada (ahora vienen dentro de la zona)
  const selectedEdificios = useMemo(() => {
    if (!selectedZona || !selectedZona.edificios) return [];
    return selectedZona.edificios;
  }, [selectedZona]);

  // Contar total de clientes en edificios con clientes asignados
  const selectedAssignedClientsCount = useMemo(() => {
    return selectedEdificios.reduce((total, edificio) => {
      if (Array.isArray(edificio.clientes)) {
        return total + edificio.clientes.length;
      }
      return total;
    }, 0);
  }, [selectedEdificios]);

  // Contar edificios por zona
  const edificiosPorZona = useMemo(() => {
    const counts: Record<number, number> = {};
    zonas.forEach((zona) => {
      if (zona.edificios) {
        counts[zona.id] = zona.edificios.length;
      }
    });
    return counts;
  }, [zonas]);

  return (
    <div className="clientes-page">
      <Sidebar />

      <main className="clientes-main">
        {!selectedZona && (
          <ZonaHeader onCreate={handleOpenCreate} creatingZona={creatingZona} />
        )}

        {selectedZona ? (
          <ZonaInfo
            selectedZona={selectedZona}
            selectedEdificiosCount={selectedEdificios.length}
            selectedAssignedEdificiosCount={selectedAssignedClientsCount}
            creatingZona={creatingZona}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteZona}
            onBack={() => setSelectedZona(null)}
          />
        ) : (
          <div className="zona-list-panel">
            <ZonaList
              zonas={zonas}
              selectedZonaId={null}
              edificiosPorZona={edificiosPorZona}
              onSelectZona={(zona) => setSelectedZona(zona)}
            />
          </div>
        )}

        <ZonaFormularioModal
          show={showCreateForm}
          loading={creatingZona}
          mode={editMode ? "edit" : "create"}
          initialValues={
            editMode && selectedZona
              ? {
                  nombre: selectedZona.nombre,
                  area: selectedZona.area ?? [],
                }
              : undefined
          }
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
        />
      </main>
    </div>
  );
};

export default Zona;
