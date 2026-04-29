import { useState } from "react";
import "../../../../styles/components/Inicio/InicioAdmin/ComercialCard/ComercialCard.css";
import { useInitialize } from "../../../../hooks/useInitialize";
import type { User, Visita, Cliente, Edificio, Zona} from "../../../../types";
import ComercialCardIndividual from "./ComercialCardIndividual";

export interface ComercialCardProps {
  comerciales: User[];
  visitas: Visita[];
  clientes: Cliente[];
  edificios: Edificio[];
  zonas: Zona[];
}

export interface ComercialStats {
  comercialId: number;
  totalClientes: number;
  exitosos: number;
  rechazados: number;
  enProceso: number;
  totalVisitas: number;
}

const ComercialCard = ({ comerciales, visitas, clientes, edificios, zonas }: ComercialCardProps) => {
  const [stats, setStats] = useState<Map<number, ComercialStats>>(new Map());

  useInitialize(
    async () => {
      if (comerciales.length === 0) {
        return;
      }

      try {

        const categoriasEstados: Record<string, { etiquetas: string[] }> = {
          exitoso: {
            etiquetas: ["Vendido"],
          },
          rechazado: {
            etiquetas: ["Cancelada", "No Interesado"],
          },
          enProceso: {
            etiquetas: [
              "En Camino",
              "Pendiente",
              "Volver luego",
              "Ausente",
              "Local Cerrado",
            ],
          },
        };

        const statsMap = new Map<number, ComercialStats>();

        comerciales.forEach((comercial) => {
          const edificiosDelComercial = edificios.filter(
            (edificio) => edificio.id_zona === comercial.id_zona,
          );

          const idsClientesUnicos = new Set<number>();
          edificiosDelComercial.forEach((edificio) => {
            if (Array.isArray(edificio.clientes) && edificio.clientes.length > 0) {
              edificio.clientes.forEach((cliente) => {
                idsClientesUnicos.add(cliente.id);
              });
            }
          });

          const clientesDelComercial = clientes.filter((cliente) =>
            idsClientesUnicos.has(cliente.id),
          );
          const totalClientes = clientesDelComercial.length;

          const visitasDelComercial = visitas.filter(
            (visita) => visita.id_usuario === comercial.id
          );
          const totalVisitas = visitasDelComercial.length;

          const exitosos = visitasDelComercial.filter(
            (visita) =>
              visita.estado &&
              categoriasEstados.exitoso.etiquetas.includes(visita.estado.etiqueta)
          ).length;

          const rechazados = visitasDelComercial.filter(
            (visita) =>
              visita.estado &&
              categoriasEstados.rechazado.etiquetas.includes(visita.estado.etiqueta)
          ).length;

          const enProceso = visitasDelComercial.filter(
            (visita) =>
              visita.estado &&
              categoriasEstados.enProceso.etiquetas.includes(visita.estado.etiqueta)
          ).length;

          statsMap.set(comercial.id, {
            comercialId: comercial.id,
            totalClientes,
            exitosos,
            rechazados,
            enProceso,
            totalVisitas,
          });
        });

        setStats(statsMap);
      } catch (error) {
        console.error("Error al calcular estadísticas de comerciales:", error);
      }
    },
    [comerciales, visitas, clientes, edificios, zonas],
  );

  return (
    <div className="comerciales-container">
      {comerciales.length === 0 ? (
        <p className="comerciales-empty">No tienes comerciales asignados.</p>
      ) : (
        <div className="comerciales-grid">
          {comerciales.map((comercial) => {
            const zonaDelComercial = zonas.find(zona => Number(zona.id) === Number(comercial.id_zona));
            return (
              <ComercialCardIndividual
                key={comercial.id}
                comercial={comercial}
                stats={stats.get(comercial.id) ?? null}
                zona={zonaDelComercial ?? null}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ComercialCard;
