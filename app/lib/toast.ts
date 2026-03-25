export type ToastType = "success" | "error";

export type ToastInput = {
  message: string;
  type: ToastType;
};

export type Toast = ToastInput & {
  id: string;
};

export function createToast({ message, type }: ToastInput): Toast {
  return {
    id: createToastId(),
    message,
    type,
  };
}

export function isToast(value: unknown): value is Toast {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const toast = value as Partial<Toast>;

  return (
    typeof toast.id === "string" &&
    typeof toast.message === "string" &&
    (toast.type === "success" || toast.type === "error")
  );
}

function createToastId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
