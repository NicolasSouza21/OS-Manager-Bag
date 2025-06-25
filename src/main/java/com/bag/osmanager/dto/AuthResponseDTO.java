// Local do arquivo: src/main/java/com/bag/osmanager/dto/AuthResponseDTO.java
package com.bag.osmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor // É uma boa prática adicionar um construtor sem argumentos também
public class AuthResponseDTO {
    private String token;
}