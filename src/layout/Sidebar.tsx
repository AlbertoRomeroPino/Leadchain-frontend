import { House, Map, User, MapPin, BookUser, LogOut, Building, Scan} from "lucide-react";
import "../styles/Sidebar.css";
import { MenuButtons } from "../components/sidebar/MenuButtons";
import { useAuth } from "../auth/useAuth";
import { useNavigate, useLocation } from "react-router-dom";

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

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Calcular activeIndex basado en la ruta actual
  const activeIndex = menuItems.findIndex(
    (item) => item.path === location.pathname,
  );

  const handleLogout = () => {
    logout();
    navigate("/Login");
  };

  // Dummy setActiveIndex para compatibilidad con MenuButtons
  const setActiveIndex = () => {};

  type MaybeNestedUser = { user?: { rol?: string } } & { rol?: string };

  // Filtrar menú según el rol del usuario
  let userRole = 'comercial'; // Default
  
  if (user) {
    const authUser = user as MaybeNestedUser;

    if (authUser.user && typeof authUser.user === 'object') {
      userRole = authUser.user.rol || 'comercial';
    } else {
      userRole = authUser.rol || 'comercial';
    }
  }
  
  const allowedLabels = ROLE_PERMISSIONS[userRole] || [];
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
            const originalIndex = menuItems.findIndex(
              (menuItem) => menuItem.label === item.label,
            );

            return (
              <li key={item.label}>
                <MenuButtons
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  index={originalIndex}
                  setActiveIndex={setActiveIndex}
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
