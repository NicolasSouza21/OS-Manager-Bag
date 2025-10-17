// Local do arquivo: src/main/java/com/bag/osmanager/exception/RestExceptionHandler.java
package com.bag.osmanager.exception;

import com.bag.osmanager.dto.ErrorResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;

@ControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleResourceNotFoundException(
            ResourceNotFoundException ex, HttpServletRequest request) {
        
        ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                LocalDateTime.now(),
                HttpStatus.NOT_FOUND.value(),
                "Recurso Não Encontrado",
                ex.getMessage(),
                request.getRequestURI()
        );
        
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DataIntegrityException.class)
    public ResponseEntity<ErrorResponseDTO> handleDataIntegrityException(
            DataIntegrityException ex, HttpServletRequest request) {
            
        ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                LocalDateTime.now(),
                HttpStatus.CONFLICT.value(),
                "Conflito de Dados",
                ex.getMessage(),
                request.getRequestURI()
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    // ✨ ALTERAÇÃO AQUI: Novo método para capturar erros de validação e lógica de negócio.
    /**
     * Captura exceções de argumento ilegal ou estado ilegal, que usamos para validações
     * de negócio no service. Retorna uma resposta HTTP 400 (Bad Request).
     */
    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<ErrorResponseDTO> handleIllegalArgumentAndStateException(
            RuntimeException ex, HttpServletRequest request) {
        
        ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Requisição Inválida", // Título genérico para este tipo de erro
                ex.getMessage(),      // A mensagem específica: "Prioridade é obrigatória..."
                request.getRequestURI()
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
}