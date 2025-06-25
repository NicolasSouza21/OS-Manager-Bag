// Local do arquivo: src/main/java/com/bag/osmanager/dto/AuthRequestDTO.java
package com.bag.osmanager.dto;

import lombok.Data;

@Data
public class AuthRequestDTO {
    private String email;
    private String senha;
}