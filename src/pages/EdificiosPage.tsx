import { useEffect, useState } from "react";
import Sidebar from "../layout/Sidebar";
import type { Edificio, EdificioInput } from "../types/edificios/Edificio";
import type { Zona } from "../types/zonas/Zona";
import EdificioInfo from "../components/Edificios/EdificioInfo";
import EdificioTabla from "../components/Edificios/EdificioTabla";
import { useAuth } from "../auth/useAuth";
import showStatusAlert from "../components/StatusAlert";
import { EdificioService } from "../services/EdificiosService";
import { ZonaService } from "../services/ZonaService";
import { clientesService } from "../services/ClientesService";
import EdificioHeader from "../components/Edificios/EdificioHeader";
import EdificioCreateModal from "../components/Edificios/EdificioCreateModal";
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

  useEffect(() => {
    if (!user) return;

    const loadEdificios = async () => {
      showStatusAlert({
        type: "loading",
        title: "Cargando edificios y zonas...",
        duration: 8000,
      });

      // TODO: los comerciales unicamente pueden ver los edificios de sus zonas
      // y los administradores los de sus comerciales, pero eso lo dejamos para más adelante
      try {
        const edificiosData =
          (await EdificioService.getEdificios()) as Edificio[];

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
          title: "Edificios y zonas cargados correctamente",
          description: `Edificios: ${edificiosUnicos.length}`,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error al cargar edificios";
        showStatusAlert({
          type: "error",
          title: "Error al cargar edificios",
          description: message,
        });
      }
    };

    loadEdificios();
  }, [user]);

  const handleCreateEdificio = async (edificio: EdificioInput) => {
    if (!canCreateEdificio) {
      showStatusAlert({
        type: "error",
        title: "No autorizado",
        description: "No tienes permisos para crear edificios",
      });
      return;
    }

    try {
      setCreatingEdificio(true);

      const nuevoEdificio = await EdificioService.createEdificio(edificio);

      setEdificios((prev) => [...prev, nuevoEdificio]);
      setShowCreateForm(false);

      showStatusAlert({
        type: "success",
        title: "Edificio creado",
        description: "El edificio se creó correctamente",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al crear edificio";
      showStatusAlert({
        type: "error",
        title: "Error al crear edificio",
        description: message,
      });
    } finally {
      setCreatingEdificio(false);
    }
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

  const handleAppendToExisting = async (
    edificioId: number,
    nombre: string,
    apellidos: string,
  ) => {
    const targetEdificio = edificios.find((e) => e.id === edificioId);
    try {
      setCreatingEdificio(true);
      await clientesService.createCliente({
        nombre,
        apellidos,
        id_usuario_asignado: null,
      });
      showStatusAlert({
        type: "success",
        title: "Cliente añadido",
        description: `Cliente añadido al edificio ${targetEdificio ? targetEdificio.direccion_completa : edificioId}`,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al añadir cliente";
      showStatusAlert({
        type: "error",
        title: "Error",
        description: message,
      });
    } finally {
      setCreatingEdificio(false);
      setShowCreateForm(false);
    }
  };

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
                onAppendToExisting={handleAppendToExisting}
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
