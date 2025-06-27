package com.bag.osmanager.model.enums;

public enum TipoFuncionario {
    ADMIN("Administrador"),
    LIDER("Líder"),
    MECANICO("Mecânico"),
    ANALISTA_CQ("Analista de Qualidade");

    private final String nomeAmigavel;

    TipoFuncionario(String nomeAmigavel) {
        this.nomeAmigavel = nomeAmigavel;
    }

    public String getNomeAmigavel() {
        return nomeAmigavel;
    }
}