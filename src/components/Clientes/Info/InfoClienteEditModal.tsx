import type { Cliente } from "../../../types/clientes/Cliente";
import FormCliente from "../ClienteForm";

interface InfoClienteEditModalProps {
  show: boolean;
  loading: boolean;
  cliente: Cliente;
  onClose: () => void;
  onSubmit: (cliente: {
    nombre: string;
    apellidos: string;
    telefono?: string;
    email?: string;
  }) => Promise<void>;
}

const InfoClienteEditModal = ({
  show,
  loading,
  cliente,
  onClose,
  onSubmit,
}: InfoClienteEditModalProps) => {
  if (!show) {
    return null;
  }

  return (
    <div className="clientes-modal-overlay" onClick={onClose}>
      <div className="clientes-modal" onClick={(event) => event.stopPropagation()}>
        <FormCliente
          key={cliente.id}
          mode="edit"
          initialValues={{
            nombre: cliente.nombre,
            apellidos: cliente.apellidos,
            telefono: cliente.telefono ?? "",
            email: cliente.email ?? "",
          }}
          onSubmit={onSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default InfoClienteEditModal;
