package com.bag.osmanager.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção para ser lançada quando uma operação viola a integridade dos dados.
 * Ex: Tentar deletar um item que está sendo referenciado por outro.
 *
 * A anotação @ResponseStatus(HttpStatus.CONFLICT) faz com que o Spring retorne
 * automaticamente o código HTTP 409 quando esta exceção não for tratada em um Controller.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class DataIntegrityException extends RuntimeException {
    public DataIntegrityException(String message) {
        super(message);
    }
}