package com.parking.slot_service.config;
 
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;

 
@Configuration
public class SwaggerConfig {
 
    @Bean
    public OpenAPI slotServiceOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Slot Service API")
                .description("APIs for managing parking slots")
                .version("1.0"))
        .addSecurityItem(new SecurityRequirement().addList("adminAuth"))
        .addSecurityItem(new SecurityRequirement().addList("staffAuth"))
        .addSecurityItem(new SecurityRequirement().addList("customerAuth"))
        .components(new Components()
            .addSecuritySchemes("adminAuth",
                new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("JWT for ADMIN role"))
            .addSecuritySchemes("staffAuth",
                new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("JWT for STAFF role"))
            .addSecuritySchemes("customerAuth",
                new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("JWT for CUSTOMER role"))
        );
}

}
