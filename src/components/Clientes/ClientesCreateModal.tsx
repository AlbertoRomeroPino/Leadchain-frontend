import ClienteForm from "./ClienteForm";
import "../../styles/components/Clientes/ClientesCreateModal.css";

interface ClientesCreateModalProps {
  show: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (cliente: {
    nombre: string;
    apellidos: string;
    telefono?: string;
    email?: string;
  }) => Promise<void>;
}

const ClientesCreateModal = ({
  show,
  loading,
  onClose,
  onSubmit,
}: ClientesCreateModalProps) => {
  if (!show) {
    return null;
  }

  return (
    <div className="clientes-modal-overlay" onClick={onClose}>
      <div className="clientes-modal" onClick={(event) => event.stopPropagation()}>
        <ClienteForm onSubmit={onSubmit} onCancel={onClose} loading={loading} />
      </div>
    </div>
  );
};

export default ClientesCreateModal;
