import type { Zona } from "../../types/zonas/Zona";
import type { User } from "../../types/users/User";
import ComercialesForm from "./ComercialesForm";
import "../../styles/components/Comerciales/ComercialesFormModal.css";

interface ComercialesFormModalProps {
  showCreateForm: boolean;
  setShowCreateForm: (show: boolean) => void;
  comercialAEditar: User | null;
  setComercialAEditar: (comercial: User | null) => void;
  zonas: Zona[];
  handleCreateComercialSuccess: (comercial: User) => void;
}

const ComercialesFormModal = ({
  showCreateForm,
  setShowCreateForm,
  comercialAEditar,
  setComercialAEditar,
  zonas,
  handleCreateComercialSuccess,
}: ComercialesFormModalProps) => {
  return (
    <section className="comerciales-form-section">
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
    </section>
  );
};

export default ComercialesFormModal;
