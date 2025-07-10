package com.parking.billing_service.dto;
 
import lombok.*;
 
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDTO {
    private String paymentMethod; // e.g. "UPI", "CARD", "CASH"
}
