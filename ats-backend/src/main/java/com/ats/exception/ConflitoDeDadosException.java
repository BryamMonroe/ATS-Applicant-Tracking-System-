package com.ats.exception;

/**
 * Exceção lançada quando há conflito de dados únicos.
 * Exemplo: tentar cadastrar dois candidatos com o mesmo e-mail.
 * O GlobalExceptionHandler a captura e devolve HTTP 409 (Conflict).
 */
public class ConflitoDeDadosException extends RuntimeException {
    public ConflitoDeDadosException(String mensagem) {
        super(mensagem);
    }
}
