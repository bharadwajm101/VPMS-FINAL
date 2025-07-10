package com.parking.billing_service.dto;
 
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
 
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateInvoiceRequest {
    private Long userId;
    private Long reservationId;
    private Long logId; // Vehicle Log ID if applicable
    private String Type;    // e.g. "2W", "4W"
    // private long durationMinutes;  // duration from Vehicle Log or Reservation
    private LocalDateTime timestamp; // when billing is triggered
    // private Double amount;
    private String paymentMethod;  // UPI, CARD, CASH
    // private String status;         // PAID, UNPAID, CANCELLED
}
 