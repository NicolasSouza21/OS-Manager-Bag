// Crie a pasta 'exception' em: src/main/java/com/bag/osmanager/exception/
// E dentro dela, crie o arquivo ResourceNotFoundException.java

package com.bag.osmanager.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Anotação para que o Spring já saiba que essa exceção deve retornar um status 404
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}