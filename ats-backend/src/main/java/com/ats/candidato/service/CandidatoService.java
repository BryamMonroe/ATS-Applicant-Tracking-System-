package com.ats.candidato.service;

import com.ats.candidato.domain.Candidato;
import com.ats.candidato.domain.StatusPipeline;
import com.ats.candidato.dto.CandidatoRequest;
import com.ats.candidato.dto.CandidatoResponse;
import com.ats.candidato.dto.StatusUpdateRequest;
import com.ats.candidato.repository.CandidatoRepository;
import com.ats.exception.ConflitoDeDadosException;
import com.ats.exception.RecursoNaoEncontradoException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Camada de serviço: contém toda a lógica de negócio do ATS.
 *
 * Responsabilidades desta camada:
 * - Validações de negócio (e-mail único, status válido etc.)
 * - Orquestração: busca no banco → aplica regras → salva → retorna DTO
 * - Transações: @Transactional garante que operações de escrita
 *   sejam atômicas (tudo funciona ou tudo reverte).
 *
 * O que ela NÃO faz:
 * - Não conhece HTTP (sem HttpServletRequest, sem status codes)
 * - Não faz parsing de JSON
 * - Não acessa arquivos (isso fica no FileStorageService, Fase 2)
 *
 * @RequiredArgsConstructor (Lombok) → gera construtor com todos os
 * campos final, que o Spring usa para injetar as dependências.
 * É equivalente a @Autowired mas mais limpo e testável.
 */
@Service
@RequiredArgsConstructor
public class CandidatoService {

    private final CandidatoRepository repository;

    // ─── LEITURA ──────────────────────────────────────────────────────────

    /**
     * Lista todos os candidatos.
     * readOnly = true → dica para o JPA não rastrear mudanças nas entidades,
     * o que melhora performance em consultas.
     */
    @Transactional(readOnly = true)
    public List<CandidatoResponse> listarTodos() {
        return repository.findAll()
                .stream()
                .map(CandidatoResponse::from)
                .toList();
    }

    /**
     * Lista candidatos por status — usado para montar cada coluna do Kanban.
     */
    @Transactional(readOnly = true)
    public List<CandidatoResponse> listarPorStatus(StatusPipeline status) {
        return repository.findByStatus(status)
                .stream()
                .map(CandidatoResponse::from)
                .toList();
    }

    /**
     * Busca um candidato por ID.
     * orElseThrow → lança a exceção customizada se não encontrar.
     * O GlobalExceptionHandler a converte em HTTP 404.
     */
    @Transactional(readOnly = true)
    public CandidatoResponse buscarPorId(Long id) {
        Candidato candidato = buscarEntidadePorId(id);
        return CandidatoResponse.from(candidato);
    }

    // ─── ESCRITA ──────────────────────────────────────────────────────────

    /**
     * Cadastra um novo candidato.
     *
     * Fluxo:
     * 1. Valida e-mail único
     * 2. Converte DTO → entidade
     * 3. Salva no banco (Flyway já criou a tabela)
     * 4. Retorna DTO de resposta
     */
    @Transactional
    public CandidatoResponse cadastrar(CandidatoRequest request) {
        validarEmailUnico(request.email(), null);

        Candidato candidato = Candidato.builder()
                .nome(request.nome().trim())
                .email(request.email().toLowerCase().trim())
                .telefone(request.telefone())
                .cargoDesejado(request.cargoDesejado().trim())
                .observacoes(request.observacoes())
                // status começa como APLICADO (default no Builder e no banco)
                .build();

        Candidato salvo = repository.save(candidato);
        return CandidatoResponse.from(salvo);
    }

    /**
     * Atualiza dados de um candidato existente.
     *
     * Usamos o padrão "busca → altera campos → save" em vez de
     * criar uma nova entidade, porque assim o JPA detecta apenas
     * as colunas alteradas e gera um UPDATE otimizado.
     */
    @Transactional
    public CandidatoResponse atualizar(Long id, CandidatoRequest request) {
        Candidato candidato = buscarEntidadePorId(id);

        validarEmailUnico(request.email(), id);

        candidato.setNome(request.nome().trim());
        candidato.setEmail(request.email().toLowerCase().trim());
        candidato.setTelefone(request.telefone());
        candidato.setCargoDesejado(request.cargoDesejado().trim());
        candidato.setObservacoes(request.observacoes());

        // Não precisamos chamar save() explicitamente aqui:
        // dentro de @Transactional, o JPA detecta mudanças na entidade
        // gerenciada e faz o UPDATE automaticamente ao fim da transação
        // (isso se chama "dirty checking").
        return CandidatoResponse.from(candidato);
    }

    /**
     * Move o candidato para uma nova etapa do pipeline.
     * Endpoint separado (PATCH /status) porque é uma operação
     * de negócio distinta: mover no kanban.
     */
    @Transactional
    public CandidatoResponse atualizarStatus(Long id, StatusUpdateRequest request) {
        Candidato candidato = buscarEntidadePorId(id);
        candidato.setStatus(request.status());
        return CandidatoResponse.from(candidato);
    }

    /**
     * Remove um candidato. Também remove o currículo (Fase 2 fará isso via FileStorageService).
     */
    @Transactional
    public void deletar(Long id) {
        Candidato candidato = buscarEntidadePorId(id);
        repository.delete(candidato);
    }

    // ─── MÉTODOS INTERNOS ─────────────────────────────────────────────────

    /**
     * Busca a ENTIDADE (não o DTO) por ID.
     * Método de uso interno: outros serviços (FileStorageService na Fase 2)
     * precisam da entidade para alterar campos como curriculoPath.
     * Por isso é package-private (sem modificador de acesso).
     */
    Candidato buscarEntidadePorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Candidato com id " + id + " não encontrado"));
    }

    /**
     * Garante unicidade do e-mail.
     * Se `idIgnorar` for null → validação de cadastro (novo candidato).
     * Se `idIgnorar` tiver valor → validação de atualização (ignora o próprio candidato).
     */
    private void validarEmailUnico(String email, Long idIgnorar) {
        boolean existe = (idIgnorar == null)
                ? repository.existsByEmail(email.toLowerCase().trim())
                : repository.existsByEmailAndIdNot(email.toLowerCase().trim(), idIgnorar);

        if (existe) {
            throw new ConflitoDeDadosException("Já existe um candidato com o e-mail: " + email);
        }
    }
}
