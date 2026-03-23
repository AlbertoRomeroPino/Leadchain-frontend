import { House, Map, User, MapPin, BookUser, LogOut, Menu } from "lucide-react";
import "../styles/header.css"; // Asegúrate de importar tu CSS
import { useState } from "react";
import showStatusAlert from "../components/StatusAlert";

function Header() {
  const [activeIndex, setActiveIndex] = useState(0);

  // TODO: Utilizar X iconos segun si eres admin o comercial

  const menuItems = [
    { icon: <House size={24} />, label: "Home" },
    { icon: <Map size={24} />, label: "Mapa" },
    { icon: <User size={24} />, label: "Perfil" },
    { icon: <MapPin size={24} />, label: "Visitas" },
    { icon: <BookUser size={24} />, label: "Clientes" },
  ];

  return (
    <header className="sidebar-rail">
      {/* Logo con enlace inmediato a Home */}
      <a href="/" className="sidebar-logo" title="Volver a Home">
        <Menu size={28} strokeWidth={2.5} />
      </a>

      {/* Lista de botones */}
      <nav>
        <ul className="nav-list">
          {menuItems.map((item, index) => (
            <li key={index}>
              <button
                className={`nav-button ${activeIndex === index ? "active" : ""}`}
                onClick={() => setActiveIndex(index)}
                title={item.label}
              >
                {item.icon}
              </button>
            </li>
          ))}

          <li className="logout-item">
            <button
              className="nav-button"
              onClick={() =>
                showStatusAlert({ title: "Cerrar Sesión", type: "success" })
              }
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

export default Header;
