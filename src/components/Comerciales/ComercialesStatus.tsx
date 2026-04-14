import type { UserVisitas } from "../../types/users/User";

interface ComercialesStatusProps {
  isLoading: boolean;
  error: string | null;
  comerciales: UserVisitas[];
}

const ComercialesStatus = ({
  isLoading,
  error,
  comerciales,
}: ComercialesStatusProps) => {
  return (
    <section className="comerciales-content">
      {isLoading && null}

      {error && <p className="comerciales-error">{error}</p>}

      {!isLoading && !error && comerciales.length === 0 && (
        <p className="comerciales-not-found">
          No hay comerciales asignados a tu ID.
        </p>
      )}
    </section>
  );
};

export default ComercialesStatus;
