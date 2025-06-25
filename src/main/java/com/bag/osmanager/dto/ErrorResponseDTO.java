// Crie este DTO em: src/main/java/com/bag/osmanager/dto/ErrorResponseDTO.java

package com.bag.osmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ErrorResponseDTO {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
}