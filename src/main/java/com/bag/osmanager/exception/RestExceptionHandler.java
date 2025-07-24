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

    // --- ✅ NOVO MÉTODO ADICIONADO ---
    /**
     * Captura a DataIntegrityException e cria uma resposta de erro HTTP 409 (Conflict)
     * com um corpo JSON detalhado, garantindo que a mensagem customizada seja enviada.
     */
    @ExceptionHandler(DataIntegrityException.class)
    public ResponseEntity<ErrorResponseDTO> handleDataIntegrityException(
            DataIntegrityException ex, HttpServletRequest request) {
            
        ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                LocalDateTime.now(),
                HttpStatus.CONFLICT.value(),
                "Conflito de Dados", // Título genérico para o tipo de erro
                ex.getMessage(),      // A nossa mensagem: "Não é possível excluir..."
                request.getRequestURI()
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }
}