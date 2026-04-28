import { House, Map, User, MapPin, BookUser, LogOut, Building, Scan} from "lucide-react";
import "../styles/components/sidebar/Sidebar.css";
import { MenuButtons } from "../components/sidebar/MenuButtons";
import { useAuth } from "../auth/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import type { User as UserType } from "../types";

// Definir qué botones ve cada rol
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    "Volver al inicio",
    "Inicio",
    "Mapa",
    "Comerciales",
    "Visitas",
    "Clientes",
    "Edificios",
    "Zona",
  ],
  comercial: [
    "Volver al inicio",
    "Inicio",
    "Mapa",
    "Visitas",
    "Clientes",
  ],
};

const menuItems: Array<{
  icon: React.ReactNode;
  label: string;
  path: string;
}> = [
  { icon: <House size={24} />, label: "Inicio", path: "/Inicio" },
  { icon: <Map size={24} />, label: "Mapa", path: "/Map" },
  { icon: <User size={24} />, label: "Comerciales", path: "/Comerciales" },
  { icon: <MapPin size={24} />, label: "Visitas", path: "/Visitas" },
  { icon: <BookUser size={24} />, label: "Clientes", path: "/Clientes" },
  { icon: <Building size={24} />, label: "Edificios", path: "/Edificios" },
  { icon: <Scan size={24} />, label: "Zona", path: "/Zona" },
];

// Mapeo precalculado de índices para evitar búsquedas repetidas
const menuItemsMap = Object.fromEntries(
  menuItems.map((item, idx) => [item.label, idx])
);

// Extrae el rol del usuario de forma segura
const getUserRole = (user: UserType | null): string => {
  return user?.rol || 'comercial';
};

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/Login");
  };

  // Calcular activeIndex basado en la ruta actual
  const activeIndex = menuItems.findIndex(
    (item) => item.path === location.pathname,
  );

  // Obtener rol del usuario
  const userRole = getUserRole(user);
  
  // Filtrar menú según el rol del usuario
  const allowedLabels = ROLE_PERMISSIONS[userRole] ?? [];
  const filteredMenuItems = menuItems.filter((item) =>
    allowedLabels.includes(item.label),
  );

  return (
    <header className="sidebar-rail">
      {/* Lista de botones */}
      <nav>
        <ul className="nav-list">
          <li className="sidebar-logo" aria-label="Logo de Leadchain">
            <img src="/icons/leadchain-logo.png" alt="Logo de Leadchain" />
          </li>

          {filteredMenuItems.map((item) => {
            const originalIndex = menuItemsMap[item.label] ?? 0;

            return (
              <li key={item.label}>
                <MenuButtons
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  index={originalIndex}
                  setActiveIndex={() => {}}
                  activeIndex={activeIndex}
                />
              </li>
            );
          })}

          <li className="logout-item">
            <button
              className="nav-button"
              onClick={handleLogout}
              title="Cerrar Sesión"
            >
              <LogOut size={24} />
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Sidebar;
