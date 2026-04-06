package com.ats.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração do Swagger / OpenAPI 3.
 *
 * Isso gera automaticamente a documentação interativa da API em:
 * http://localhost:8080/swagger-ui.html
 *
 * Recrutadores e revisores de portfólio conseguem testar
 * os endpoints diretamente pelo navegador, sem precisar do Postman.
 * Isso diferencia muito o projeto numa avaliação.
 */

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("ATS - Applicant Tracking System API")
                        .description("""
                                API REST para gerenciamento de candidatos no pipeline de recrutamento.
                                
                                Funcionalidades:
                                - CRUD completo de candidatos
                                - Pipeline Kanban (APLICADO → TRIAGEM → ENTREVISTA → OFERTA → APROVADO)
                                - Upload de currículos em PDF
                                - Filtros e busca por nome, status e cargo
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Seu Nome")
                                .url("https://github.com/seu-usuario")));
    }
}
