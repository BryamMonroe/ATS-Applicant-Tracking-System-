/**
 * ConfirmModal — diálogo de confirmação genérico.
 * Reutilizável para qualquer ação destrutiva.
 */
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useState } from 'react'

export function ConfirmModal({ titulo, descricao, onConfirmar, onCancelar }) {
  const [carregando, setCarregando] = useState(false)

  const handleConfirmar = async () => {
    setCarregando(true)
    try { await onConfirmar() } finally { setCarregando(false) }
  }

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] z-50
                    flex items-center justify-center p-4 animate-fade-in">
      <div className="card w-full max-w-sm shadow-modal p-6">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-800 text-sm">{titulo}</h3>
            <p className="text-sm text-stone-500 mt-1">{descricao}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-5 justify-end">
          <button onClick={onCancelar} className="btn-ghost">
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={carregando}
            className="btn-primary bg-red-500 hover:bg-red-600 active:bg-red-700"
          >
            {carregando && <Loader2 size={14} className="animate-spin" />}
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
