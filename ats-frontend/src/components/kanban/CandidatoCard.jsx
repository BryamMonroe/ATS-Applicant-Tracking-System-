import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FileText, Download, Trash2, Pencil } from "lucide-react";
import {
  CONFIG_STATUS,
  iniciais,
  corAvatar,
  formatarData,
} from "../../services/pipeline";

export function CandidatoCard({ candidato, onEditar, onDeletar, onDownload }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidato.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  const config = CONFIG_STATUS[candidato.status];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="card p-3 cursor-grab active:cursor-grabbing
                 hover:shadow-card-hover transition-all duration-200
                 animate-slide-up group"
    >
      {/* Área de drag — só o handle superior */}
      <div {...listeners} className="mb-2">
        {/* Avatar + nome */}
        <div className="flex items-start gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center
                          text-xs font-semibold shrink-0 ${corAvatar(candidato.nome)}`}
          >
            {iniciais(candidato.nome)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-stone-800 leading-tight truncate text-sm">
              {candidato.nome}
            </p>
            <p className="text-xs text-stone-400 truncate mt-0.5">
              {candidato.cargoDesejado}
            </p>
          </div>
        </div>
      </div>

      {/* Indicador de currículo */}
      {candidato.temCurriculo && (
        <div className="flex items-center gap-1 mt-2 mb-1">
          <FileText size={11} className="text-stone-400 shrink-0" />
          <span className="text-xs text-stone-400 truncate">
            {candidato.curriculoNomeOriginal || "Currículo anexado"}
          </span>
        </div>
      )}

      {/* Data de cadastro */}
      <p className="text-xs text-stone-300 mt-2">
        {formatarData(candidato.dataCadastro)}
      </p>

      {/* Ações — aparecem no hover */}
      <div
        className="flex items-center gap-1 mt-2 pt-2 border-t border-stone-100
                      opacity-0 group-hover:opacity-100 transition-opacity duration-150"
      >
        <button
          onClick={() => onEditar(candidato)}
          className="btn-ghost text-xs py-1 px-2 flex-1 justify-center"
          title="Editar candidato"
        >
          <Pencil size={12} />
          Editar
        </button>

        {candidato.temCurriculo && (
          <button
            onClick={() => onDownload(candidato.id)}
            className="btn-ghost text-xs py-1 px-2"
            title="Baixar currículo"
          >
            <Download size={12} />
          </button>
        )}

        <button
          onClick={() => onDeletar(candidato)}
          className="btn-ghost text-xs py-1 px-2 text-red-400 hover:text-red-600 hover:bg-red-50"
          title="Remover candidato"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
