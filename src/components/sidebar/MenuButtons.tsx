
import { useNavigate } from "react-router-dom";
import "../../styles/components/sidebar/MenuButtons.css";

interface MenuButtonsProps {
  icon: React.ReactNode;
  label: string;
  index: number;
  setActiveIndex: (index: number) => void;
  activeIndex: number;
  path?: string;
}

export const MenuButtons = ({
  icon,
  label,
  index,
  setActiveIndex,
  activeIndex,
  path,
}: MenuButtonsProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    setActiveIndex(index);
    if (path) {
      navigate(path);
    }
  };

  return (
    <button
      className={`nav-button ${activeIndex === index ? "active" : ""}`}
      onClick={handleClick}
      title={label}
    >
      {icon}
    </button>
  );
};

export default MenuButtons;
