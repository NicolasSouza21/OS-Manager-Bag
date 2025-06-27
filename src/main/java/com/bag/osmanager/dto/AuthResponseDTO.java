// Local do ficheiro: src/main/java/com/bag/osmanager/dto/AuthResponseDTO.java
package com.bag.osmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponseDTO {
    
    private String token;
    
    // --- 👇👇 CAMPO ADICIONADO AQUI 👇👇 ---
    private String role; // Campo para enviar o cargo/função do utilizador
}