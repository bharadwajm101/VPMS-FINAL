package com.parking.billing_service.entity;
 
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
 
@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invoice_id")
    private Long invoiceId;
 
    @Column(nullable = false)
    private Long userId;
 
    @Column(nullable = true)
    private Long reservationId; 
    
    @Column(nullable = true)
    private Long logId;
 
    @Column(nullable = false)
    private Double amount;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;  // UPI, CARD, CASH
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus status;  // PAID, UNPAID, CANCELLED
 
    @Column(nullable = false)
    private LocalDateTime timestamp;

    private String type; // e.g. "2W", "4W"
}
 