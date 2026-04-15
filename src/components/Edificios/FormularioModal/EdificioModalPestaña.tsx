import '../../../styles/components/Edificios/FormularioModal/EdificioModalPestaña.css';

interface EdificioModalPestañaProps {
  mode: "new" | "existing";
  setMode: (mode: "new" | "existing") => void;
}

const EdificioModalPestaña = ({ mode, setMode }: EdificioModalPestañaProps) => {
  return (
    <div className="edificio-create-tabs">
          <button
            type="button"
            className={mode === "new" ? "tab-btn active" : "tab-btn"}
            onClick={() => setMode("new")}
          >
            Crear edificio
          </button>
          <button
            type="button"
            className={mode === "existing" ? "tab-btn active" : "tab-btn"}
            onClick={() => setMode("existing")}
          >
            Añadir cliente
          </button>
        </div>
  )
}

export default EdificioModalPestaña