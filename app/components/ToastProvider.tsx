import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { createToast, type Toast, type ToastInput } from "~/lib/toast";

const TOAST_DURATION_MS = 4500;

type ToastContextValue = {
  pushToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({
  children,
  initialToast,
}: {
  children: React.ReactNode;
  initialToast?: Toast | null;
}) {
  const [toasts, setToasts] = useState<Toast[]>(() =>
    initialToast ? [initialToast] : [],
  );
  const lastInitialToastId = useRef<string | null>(initialToast?.id ?? null);

  useEffect(() => {
    if (!initialToast || lastInitialToastId.current === initialToast.id) {
      return;
    }

    lastInitialToastId.current = initialToast.id;
    setToasts((currentToasts) => [...currentToasts, initialToast]);
  }, [initialToast]);

  function pushToast(toast: ToastInput) {
    setToasts((currentToasts) => [...currentToasts, createToast(toast)]);
  }

  function dismissToast(toastId: string) {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== toastId),
    );
  }

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}
      <ToastViewport onDismiss={dismissToast} toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return context;
}

function ToastViewport({
  onDismiss,
  toasts,
}: {
  onDismiss: (toastId: string) => void;
  toasts: Toast[];
}) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-atomic="true"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:justify-end sm:px-6"
      role="status"
    >
      <div className="flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} onDismiss={onDismiss} toast={toast} />
        ))}
      </div>
    </div>
  );
}

function ToastCard({
  onDismiss,
  toast,
}: {
  onDismiss: (toastId: string) => void;
  toast: Toast;
}) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onDismiss(toast.id);
    }, TOAST_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [onDismiss, toast.id]);

  const accentClasses =
    toast.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
      : "border-red-200 bg-red-50 text-red-950";
  const label = toast.type === "success" ? "Success" : "Error";

  return (
    <section
      className={`pointer-events-auto rounded-3xl border p-4 shadow-lg shadow-stone-950/8 backdrop-blur ${accentClasses}`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em]">
            {label}
          </p>
          <p className="mt-1 text-sm leading-6">{toast.message}</p>
        </div>
        <button
          aria-label="Dismiss notification"
          className="rounded-full px-2 py-1 text-xs font-medium text-current/70 transition hover:bg-white/60 hover:text-current"
          onClick={() => onDismiss(toast.id)}
          type="button"
        >
          Close
        </button>
      </div>
    </section>
  );
}
