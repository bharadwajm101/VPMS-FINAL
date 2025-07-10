package com.parking.billing_service.config;
 
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
 
@Configuration
public class SwaggerConfig {
 
    @Bean
    public OpenAPI billingOpenApi() {
        return new OpenAPI()
            .info(new Info()
                .title("Billing Service API")
                .description("APIs for billing and payments")
                .version("1.0"));
    }
}
 