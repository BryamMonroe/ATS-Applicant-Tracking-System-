import { useState, useCallback } from "react";
import { Plus, RefreshCw, Loader2 } from "lucide-react";
import { KanbanBoard } from "../components/kanban/KanbanBoard";
import { CandidatoModal } from "../components/candidato/CandidatoModal";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { SearchBar } from "../components/ui/SearchBar";
import { Toast } from "../components/ui/Toast";
import { useCandidatos } from "../hooks/useCandidatos";
import { downloadCurriculo, extrairMensagemErro } from "../services/api";
import { COLUNAS_PIPELINE } from "../services/pipeline";

export function KanbanPage() {
  const {
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
  } = useCandidatos();

  const [modalAberto, setModalAberto] = useState(false);
  const [candidatoEditando, setCandidatoEditando] = useState(null);
  const [candidatoDeletando, setCandidatoDeletando] = useState(null);

  const [toast, setToast] = useState(null);
  const mostrarToast = (mensagem, tipo = "sucesso") =>
    setToast({ mensagem, tipo });

  const abrirCriar = () => {
    setCandidatoEditando(null);
    setModalAberto(true);
  };

  const abrirEditar = (candidato) => {
    setCandidatoEditando(candidato);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setCandidatoEditando(null);
  };

  const handleSalvar = useCallback(
    async (form) => {
      if (candidatoEditando) {
        const atualizado = await atualizar(candidatoEditando.id, form);
        mostrarToast("Candidato atualizado!");
        return atualizado;
      } else {
        const novo = await criar(form);
        mostrarToast("Candidato cadastrado!");
        return novo;
      }
    },
    [candidatoEditando, atualizar, criar],
  );

  const handleDeletar = async () => {
    try {
      await deletar(candidatoDeletando.id);
      setCandidatoDeletando(null);
      mostrarToast("Candidato removido.");
    } catch (e) {
      mostrarToast(extrairMensagemErro(e), "erro");
    }
  };

  const handleDownload = async (id) => {
    try {
      await downloadCurriculo(id);
    } catch (e) {
      mostrarToast(extrairMensagemErro(e), "erro");
    }
  };

  const handleMover = async (id, status) => {
    try {
      await mover(id, status);
    } catch (e) {
      mostrarToast(extrairMensagemErro(e), "erro");
    }
  };

  const stats = COLUNAS_PIPELINE.map((c) => ({
    ...c,
    total: candidatos.filter((x) => x.status === c.status).length,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-100 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center gap-4">
          {/* Logo / título */}
          <div className="flex items-center gap-2.5 mr-4">
            <div className="w-7 h-7 rounded-lg bg-accent-500 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <h1 className="font-display text-lg text-stone-800 leading-none">
              Recrutamento
            </h1>
          </div>

          {/* Filtros */}
          <SearchBar filtros={filtros} onChange={setFiltros} />

          {/* Ações */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={carregar}
              className="btn-ghost h-8 w-8 p-0 justify-center"
              title="Recarregar"
              disabled={carregando}
            >
              <RefreshCw
                size={14}
                className={carregando ? "animate-spin" : ""}
              />
            </button>
            <button onClick={abrirCriar} className="btn-primary h-8 text-sm">
              <Plus size={14} />
              Novo candidato
            </button>
          </div>
        </div>
      </header>

      {/* Stats bar — contador por coluna */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-[1600px] mx-auto px-6 py-2 flex items-center gap-6 overflow-x-auto">
          <span className="text-xs text-stone-400 shrink-0">
            {candidatos.length} candidato{candidatos.length !== 1 ? "s" : ""}
          </span>
          {stats.map(
            (s) =>
              s.total > 0 && (
                <div
                  key={s.status}
                  className="flex items-center gap-1.5 shrink-0"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${s.corPonto}`} />
                  <span className="text-xs text-stone-500">{s.label}</span>
                  <span className={`status-badge ${s.cor} py-0`}>
                    {s.total}
                  </span>
                </div>
              ),
          )}
        </div>
      </div>

      {/* Conteúdo principal */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-5">
        {/* Estado de erro */}
        {erro && (
          <div
            className="bg-red-50 border border-red-200 text-red-600 text-sm
                          px-4 py-3 rounded-xl mb-4 flex items-center gap-2"
          >
            {erro}
            <button onClick={carregar} className="ml-auto text-xs underline">
              Tentar novamente
            </button>
          </div>
        )}

        {/* Loading inicial */}
        {carregando && candidatos.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-stone-300" />
          </div>
        ) : (
          <KanbanBoard
            candidatos={candidatos}
            onMover={handleMover}
            onEditar={abrirEditar}
            onDeletar={setCandidatoDeletando}
            onDownload={handleDownload}
          />
        )}
      </main>

      {/* Modal de criação/edição */}
      {modalAberto && (
        <CandidatoModal
          candidato={candidatoEditando}
          onSalvar={handleSalvar}
          onFechar={fecharModal}
          onEnviarCurriculo={enviarCurriculo}
          onApagarCurriculo={apagarCurriculo}
        />
      )}

      {/* Modal de confirmação de deleção */}
      {candidatoDeletando && (
        <ConfirmModal
          titulo="Remover candidato"
          descricao={`Tem certeza que deseja remover "${candidatoDeletando.nome}"? Esta ação não pode ser desfeita.`}
          onConfirmar={handleDeletar}
          onCancelar={() => setCandidatoDeletando(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          mensagem={toast.mensagem}
          tipo={toast.tipo}
          onFechar={() => setToast(null)}
        />
      )}
    </div>
  );
}
