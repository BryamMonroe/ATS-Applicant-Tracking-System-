package com.ats.candidato.service;

import com.ats.candidato.domain.Candidato;
import com.ats.candidato.domain.StatusPipeline;
import com.ats.candidato.dto.CandidatoRequest;
import com.ats.candidato.dto.CandidatoResponse;
import com.ats.candidato.dto.StatusUpdateRequest;
import com.ats.candidato.repository.CandidatoRepository;
import com.ats.exception.ConflitoDeDadosException;
import com.ats.exception.RecursoNaoEncontradoException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Testes unitários do CandidatoService.
 *
 * @ExtendWith(MockitoExtension.class) → inicializa os mocks do Mockito
 * @Mock                               → cria um "dublê" do repository (não bate no banco)
 * @InjectMocks                        → injeta os mocks no service automaticamente
 *
 * Padrão AAA (Arrange / Act / Assert):
 * - Arrange: prepara os dados e configura o comportamento do mock
 * - Act:     chama o método que está sendo testado
 * - Assert:  verifica se o resultado é o esperado
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("CandidatoService - testes unitários")
class CandidatoServiceTest {

    @Mock
    private CandidatoRepository repository;

    @InjectMocks
    private CandidatoService service;

    private Candidato candidatoExemplo;
    private CandidatoRequest requestExemplo;

    @BeforeEach
    void setUp() {
        candidatoExemplo = Candidato.builder()
                .id(1L)
                .nome("Ana Silva")
                .email("ana@email.com")
                .cargoDesejado("Backend Developer")
                .status(StatusPipeline.APLICADO)
                .build();

        requestExemplo = new CandidatoRequest(
                "Ana Silva",
                "ana@email.com",
                "(12) 99999-0000",
                "Backend Developer",
                null
        );
    }

    // ─── CADASTRAR ────────────────────────────────────────────────────────

    @Test
    @DisplayName("Deve cadastrar candidato com sucesso")
    void deveCadastrarCandidato() {
        // Arrange
        when(repository.existsByEmail(anyString())).thenReturn(false);
        when(repository.save(any(Candidato.class))).thenReturn(candidatoExemplo);

        // Act
        CandidatoResponse response = service.cadastrar(requestExemplo);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.nome()).isEqualTo("Ana Silva");
        assertThat(response.status()).isEqualTo(StatusPipeline.APLICADO);
        verify(repository, times(1)).save(any(Candidato.class));
    }

    @Test
    @DisplayName("Deve lançar ConflitoDeDadosException ao cadastrar e-mail duplicado")
    void deveLancarExcecaoEmailDuplicado() {
        when(repository.existsByEmail(anyString())).thenReturn(true);

        assertThatThrownBy(() -> service.cadastrar(requestExemplo))
                .isInstanceOf(ConflitoDeDadosException.class)
                .hasMessageContaining("ana@email.com");

        verify(repository, never()).save(any());
    }

    // ─── BUSCAR ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("Deve buscar candidato por ID com sucesso")
    void deveBuscarPorId() {
        when(repository.findById(1L)).thenReturn(Optional.of(candidatoExemplo));

        CandidatoResponse response = service.buscarPorId(1L);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.email()).isEqualTo("ana@email.com");
    }

    @Test
    @DisplayName("Deve lançar RecursoNaoEncontradoException para ID inexistente")
    void deveLancarExcecaoIdInexistente() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(99L))
                .isInstanceOf(RecursoNaoEncontradoException.class)
                .hasMessageContaining("99");
    }

    // ─── ATUALIZAR STATUS ─────────────────────────────────────────────────

    @Test
    @DisplayName("Deve mover candidato para ENTREVISTA")
    void deveMoverCandidatoParaEntrevista() {
        when(repository.findById(1L)).thenReturn(Optional.of(candidatoExemplo));

        StatusUpdateRequest statusRequest = new StatusUpdateRequest(StatusPipeline.ENTREVISTA);
        CandidatoResponse response = service.atualizarStatus(1L, statusRequest);

        assertThat(response.status()).isEqualTo(StatusPipeline.ENTREVISTA);
    }

    // ─── DELETAR ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("Deve deletar candidato existente")
    void deveDeletarCandidato() {
        when(repository.findById(1L)).thenReturn(Optional.of(candidatoExemplo));
        doNothing().when(repository).delete(any(Candidato.class));

        assertThatCode(() -> service.deletar(1L)).doesNotThrowAnyException();
        verify(repository, times(1)).delete(candidatoExemplo);
    }
}
