package com.bag.osmanager.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "locais")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Local {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String setor;
}