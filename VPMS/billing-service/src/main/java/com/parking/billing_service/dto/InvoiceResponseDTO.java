package com.parking.billing_service.dto;
 
import com.parking.billing_service.entity.InvoiceStatus;
import com.parking.billing_service.entity.PaymentMethod;
import lombok.*;
import java.time.LocalDateTime;
 
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponseDTO {
    private Long invoiceId;
    private Long userId;
    private Long reservationId;
    private Long logId; // Vehicle Log ID if applicable
    private String type; // e.g. "2W", "4W"
    private Double amount;
    private PaymentMethod paymentMethod;
    private InvoiceStatus status;
    private LocalDateTime timestamp;
}
 