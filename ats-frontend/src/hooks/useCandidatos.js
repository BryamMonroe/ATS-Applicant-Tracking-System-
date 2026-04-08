/**
 * Hook customizado: centraliza todo o estado e lógica dos candidatos.
 *
 * Por que extrair para um hook?
 * O componente de página (KanbanPage) ficaria imenso se misturasse
 * lógica de fetch, estado, callbacks e JSX. O hook cuida de TUDO
 * que é "como funciona", a página cuida de "como aparece".
 *
 * Retorna dados e funções prontas para o componente consumir.
 */
import { useState, useEffect, useCallback } from 'react'
import {
  listarCandidatos,
  criarCandidato,
  atualizarCandidato,
  moverPipeline,
  deletarCandidato,
  uploadCurriculo,
  removerCurriculo,
  extrairMensagemErro
} from '../services/api'

export function useCandidatos() {
  const [candidatos, setCandidatos]   = useState([])
  const [carregando, setCarregando]   = useState(true)
  const [erro, setErro]               = useState(null)
  const [filtros, setFiltros]         = useState({ nome: '', cargoDesejado: '', status: '' })

  // ─── FETCH ─────────────────────────────────────────────────────────────

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      // Monta params ignorando campos vazios
      const params = Object.fromEntries(
        Object.entries(filtros).filter(([, v]) => v !== '')
      )
      const dados = await listarCandidatos(params)
      setCandidatos(dados)
    } catch (e) {
      setErro(extrairMensagemErro(e))
    } finally {
      setCarregando(false)
    }
  }, [filtros])

  // Recarrega sempre que os filtros mudam
  useEffect(() => { carregar() }, [carregar])

  // ─── PIPELINE (Kanban drag-and-drop) ───────────────────────────────────

  /**
   * Atualização otimista: atualiza a UI imediatamente e reverte se a API falhar.
   * Isso dá a sensação de resposta instantânea ao arrastar o card.
   */
  const mover = useCallback(async (candidatoId, novoStatus) => {
    // Guarda estado anterior para rollback
    const anterior = candidatos
    // Atualiza localmente (otimista)
    setCandidatos(prev =>
      prev.map(c => c.id === candidatoId ? { ...c, status: novoStatus } : c)
    )
    try {
      await moverPipeline(candidatoId, novoStatus)
    } catch (e) {
      setCandidatos(anterior) // reverte em caso de erro
      setErro(extrairMensagemErro(e))
    }
  }, [candidatos])

  // ─── CRUD ──────────────────────────────────────────────────────────────

  const criar = useCallback(async (payload) => {
    const novo = await criarCandidato(payload)
    setCandidatos(prev => [novo, ...prev])
    return novo
  }, [])

  const atualizar = useCallback(async (id, payload) => {
    const atualizado = await atualizarCandidato(id, payload)
    setCandidatos(prev => prev.map(c => c.id === id ? atualizado : c))
    return atualizado
  }, [])

  const deletar = useCallback(async (id) => {
    await deletarCandidato(id)
    setCandidatos(prev => prev.filter(c => c.id !== id))
  }, [])

  // ─── CURRÍCULO ─────────────────────────────────────────────────────────

  const enviarCurriculo = useCallback(async (id, arquivo) => {
    const atualizado = await uploadCurriculo(id, arquivo)
    setCandidatos(prev => prev.map(c => c.id === id ? atualizado : c))
    return atualizado
  }, [])

  const apagarCurriculo = useCallback(async (id) => {
    const atualizado = await removerCurriculo(id)
    setCandidatos(prev => prev.map(c => c.id === id ? atualizado : c))
    return atualizado
  }, [])

  // ─── HELPERS ───────────────────────────────────────────────────────────

  /** Retorna candidatos agrupados por status — alimenta as colunas do Kanban */
  const porStatus = useCallback((status) =>
    candidatos.filter(c => c.status === status),
  [candidatos])

  return {
    candidatos,
    carregando,
    erro,
    filtros,
    setFiltros,
    carregar,
    mover,
    criar,
    atualizar,
    deletar,
    enviarCurriculo,
    apagarCurriculo,
    porStatus,
  }
}
