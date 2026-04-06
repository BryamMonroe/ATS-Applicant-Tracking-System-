package com.ats.candidato.repository;

import com.ats.candidato.domain.Candidato;
import com.ats.candidato.domain.StatusPipeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidatoRepository
        extends JpaRepository<Candidato, Long>, JpaSpecificationExecutor<Candidato> {
    /**
     * Busca candidatos por status (para popular cada coluna do Kanban).
     * SQL gerado: SELECT * FROM candidatos WHERE status = ?
     */
    List<Candidato> findByStatus(StatusPipeline status);

    /**
     * Verifica se já existe um candidato com esse e-mail.
     * SQL gerado: SELECT COUNT(*) > 0 FROM candidatos WHERE email = ?
     */
    boolean existsByEmail(String email);

    /**
     * Igual ao existsByEmail, mas ignora um ID específico.
     * Útil na atualização: se o e-mail novo já pertence a OUTRO candidato,
     * é conflito. Se pertence ao próprio, tudo bem.
     * SQL: SELECT COUNT(*) > 0 FROM candidatos WHERE email = ? AND id != ?
     */
    boolean existsByEmailAndIdNot(String email, Long id);
}
