import React, { useState, useEffect } from "react";
import type { User } from "../../../types/users/User";
import type { Edificio } from "../../../types/edificios/Edificio";
import type { Visita } from "../../../types/visitas/Visita";
import type { Cliente } from "../../../types/clientes/Cliente";
import { useInitialize } from "../../../hooks/useInitialize";

interface ComercialCardProps {
  comerciales: User[];
  visitas: Visita[];
  clientes: Cliente[];
  edificios: Edificio[];
}

interface ComercialStats {
  comercialId: number;
  totalClientes: number;
  exitosos: number;
  rechazados: number;
  enProceso: number;
  totalVisitas: number;
}

interface ComercialCardIndividualProps {
  comercial: User;
  stats: ComercialStats | null;
  loading: boolean;
}

const ComercialCardIndividual: React.FC<ComercialCardIndividualProps> = ({
  comercial,
  stats,
  loading,
}) => {
  if (loading) return null;

  const totalClientes = stats?.totalClientes || 0;
  const totalVisitas = stats?.totalVisitas || 0;
  const cobertura =
    totalClientes > 0 ? Math.round((totalVisitas / totalClientes) * 100) : 0;

  const exitosos = stats?.exitosos || 0;
  const rechazados = stats?.rechazados || 0;
  const enProceso = stats?.enProceso || 0;

  const statusCategories = [
    {
      nombre: "Exitoso",
      cantidad: exitosos,
      color: "#10b981",
      porcentaje:
        totalVisitas > 0 ? Math.round((exitosos / totalVisitas) * 100) : 0,
    },
    {
      nombre: "En Proceso",
      cantidad: enProceso,
      color: "#f59e0b",
      porcentaje:
        totalVisitas > 0 ? Math.round((enProceso / totalVisitas) * 100) : 0,
    },
    {
      nombre: "Rechazado",
      cantidad: rechazados,
      color: "#ef4444",
      porcentaje:
        totalVisitas > 0 ? Math.round((rechazados / totalVisitas) * 100) : 0,
    },
  ];

  return (
    <div className="comercial-card-individual">
      <div className="comercial-card-header">
        <h4 className="comercial-card-name">
          {comercial.nombre} {comercial.apellidos}
        </h4>
        <p className="comercial-card-email">📧 {comercial.email || "N/A"}</p>
      </div>

      <div className="comercial-card-body">
        {/* Información general */}
        <div className="comercial-info-row">
          <div className="info-item">
            <span className="info-label">Clientes:</span>
            <span className="info-value">{totalClientes}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Visitas:</span>
            <span className="info-value">{totalVisitas}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Cobertura:</span>
            <span className="info-value">{cobertura}%</span>
          </div>
        </div>

        {/* Barras de progreso por categoría */}
        <div className="comercial-stats-bars">
          {statusCategories.map((category) => (
            <div key={category.nombre} className="stats-bar-item">
              <div className="stats-bar-header">
                <span className="stats-bar-label">{category.nombre}</span>
                <span className="stats-bar-count">
                  {category.cantidad} ({category.porcentaje}%)
                </span>
              </div>
              <div className="stats-bar-container">
                <div
                  className="stats-bar-fill"
                  style={{
                    width: `${category.porcentaje}%`,
                    backgroundColor: category.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ComercialCard = ({ comerciales, visitas, clientes, edificios }: ComercialCardProps) => {
  const [stats, setStats] = useState<Map<number, ComercialStats>>(new Map());
  const [loading, setLoading] = useState(true);

  useInitialize(
    async () => {
      if (comerciales.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Definir categorías de estados
        const categoriasEstados: Record<
          string,
          { etiquetas: string[]; titulo: string }
        > = {
          exitoso: {
            etiquetas: [
              "Vendido",
              "Presupuestado",
              "vendido",
              "presupuestado",
            ],
            titulo: "Exitoso",
          },
          rechazado: {
            etiquetas: ["Cancelado", "No interesado", "cancelado", "no interesado"],
            titulo: "Rechazado",
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
            titulo: "En Proceso",
          },
        };

        // Calcular estadísticas para cada comercial
        const statsMap = new Map<number, ComercialStats>();

        comerciales.forEach((comercial) => {
          // Obtener edificios de la zona del comercial
          const edificiosDelComercial = edificios.filter(
            (e: Edificio) => e.id_zona === comercial.id_zona
          );

          // Obtener IDs únicos de clientes de esos edificios
          const idsClientesUnicos = new Set<number>();
          edificiosDelComercial.forEach((edificio: Edificio) => {
            if (edificio.clientes && edificio.clientes.length > 0) {
              edificio.clientes.forEach((cliente: Cliente) => {
                idsClientesUnicos.add(cliente.id);
              });
            }
          });

          // Filtrar clientes que están en la zona
          const clientesDelComercial = clientes.filter(
            (c) => idsClientesUnicos.has(c.id)
          );
          const totalClientes = clientesDelComercial.length;

          // Filtrar visitas del comercial que pertenecen a clientes de su zona
          const visitasDelComercial = visitas.filter(
            (v: Visita) => v.id_usuario === comercial.id && idsClientesUnicos.has(v.id_cliente)
          );
          const totalVisitas = visitasDelComercial.length;

          // Contar visitas por categoría
          let exitosos = 0;
          let rechazados = 0;
          let enProceso = 0;

          visitasDelComercial.forEach((visita: Visita) => {
            if (visita.estado) {
              const etiqueta = visita.estado.etiqueta;

              if (
                categoriasEstados.exitoso.etiquetas.includes(etiqueta)
              ) {
                exitosos++;
              } else if (
                categoriasEstados.rechazado.etiquetas.includes(etiqueta)
              ) {
                rechazados++;
              } else if (
                categoriasEstados.enProceso.etiquetas.includes(etiqueta)
              ) {
                enProceso++;
              }
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
      } finally {
        setLoading(false);
      }
    },
    [comerciales, visitas, clientes, edificios]
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
              stats={stats.get(comercial.id) || null}
              loading={loading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ComercialCard;
