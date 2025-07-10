package com.parking.billing_service.dto;
 
import lombok.*;
 
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDTO {
    private Long invoiceId;
    private String status;       // "PAID" or "FAILED"
    private String paymentMethod;
}
 