/**
 * KanbanColuna — coluna do board onde os cards são soltos.
 *
 * useDroppable registra este elemento como "zona de drop" no dnd-kit.
 * Quando um card é solto aqui, o dnd-kit identifica pelo `id` (= status)
 * e chamamos moverPipeline com o novo status.
 *
 * SortableContext lista os IDs dos itens dentro desta coluna,
 * permitindo reordenação entre eles (dnd-kit precisa dessa informação
 * para calcular a posição do placeholder durante o drag).
 */
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CandidatoCard } from './CandidatoCard'

export function KanbanColuna({ config, candidatos, onEditar, onDeletar, onDownload }) {
  const { setNodeRef, isOver } = useDroppable({ id: config.status })

  return (
    <div className="flex flex-col w-64 shrink-0">
      {/* Header da coluna */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-t-xl ${config.corHeader}`}>
        <span className={`w-2 h-2 rounded-full ${config.corPonto}`} />
        <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
          {config.label}
        </span>
        <span className="ml-auto text-xs font-medium text-stone-400">
          {candidatos.length}
        </span>
      </div>

      {/* Área de drop */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[120px] p-2 rounded-b-xl border border-t-0
                    transition-colors duration-150 space-y-2
                    ${isOver
                      ? 'bg-accent-50 border-accent-200'
                      : 'bg-stone-100/60 border-stone-200/60'
                    }`}
      >
        <SortableContext
          items={candidatos.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {candidatos.map(candidato => (
            <CandidatoCard
              key={candidato.id}
              candidato={candidato}
              onEditar={onEditar}
              onDeletar={onDeletar}
              onDownload={onDownload}
            />
          ))}
        </SortableContext>

        {candidatos.length === 0 && (
          <div className="flex items-center justify-center h-16">
            <p className="text-xs text-stone-300">Nenhum candidato</p>
          </div>
        )}
      </div>
    </div>
  )
}
