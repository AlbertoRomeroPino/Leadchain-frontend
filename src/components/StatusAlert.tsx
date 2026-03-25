import { sileo } from "sileo";

type SileoType = "success" | "error" | "warning" | "info" | "loading" | "action";

interface StatusAlertProps {
  type: SileoType;
  title: string;
  description?: string;
  duration?: number;
}

const showStatusAlert = ({ type, title, description, duration }: StatusAlertProps): void => {
  sileo.show({
    title,
    description,
    type,
    duration: duration ?? 2000,
    // Aumentamos ligeramente el tiempo de expansión para que el 
    // navegador calcule bien el centrado del texto
    autopilot: description ? { expand: 200, collapse: 3800 } : false,
    // Forzamos las clases también aquí por si el Toaster no las inyecta a tiempo
    styles: {
      title: "sileo-title",
      description: "sileo-description",
      badge: "sileo-badge",
    },
  });
};

export const destroyStatusAlert = (): void => {
  sileo.clear();
}

export default showStatusAlert;