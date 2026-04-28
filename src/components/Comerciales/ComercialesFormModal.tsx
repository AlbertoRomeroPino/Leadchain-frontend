import type { Zona, User } from "../../types";
import ComercialesForm from "./ComercialesForm";
import "../../styles/components/Comerciales/ComercialesFormModal.css";

interface ComercialesFormModalProps {
  showCreateForm: boolean;
  setShowCreateForm: (show: boolean) => void;
  comercialAEditar: User | null;
  setComercialAEditar: (comercial: User | null) => void;
  zonas: Zona[];
  comerciales: User[];
  handleCreateComercialSuccess: (comercial: User) => void;
}

const ComercialesFormModal = ({
  showCreateForm,
  setShowCreateForm,
  comercialAEditar,
  setComercialAEditar,
  zonas,
  comerciales,
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
              comerciales={comerciales}
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
