/**
 * SearchBar — barra de filtros do topo da página.
 *
 * Controla três filtros: texto livre (nome), cargo e status.
 * Usa debounce implícito via useEffect no hook pai (filtra ao mudar).
 */
import { Search, X } from 'lucide-react'
import { COLUNAS_PIPELINE } from '../../services/pipeline'

export function SearchBar({ filtros, onChange }) {
  const temFiltro = filtros.nome || filtros.cargoDesejado || filtros.status

  const limpar = () => onChange({ nome: '', cargoDesejado: '', status: '' })

  return (
    <div className="flex items-center gap-2 flex-wrap">

      {/* Busca por nome */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          className="field pl-8 w-48 h-8 text-sm"
          placeholder="Buscar por nome..."
          value={filtros.nome}
          onChange={e => onChange({ ...filtros, nome: e.target.value })}
        />
      </div>

      {/* Filtro por cargo */}
      <input
        className="field w-44 h-8 text-sm"
        placeholder="Cargo..."
        value={filtros.cargoDesejado}
        onChange={e => onChange({ ...filtros, cargoDesejado: e.target.value })}
      />

      {/* Filtro por status */}
      <select
        className="field w-40 h-8 text-sm"
        value={filtros.status}
        onChange={e => onChange({ ...filtros, status: e.target.value })}
      >
        <option value="">Todos os status</option>
        {COLUNAS_PIPELINE.map(c => (
          <option key={c.status} value={c.status}>{c.label}</option>
        ))}
      </select>

      {/* Limpar filtros */}
      {temFiltro && (
        <button onClick={limpar} className="btn-ghost text-sm h-8">
          <X size={14} />
          Limpar
        </button>
      )}
    </div>
  )
}
