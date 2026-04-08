/**
 * Camada de serviço de API — centraliza TODAS as chamadas HTTP.
 *
 * Por que centralizar em vez de chamar axios diretamente nos componentes?
 * 1. Se a URL base mudar, você altera num só lugar.
 * 2. Os componentes ficam desacoplados de axios — só conhecem os dados.
 * 3. Facilita mockar nos testes: substitua este módulo inteiro.
 *
 * Cada função retorna os dados já extraídos do `response.data`,
 * então os componentes recebem diretamente o objeto/array desejado.
 */
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',  // proxied pelo Vite para http://localhost:8080/api
  headers: { 'Content-Type': 'application/json' }
})

// ─── CANDIDATOS ──────────────────────────────────────────────────────────────

/** Lista todos os candidatos, opcionalmente filtrado por status */
export const listarCandidatos = async (filtros = {}) => {
  const { data } = await api.get('/candidatos', { params: filtros })
  return data
}

/** Busca um candidato por ID */
export const buscarCandidato = async (id) => {
  const { data } = await api.get(`/candidatos/${id}`)
  return data
}

/** Cria um novo candidato */
export const criarCandidato = async (payload) => {
  const { data } = await api.post('/candidatos', payload)
  return data
}

/** Atualiza todos os dados de um candidato */
export const atualizarCandidato = async (id, payload) => {
  const { data } = await api.put(`/candidatos/${id}`, payload)
  return data
}

/**
 * Move o candidato no pipeline (Kanban drag-and-drop).
 * Usa PATCH para atualização parcial (só o status).
 */
export const moverPipeline = async (id, status) => {
  const { data } = await api.patch(`/candidatos/${id}/status`, { status })
  return data
}

/** Remove um candidato */
export const deletarCandidato = async (id) => {
  await api.delete(`/candidatos/${id}`)
}

// ─── CURRÍCULO ────────────────────────────────────────────────────────────────

/**
 * Faz upload do PDF do currículo.
 * Usa FormData para envio multipart/form-data (obrigatório para arquivos).
 * O header Content-Type é sobrescrito para multipart nesta chamada.
 */
export const uploadCurriculo = async (candidatoId, arquivo) => {
  const formData = new FormData()
  formData.append('arquivo', arquivo)

  const { data } = await api.post(`/candidatos/${candidatoId}/curriculo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

/**
 * Faz download do currículo como Blob e abre no navegador.
 * responseType: 'blob' faz o axios tratar a resposta como binário.
 */
export const downloadCurriculo = async (candidatoId) => {
  const response = await api.get(`/candidatos/${candidatoId}/curriculo`, {
    responseType: 'blob'
  })

  // Cria URL temporária para o blob e aciona o download
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `curriculo-${candidatoId}.pdf`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

/** Remove o currículo de um candidato */
export const removerCurriculo = async (candidatoId) => {
  const { data } = await api.delete(`/candidatos/${candidatoId}/curriculo`)
  return data
}

// ─── UTILITÁRIOS ──────────────────────────────────────────────────────────────

/**
 * Extrai a mensagem de erro de uma resposta axios de forma amigável.
 * O GlobalExceptionHandler do backend sempre retorna { mensagem: "..." }.
 */
export const extrairMensagemErro = (error) => {
  return error?.response?.data?.mensagem
      || error?.response?.data?.erro
      || error?.message
      || 'Erro inesperado. Tente novamente.'
}
