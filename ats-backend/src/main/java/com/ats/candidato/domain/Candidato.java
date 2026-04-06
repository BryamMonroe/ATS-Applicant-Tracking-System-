package com.ats.candidato.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entidade JPA que mapeia a tabela `candidatos`.
 *
 * @Entity         → diz ao JPA que esta classe é uma tabela no banco
 * @Table          → define explicitamente o nome da tabela
 * @Id             → marca a chave primária
 * @GeneratedValue → banco gera o ID automaticamente (AUTO_INCREMENT)
 *
 * Lombok:
 * @Getter / @Setter → gera os métodos get/set em tempo de compilação
 * @Builder          → permite construir o objeto com padrão fluente:
 *                     Candidato.builder().nome("Ana").email("...").build()
 * @NoArgsConstructor → JPA exige construtor sem argumentos
 * @AllArgsConstructor → necessário para o @Builder funcionar
 */
@Entity
@Table(name = "candidatos")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Candidato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 20)
    private String telefone;

    @Column(name = "cargo_desejado", nullable = false, length = 100)
    private String cargoDesejado;

    /**
     * @Enumerated(STRING) armazena o texto do enum ("APLICADO")
     * e não o índice numérico (0). Muito mais seguro e legível.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private StatusPipeline status = StatusPipeline.APLICADO;

    @Column(name = "curriculo_path", length = 500)
    private String curriculoPath;  // preenchido na Fase 2 (upload)

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    /**
     * @CreationTimestamp → Hibernate preenche automaticamente na inserção
     * @UpdateTimestamp   → Hibernate atualiza automaticamente em cada save()
     * updatable = false  → garante que dataCadastro nunca seja sobrescrita
     */
    @CreationTimestamp
    @Column(name = "data_cadastro", nullable = false, updatable = false)
    private LocalDateTime dataCadastro;

    @UpdateTimestamp
    @Column(name = "data_atualizacao", nullable = false)
    private LocalDateTime dataAtualizacao;
}
