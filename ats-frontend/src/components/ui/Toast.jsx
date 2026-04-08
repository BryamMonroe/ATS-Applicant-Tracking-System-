import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export function Toast({ mensagem, tipo = "sucesso", onFechar }) {
  useEffect(() => {
    const t = setTimeout(onFechar, 3500);
    return () => clearTimeout(t);
  }, [onFechar]);

  const estilos = {
    sucesso: "bg-emerald-50 border-emerald-200 text-emerald-800",
    erro: "bg-red-50 border-red-200 text-red-700",
  };

  const Icone = tipo === "sucesso" ? CheckCircle : XCircle;
  const corIcone = tipo === "sucesso" ? "text-emerald-500" : "text-red-500";

  return (
    <div
      className={`fixed bottom-5 right-5 z-[100] flex items-center gap-2.5
                     px-4 py-3 rounded-xl border shadow-card-hover
                     animate-slide-up max-w-sm ${estilos[tipo]}`}
    >
      <Icone size={16} className={`shrink-0 ${corIcone}`} />
      <span className="text-sm font-medium flex-1">{mensagem}</span>
      <button onClick={onFechar} className="p-0.5 opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}
