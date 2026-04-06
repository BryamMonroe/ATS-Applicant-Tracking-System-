package com.ats.exception;

/**
 * Exceção lançada quando um recurso não é encontrado no banco.
 * Estende RuntimeException (unchecked) — não obriga o chamador
 * a usar try/catch, mas o GlobalExceptionHandler a captura
 * e devolve HTTP 404 para o cliente.
 */
public class RecursoNaoEncontradoException extends RuntimeException {
    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
