-- V1__create_candidatos.sql
-- Flyway executa este arquivo UMA vez e registra em flyway_schema_history.
-- Nunca altere um arquivo já executado — crie um V2__ para mudanças futuras.

CREATE TABLE candidatos (
    id             BIGINT          NOT NULL AUTO_INCREMENT,
    nome           VARCHAR(150)    NOT NULL,
    email          VARCHAR(150)    NOT NULL UNIQUE,
    telefone       VARCHAR(20),
    cargo_desejado VARCHAR(100)    NOT NULL,
    status         VARCHAR(30)     NOT NULL DEFAULT 'APLICADO',
    curriculo_path VARCHAR(500),
    observacoes    TEXT,
    data_cadastro  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_candidatos_status        (status),
    INDEX idx_candidatos_cargo         (cargo_desejado),
    INDEX idx_candidatos_nome          (nome),
    INDEX idx_candidatos_data_cadastro (data_cadastro)
);
