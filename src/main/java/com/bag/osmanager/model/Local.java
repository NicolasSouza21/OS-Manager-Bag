package com.bag.osmanager.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
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

    @Column(nullable = false)
    private String nome;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "setor_id", nullable = false)
    @JsonBackReference
    // ✅ CORREÇÃO AQUI: Exclui o campo 'setor' do método toString() para quebrar o loop.
    @ToString.Exclude 
    private Setor setor;
}