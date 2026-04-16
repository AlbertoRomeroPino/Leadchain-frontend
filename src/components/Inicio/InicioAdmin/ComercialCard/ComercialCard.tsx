import { useState } from "react";
import "../../../../styles/components/Inicio/InicioAdmin/ComercialCard/ComercialCard.css";
import { useInitialize } from "../../../../hooks/useInitialize";
import type { User } from "../../../../types/users/User";
import type { Visita } from "../../../../types/visitas/Visita";
import type { Cliente } from "../../../../types/clientes/Cliente";
import type { Edificio } from "../../../../types/edificios/Edificio";
import ComercialCardIndividual from "./ComercialCardIndividual";

export interface ComercialCardProps {
  comerciales: User[];
  visitas: Visita[];
  clientes: Cliente[];
  edificios: Edificio[];
}

export interface ComercialStats {
  comercialId: number;
  totalClientes: number;
  exitosos: number;
  rechazados: number;
  enProceso: number;
  totalVisitas: number;
}

const ComercialCard = ({ comerciales, visitas, clientes, edificios }: ComercialCardProps) => {
  const [stats, setStats] = useState<Map<number, ComercialStats>>(new Map());

  useInitialize(
    async () => {
      if (comerciales.length === 0) {
        return;
      }

      try {

        const categoriasEstados: Record<string, { etiquetas: string[] }> = {
          exitoso: {
            etiquetas: ["Vendido", "Presupuestado", "vendido", "presupuestado"],
          },
          rechazado: {
            etiquetas: ["Cancelado", "No interesado", "cancelado", "no interesado"],
          },
          enProceso: {
            etiquetas: [
              "En Proceso",
              "En camino",
              "Pendiente",
              "Volver luego",
              "Ausente",
              "Local Cerrado",
              "en proceso",
              "en camino",
              "pendiente",
              "volver luego",
              "ausente",
              "local cerrado",
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
            (visita) =>
              visita.id_usuario === comercial.id &&
              idsClientesUnicos.has(visita.id_cliente),
          );
          const totalVisitas = visitasDelComercial.length;

          let exitosos = 0;
          let rechazados = 0;
          let enProceso = 0;

          visitasDelComercial.forEach((visita) => {
            if (!visita.estado) {
              return;
            }

            const etiqueta = visita.estado.etiqueta;

            if (categoriasEstados.exitoso.etiquetas.includes(etiqueta)) {
              exitosos++;
            } else if (categoriasEstados.rechazado.etiquetas.includes(etiqueta)) {
              rechazados++;
            } else if (categoriasEstados.enProceso.etiquetas.includes(etiqueta)) {
              enProceso++;
            }
          });

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
    [comerciales, visitas, clientes, edificios],
  );

  return (
    <div className="comerciales-container">
      {comerciales.length === 0 ? (
        <p className="comerciales-empty">No tienes comerciales asignados.</p>
      ) : (
        <div className="comerciales-grid">
          {comerciales.map((comercial) => (
            <ComercialCardIndividual
              key={comercial.id}
              comercial={comercial}
              stats={stats.get(comercial.id) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ComercialCard;
