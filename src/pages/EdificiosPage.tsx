import { useState } from "react";
import Sidebar from "../layout/Sidebar";
import type {
  Edificio,
  EdificioInput,
  EdificioClienteBlock,
  Zona,
} from "../types";
import EdificioInfo from "../components/Edificios/EdificioInfo";
import EdificioTabla from "../components/Edificios/EdificioTabla";
import { useAuth } from "../context/useAuth";
import { EdificiosService } from "../services/EdificiosService";
import { ZonaService } from "../services/ZonaService";
import EdificioHeader from "../components/Edificios/EdificioHeader";
import EdificioCreateModal from "../components/Edificios/EdificioCreateModal";
import { useInitialize } from "../hooks/useInitialize";
import showStatusAlert from "../components/utils/StatusAlert";
import "../styles/Edificios.css";

const Edificios = () => {
  const [edificios, setEdificios] = useState<Edificio[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [edificioSeleccionado, setEdificioSeleccionado] =
    useState<Edificio | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingEdificio, setCreatingEdificio] = useState(false);
  const { user } = useAuth();
  const canCreateEdificio = user?.rol === "admin";

  useInitialize(async () => {
    if (!user) return;

    try {
      showStatusAlert({
        type: "loading",
        title: "Cargando edificios...",
        duration: null,
      });

      const edificiosData =
        (await EdificiosService.getEdificios()) as Edificio[];

      const edificiosUnicos = Array.from(
        new Map(
          edificiosData.map((edificio: Edificio) => [
            edificio.direccion_completa,
            edificio,
          ]),
        ).values(),
      ) as Edificio[];

      setEdificios(edificiosUnicos);

      const zonasData = await ZonaService.getZonas();
      setZonas(zonasData);

      showStatusAlert({
        type: "success",
        title: "Datos cargados",
        duration: 2000,
      });
    } catch (err) {
      showStatusAlert({
        type: "error",
        title: "Error",
        duration: 4000,
      });
      const message =
        err instanceof Error ? err.message : "Error al cargar edificios";
      console.error(message);
    }
  }, [user]);

  const handleCreateEdificio = async (edificio: EdificioInput) => {
    if (!canCreateEdificio) {
      throw new Error("No autorizado para crear edificios");
    }

    const nuevoEdificio = await EdificiosService.createEdificio(edificio);

    setEdificios((prev) => [...prev, nuevoEdificio]);
    setShowCreateForm(false);

    return nuevoEdificio;
  };

  const handleEdificioUpdated = (edificioActualizado: Edificio) => {
    setEdificioSeleccionado((prev) =>
      prev?.id === edificioActualizado.id ? edificioActualizado : prev,
    );
    setEdificios((prev) =>
      prev.map((item) =>
        item.id === edificioActualizado.id ? edificioActualizado : item,
      ),
    );
  };

  const handleEdificioDeleted = (EdificioId: number) => {
    setEdificios((prev) => prev.filter((item) => item.id !== EdificioId));
    setEdificioSeleccionado(null);
  };

  // Nuevo método para adjuntar múltiples clientes de una sola vez (más eficiente)
  const handleAppendMultipleClientes = async (
    edificioId: number,
    clientes: EdificioClienteBlock[],
  ) => {
    try {
      setCreatingEdificio(true);

      // Llamar al endpoint batch que crea y adjunta todo de una sola vez
      const edificioActualizado = await EdificiosService.attachMultipleClientes(
        edificioId,
        clientes,
      );

      // Actualizar el estado local con el edificio actualizado
      setEdificios((prev) =>
        prev.map((item) =>
          item.id === edificioId ? edificioActualizado : item,
        ),
      );

      // Si el edificio está seleccionado, actualizar la vista de detalles
      if (edificioSeleccionado?.id === edificioId) {
        setEdificioSeleccionado(edificioActualizado);
      }

      setShowCreateForm(false);
      showStatusAlert({
        type: "success",
        title: "Clientes agregados",
        description: `${clientes.length} cliente${clientes.length > 1 ? "s" : ""} agregado${clientes.length > 1 ? "s" : ""} correctamente`,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al adjuntar clientes";
      throw new Error(message);
    } finally {
      setCreatingEdificio(false);
    }
  };

  // Función auxiliar para hacer refresh después de adjuntar todos los clientes
  return (
    <div className="edificios-page">
      <Sidebar />

      <main className="edificios-main">
        {edificioSeleccionado ? (
          <div className="info-edificio-container">
            <EdificioInfo
              edificio={edificioSeleccionado}
              onEdificioUpdated={handleEdificioUpdated}
              onEdificioDeleted={handleEdificioDeleted}
              onBack={() => setEdificioSeleccionado(null)}
              /* Asegúrate de que dentro de EdificioInfo uses clases como .info-edificio-card */
            />
          </div>
        ) : (
          <>
            <div className="edificios-header-section">
              <EdificioHeader
                canCreateEdificio={canCreateEdificio}
                onCreateClick={() => setShowCreateForm(true)}
                /* Dentro de EdificioHeader usa .edificios-title y .edificios-create-button */
              />
            </div>

            <div className="edificios-container">
              <EdificioTabla
                edificios={edificios}
                onEdificioSelect={setEdificioSeleccionado}
                /* Dentro de EdificioTabla usa .edificios-table */
              />
            </div>

            {canCreateEdificio && showCreateForm && (
              <EdificioCreateModal
                show={showCreateForm}
                loading={creatingEdificio}
                zonas={zonas}
                edificios={edificios}
                onClose={() => setShowCreateForm(false)}
                onCreateEdificio={handleCreateEdificio}
                onAppendMultipleClientes={handleAppendMultipleClientes}
                /* Dentro del Modal usa .form-edificio y .form-edificio-input */
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Edificios;
