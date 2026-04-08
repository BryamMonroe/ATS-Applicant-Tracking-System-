import { useState, useEffect, useCallback } from "react";
import {
  listarCandidatos,
  criarCandidato,
  atualizarCandidato,
  moverPipeline,
  deletarCandidato,
  uploadCurriculo,
  removerCurriculo,
  extrairMensagemErro,
} from "../services/api";

export function useCandidatos() {
  const [candidatos, setCandidatos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtros, setFiltros] = useState({
    nome: "",
    cargoDesejado: "",
    status: "",
  });

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const params = Object.fromEntries(
        Object.entries(filtros).filter(([, v]) => v !== ""),
      );
      const dados = await listarCandidatos(params);
      setCandidatos(dados);
    } catch (e) {
      setErro(extrairMensagemErro(e));
    } finally {
      setCarregando(false);
    }
  }, [filtros]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const mover = useCallback(
    async (candidatoId, novoStatus) => {
      const anterior = candidatos;

      setCandidatos((prev) =>
        prev.map((c) =>
          c.id === candidatoId ? { ...c, status: novoStatus } : c,
        ),
      );
      try {
        await moverPipeline(candidatoId, novoStatus);
      } catch (e) {
        setCandidatos(anterior);
        setErro(extrairMensagemErro(e));
      }
    },
    [candidatos],
  );

  const criar = useCallback(async (payload) => {
    const novo = await criarCandidato(payload);
    setCandidatos((prev) => [novo, ...prev]);
    return novo;
  }, []);

  const atualizar = useCallback(async (id, payload) => {
    const atualizado = await atualizarCandidato(id, payload);
    setCandidatos((prev) => prev.map((c) => (c.id === id ? atualizado : c)));
    return atualizado;
  }, []);

  const deletar = useCallback(async (id) => {
    await deletarCandidato(id);
    setCandidatos((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const enviarCurriculo = useCallback(async (id, arquivo) => {
    const atualizado = await uploadCurriculo(id, arquivo);
    setCandidatos((prev) => prev.map((c) => (c.id === id ? atualizado : c)));
    return atualizado;
  }, []);

  const apagarCurriculo = useCallback(async (id) => {
    const atualizado = await removerCurriculo(id);
    setCandidatos((prev) => prev.map((c) => (c.id === id ? atualizado : c)));
    return atualizado;
  }, []);

  const porStatus = useCallback(
    (status) => candidatos.filter((c) => c.status === status),
    [candidatos],
  );

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
  };
}
