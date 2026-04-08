/**
 * CandidatoModal — formulário de criação e edição de candidato.
 *
 * Recebe `candidato` quando é edição (pré-preenche os campos),
 * ou null/undefined quando é criação (campos em branco).
 *
 * Lida com upload de currículo: o arquivo é armazenado em estado
 * local e enviado numa chamada separada após salvar o candidato.
 *
 * Gerenciamento de erro por campo: cada campo tem seu próprio
 * estado de erro para mostrar mensagens inline, igual ao que
 * o GlobalExceptionHandler retorna (objeto { campo: mensagem }).
 */
import { useState, useEffect, useRef } from 'react'
import { X, Upload, FileText, Trash2, Loader2 } from 'lucide-react'
import { COLUNAS_PIPELINE, formatarTamanho } from '../../services/pipeline'
import { extrairMensagemErro } from '../../services/api'

const CAMPOS_VAZIOS = {
  nome: '',
  email: '',
  telefone: '',
  cargoDesejado: '',
  status: 'APLICADO',
  observacoes: '',
}

export function CandidatoModal({ candidato, onSalvar, onFechar, onEnviarCurriculo, onApagarCurriculo }) {
  const [form, setForm]             = useState(CAMPOS_VAZIOS)
  const [arquivo, setArquivo]       = useState(null)
  const [erros, setErros]           = useState({})
  const [salvando, setSalvando]     = useState(false)
  const [erroGeral, setErroGeral]   = useState('')
  const inputFileRef                = useRef()

  const edicao = !!candidato

  // Pré-preenche o formulário ao editar
  useEffect(() => {
    if (candidato) {
      setForm({
        nome:          candidato.nome          || '',
        email:         candidato.email         || '',
        telefone:      candidato.telefone      || '',
        cargoDesejado: candidato.cargoDesejado || '',
        status:        candidato.status        || 'APLICADO',
        observacoes:   candidato.observacoes   || '',
      })
    } else {
      setForm(CAMPOS_VAZIOS)
    }
    setArquivo(null)
    setErros({})
    setErroGeral('')
  }, [candidato])

  const set = (campo) => (e) => {
    setForm(f => ({ ...f, [campo]: e.target.value }))
    setErros(e => ({ ...e, [campo]: '' }))
  }

  const handleArquivo = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setErros(e => ({ ...e, arquivo: 'Apenas PDF é aceito.' }))
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErros(e => ({ ...e, arquivo: 'Arquivo muito grande (máx. 10MB).' }))
      return
    }
    setArquivo(file)
    setErros(e => ({ ...e, arquivo: '' }))
  }

  const handleSubmit = async () => {
    setSalvando(true)
    setErroGeral('')
    try {
      // 1. Salva o candidato (cria ou atualiza)
      const salvo = await onSalvar(form)

      // 2. Se selecionou um arquivo novo, faz o upload
      if (arquivo) {
        await onEnviarCurriculo(salvo.id, arquivo)
      }

      onFechar()
    } catch (e) {
      // Trata erros de validação por campo vindos do backend
      const camposInvalidos = e?.response?.data?.campos
      if (camposInvalidos) {
        setErros(camposInvalidos)
      } else {
        setErroGeral(extrairMensagemErro(e))
      }
    } finally {
      setSalvando(false)
    }
  }

  const handleApagarCurriculo = async () => {
    try {
      await onApagarCurriculo(candidato.id)
      setArquivo(null)
    } catch (e) {
      setErroGeral(extrairMensagemErro(e))
    }
  }

  return (
    /* Overlay */
    <div
      className="fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] z-50
                 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div className="card w-full max-w-lg max-h-[90vh] flex flex-col shadow-modal">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="font-display text-lg text-stone-800">
            {edicao ? 'Editar candidato' : 'Novo candidato'}
          </h2>
          <button onClick={onFechar} className="btn-ghost p-1.5 rounded-lg">
            <X size={16} />
          </button>
        </div>

        {/* Corpo com scroll */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Erro geral */}
          {erroGeral && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
              {erroGeral}
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="field-label">Nome completo *</label>
            <input className={`field ${erros.nome ? 'border-red-300 focus:ring-red-200' : ''}`}
              placeholder="Ana Paula Silva"
              value={form.nome} onChange={set('nome')} />
            {erros.nome && <p className="text-xs text-red-500 mt-1">{erros.nome}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="field-label">E-mail *</label>
            <input className={`field ${erros.email ? 'border-red-300' : ''}`}
              type="email" placeholder="ana@email.com"
              value={form.email} onChange={set('email')} />
            {erros.email && <p className="text-xs text-red-500 mt-1">{erros.email}</p>}
          </div>

          {/* Telefone + Cargo (lado a lado) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Telefone</label>
              <input className="field" placeholder="(12) 99999-0000"
                value={form.telefone} onChange={set('telefone')} />
            </div>
            <div>
              <label className="field-label">Cargo desejado *</label>
              <input className={`field ${erros.cargoDesejado ? 'border-red-300' : ''}`}
                placeholder="Backend Developer"
                value={form.cargoDesejado} onChange={set('cargoDesejado')} />
              {erros.cargoDesejado && <p className="text-xs text-red-500 mt-1">{erros.cargoDesejado}</p>}
            </div>
          </div>

          {/* Status (só na edição — novo candidato começa como APLICADO) */}
          {edicao && (
            <div>
              <label className="field-label">Etapa do pipeline</label>
              <select className="field" value={form.status} onChange={set('status')}>
                {COLUNAS_PIPELINE.map(c => (
                  <option key={c.status} value={c.status}>{c.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="field-label">Observações</label>
            <textarea className="field resize-none" rows={3}
              placeholder="Notas internas sobre o candidato..."
              value={form.observacoes} onChange={set('observacoes')} />
          </div>

          {/* Upload de currículo */}
          <div>
            <label className="field-label">Currículo (PDF)</label>

            {/* Mostra currículo atual se existir */}
            {edicao && candidato.temCurriculo && !arquivo && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50
                              border border-stone-200 mb-2">
                <FileText size={14} className="text-accent-500 shrink-0" />
                <span className="text-sm text-stone-600 truncate flex-1">
                  {candidato.curriculoNomeOriginal || 'Currículo cadastrado'}
                </span>
                {candidato.curriculoTamanhoBytes && (
                  <span className="text-xs text-stone-400 shrink-0">
                    {formatarTamanho(candidato.curriculoTamanhoBytes)}
                  </span>
                )}
                <button
                  onClick={handleApagarCurriculo}
                  className="text-red-400 hover:text-red-600 p-1 rounded"
                  title="Remover currículo"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}

            {/* Arquivo selecionado */}
            {arquivo && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-accent-50
                              border border-accent-200 mb-2">
                <FileText size={14} className="text-accent-500" />
                <span className="text-sm text-accent-700 truncate flex-1">{arquivo.name}</span>
                <span className="text-xs text-accent-500">{formatarTamanho(arquivo.size)}</span>
                <button onClick={() => setArquivo(null)} className="text-accent-400 hover:text-accent-700 p-1">
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Botão de seleção */}
            <button
              onClick={() => inputFileRef.current?.click()}
              className="btn-ghost border border-dashed border-stone-300 w-full
                         justify-center py-2.5 text-stone-400 hover:text-stone-600
                         hover:border-stone-400"
            >
              <Upload size={14} />
              {arquivo || (edicao && candidato.temCurriculo)
                ? 'Substituir PDF'
                : 'Selecionar PDF'}
            </button>
            <input
              ref={inputFileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleArquivo}
            />
            {erros.arquivo && <p className="text-xs text-red-500 mt-1">{erros.arquivo}</p>}
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-stone-100">
          <button onClick={onFechar} className="btn-ghost">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={salvando} className="btn-primary">
            {salvando && <Loader2 size={14} className="animate-spin" />}
            {edicao ? 'Salvar alterações' : 'Cadastrar'}
          </button>
        </div>
      </div>
    </div>
  )
}
