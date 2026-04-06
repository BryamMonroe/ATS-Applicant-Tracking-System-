package com.ats.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Tratamento centralizado de exceções para toda a API.
 *
 * @RestControllerAdvice intercepta todas as exceções lançadas
 * em qualquer @RestController e decide qual resposta HTTP retornar.
 *
 * Por que centralizar?
 * Sem isso, cada controller precisaria de try/catch repetitivos.
 * Com o handler central, o service lança a exceção e esquece —
 * o handler garante que o cliente receba uma resposta padronizada e legível.
 *
 * Estrutura da resposta de erro:
 * {
 *   "timestamp": "2024-01-15T10:30:00",
 *   "status": 404,
 *   "erro": "Recurso não encontrado",
 *   "mensagem": "Candidato com id 99 não encontrado"
 * }
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** HTTP 404: recurso não encontrado no banco */
    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> handleNaoEncontrado(RecursoNaoEncontradoException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, "Recurso não encontrado", ex.getMessage());
    }

    /** HTTP 409: conflito de dados (ex: e-mail duplicado) */
    @ExceptionHandler(ConflitoDeDadosException.class)
    public ResponseEntity<Map<String, Object>> handleConflito(ConflitoDeDadosException ex) {
        return buildResponse(HttpStatus.CONFLICT, "Conflito de dados", ex.getMessage());
    }

    /**
     * HTTP 400: erro de validação dos campos do DTO.
     * O Spring lança MethodArgumentNotValidException quando @Valid falha.
     * Aqui extraímos todos os campos inválidos e suas mensagens.
     *
     * Resposta:
     * {
     *   "status": 400,
     *   "erro": "Dados inválidos",
     *   "campos": { "email": "E-mail inválido", "nome": "Nome é obrigatório" }
     * }
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidacao(MethodArgumentNotValidException ex) {
        Map<String, String> camposInvalidos = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            camposInvalidos.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("erro", "Dados inválidos");
        body.put("campos", camposInvalidos);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    /** HTTP 500: erros inesperados — captura tudo que não foi tratado acima */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenerico(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno", ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String erro, String mensagem) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("erro", erro);
        body.put("mensagem", mensagem);
        return ResponseEntity.status(status).body(body);
    }
}
