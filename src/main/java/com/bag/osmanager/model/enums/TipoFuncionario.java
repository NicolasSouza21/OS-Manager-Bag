package com.bag.osmanager.model.enums;

public enum TipoFuncionario {

    // 1. Cada cargo agora tem um "nome de exibição" associado
    ADMIN("Administrador"),
    LIDER("Líder"),
    MECANICO("Mecânico"),
    ANALISTA_CQ("Analista de Qualidade");

    // 2. Adicionamos um campo para guardar esse nome
    private final String nomeAmigavel;

    // 3. O construtor do enum associa o valor ao campo
    TipoFuncionario(String nomeAmigavel) {
        this.nomeAmigavel = nomeAmigavel;
    }

    // 4. Um método para que outras partes do sistema possam ler o nome amigável
    public String getNomeAmigavel() {
        return nomeAmigavel;
    }
}