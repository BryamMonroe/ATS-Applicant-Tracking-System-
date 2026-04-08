package com.ats.candidato.controller;

import com.ats.candidato.domain.StatusPipeline;
import com.ats.candidato.dto.CandidatoRequest;
import com.ats.candidato.dto.CandidatoResponse;
import com.ats.candidato.dto.StatusUpdateRequest;
import com.ats.candidato.service.CandidatoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller: ponto de entrada HTTP da API.
 *
 * Responsabilidades ÚNICAS desta camada:
 * - Receber a requisição HTTP
 * - Chamar o serviço correto
 * - Retornar o ResponseEntity com o status HTTP adequado
 *
 * O que ela NÃO faz:
 * - Nenhuma regra de negócio aqui (isso é responsabilidade do Service)
 * - Nenhum acesso direto ao banco
 *
 * @RestController  = @Controller + @ResponseBody (serializa o retorno em JSON automaticamente)
 * @RequestMapping  = prefixo de rota para todos os métodos da classe
 * @CrossOrigin     = permite chamadas do frontend React (CORS)
 *                    Em produção, restringir para o domínio real.
 *
 * Convenção de status HTTP usada:
 *   201 Created   → recurso criado com sucesso (POST)
 *   200 OK        → consulta ou atualização bem-sucedida (GET, PUT, PATCH)
 *   204 No Content → deleção bem-sucedida (DELETE — sem body)
 */
@Tag(name = "Candidatos", description = "Gerenciamento de candidatos no pipeline de recrutamento")
@RestController
@RequestMapping("/api/candidatos")
@CrossOrigin(origins = "*")  // TODO: restringir ao domínio do frontend em produção
@RequiredArgsConstructor
public class CandidatoController {

    private final CandidatoService service;

    // ─── GET ──────────────────────────────────────────────────────────────

    @Operation(summary = "Lista todos os candidatos",
               description = "Retorna todos ou filtra por status se o parâmetro for informado")
    @GetMapping
    public ResponseEntity<List<CandidatoResponse>> listar(
            @Parameter(description = "Filtrar por status do pipeline")
            @RequestParam(required = false) StatusPipeline status) {

        List<CandidatoResponse> candidatos = (status != null)
                ? service.listarPorStatus(status)
                : service.listarTodos();

        return ResponseEntity.ok(candidatos);
    }

    @Operation(summary = "Busca candidato por ID")
    @GetMapping("/{id}")
    public ResponseEntity<CandidatoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    // ─── POST ─────────────────────────────────────────────────────────────

    @Operation(summary = "Cadastra novo candidato")
    @PostMapping
    public ResponseEntity<CandidatoResponse> cadastrar(@Valid @RequestBody CandidatoRequest request) {
        CandidatoResponse criado = service.cadastrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    // ─── PUT ──────────────────────────────────────────────────────────────

    @Operation(summary = "Atualiza dados do candidato")
    @PutMapping("/{id}")
    public ResponseEntity<CandidatoResponse> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody CandidatoRequest request) {
        return ResponseEntity.ok(service.atualizar(id, request));
    }


    @Operation(summary = "Move candidato para outra etapa do pipeline")
    @PatchMapping("/{id}/status")
    public ResponseEntity<CandidatoResponse> atualizarStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(service.atualizarStatus(id, request));
    }

    // ─── DELETE ───────────────────────────────────────────────────────────

    /**
     * 204 No Content → remoção bem-sucedida. Sem body na resposta.
     * O cliente sabe que funcionou pelo status code — não precisa de JSON.
     */
    @Operation(summary = "Remove candidato")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
