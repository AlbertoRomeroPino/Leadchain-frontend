import { sileo } from "sileo";

type SileoType = "success" | "error" | "warning" | "info" | "loading" | "action";

interface StatusAlertProps {
  type: SileoType;
  title: string;
  description?: string;
  duration?: number | null;
  onAction?: () => void | Promise<void>;
  actionLabel?: string;
}

const stopStatusAlert = (): void => {
  sileo.clear();
};

const showStatusAlert = ({ 
  type, 
  title, 
  description, 
  duration,
  onAction,
  actionLabel,
}: StatusAlertProps): void => {
  stopStatusAlert();

  // Para tipo "action", usar sileo.action con estructura específica
  if (type === "action" && onAction) {
    sileo.action({
      title,
      description,
      button: {
        title: actionLabel || "Confirmar",
        onClick: onAction,
      },
    });
    return;
  }

  sileo.show({
    title,
    description,
    type,
    duration: duration ?? 2000,
    autopilot: description ? { expand: 200, collapse: 3800 } : false,
    styles: {
      title: "sileo-title",
      description: "sileo-description",
      badge: "sileo-badge",
    },
  });
};

export default showStatusAlert;