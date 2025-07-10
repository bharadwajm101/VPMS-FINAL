package com.parking.billing_service.service.impl;

import com.parking.billing_service.dto.CreateInvoiceRequest;
import com.parking.billing_service.dto.InvoiceResponseDTO;
import com.parking.billing_service.entity.Invoice;
import com.parking.billing_service.entity.InvoiceStatus;
import com.parking.billing_service.entity.PaymentMethod;
import com.parking.billing_service.repository.InvoiceRepository;
import com.parking.billing_service.service.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.parking.billing_service.dto.PaymentRequestDTO;
import com.parking.billing_service.dto.ReservationResponseDTO;
import com.parking.billing_service.dto.VehicleLogResponse;

import com.parking.billing_service.feign.ReservationClient;
import com.parking.billing_service.feign.VehicleLogClient;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillingServiceImpl implements BillingService {

    private final InvoiceRepository invoiceRepository;
    private final ReservationClient reservationClient;
    private final VehicleLogClient vehicleLogClient;

    @Override
    public InvoiceResponseDTO createInvoice(CreateInvoiceRequest request) {
        // Validate that exactly one of reservationId or logId is non-null
        if ((request.getReservationId() == null && request.getLogId() == null) ||
            (request.getReservationId() != null && request.getLogId() != null)) {
            throw new IllegalArgumentException("Provide exactly one of reservationId or logId");
        }

        String type;
        long durationMinutes;

        if (request.getReservationId() != null) {
            // Fetch reservation details
            ReservationResponseDTO reservation = reservationClient.getReservationById(request.getReservationId());
            type = reservation.getType(); // e.g. "2W" or "4W"
            LocalDateTime start = reservation.getStartTime();
            LocalDateTime end = reservation.getEndTime();
            if (start == null || end == null) {
                throw new IllegalArgumentException("Reservation times cannot be null");
            }
            durationMinutes = Duration.between(start, end).toMinutes();
        } else {
            // Fetch vehicle log details
            VehicleLogResponse log = vehicleLogClient.getLogById(request.getLogId());
            type = log.getSlotType(); // or log.getType() depending on your DTO
            LocalDateTime entry = log.getEntryTime();
            LocalDateTime exit = log.getExitTime();
            if (entry == null || exit == null) {
                throw new IllegalArgumentException("Log times cannot be null");
            }
            if (exit == null) {
                throw new IllegalArgumentException("Vehicle has not exited yet");
            }
            durationMinutes = Duration.between(entry, exit).toMinutes();
        }

        double ratePerMinute = type.equalsIgnoreCase("2W") ? 1.0 : 2.0;
        double amount = ratePerMinute * durationMinutes;

        Invoice invoice = Invoice.builder()
            .userId(request.getUserId())
            .amount(amount)
            .paymentMethod(PaymentMethod.valueOf(request.getPaymentMethod()))
            .status(InvoiceStatus.UNPAID)
            .type(type)
            .reservationId(request.getReservationId())
            .logId(request.getLogId())
            .timestamp(request.getTimestamp() != null ? request.getTimestamp() : LocalDateTime.now())
            .build();

        invoice = invoiceRepository.save(invoice);
        return mapToDto(invoice);
    }

    @Override
    public InvoiceResponseDTO getInvoiceById(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));
        return mapToDto(invoice);
    }

    @Override
    public List<InvoiceResponseDTO> getAllInvoices() {
        return invoiceRepository.findAll().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Override
    public List<InvoiceResponseDTO> getInvoicesByUserId(Long userId) {
        return invoiceRepository.findByUserId(userId).stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    private InvoiceResponseDTO mapToDto(Invoice inv) {
        return new InvoiceResponseDTO(
            inv.getInvoiceId(),
            inv.getUserId(),
            inv.getReservationId(),
            inv.getLogId(),
            inv.getType(),
            inv.getAmount(),
            inv.getPaymentMethod(),
            inv.getStatus(),
            inv.getTimestamp()
        );
    }

    @Override
    @Transactional
    public InvoiceResponseDTO payInvoice(Long invoiceId, PaymentRequestDTO req) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));

        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new RuntimeException("Cannot pay a cancelled invoice");
        }
        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new RuntimeException("Invoice already paid");
        }

        // Simulate payment delay (consider using asynchronous processing)
        try {
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        invoice.setPaymentMethod(PaymentMethod.valueOf(req.getPaymentMethod()));
        invoice.setStatus(InvoiceStatus.PAID);
        invoiceRepository.save(invoice);

        return mapToDto(invoice);
    }

    @Override
    @Transactional
    public InvoiceResponseDTO cancelInvoice(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new RuntimeException("Cannot cancel a paid invoice");
        }

        invoice.setStatus(InvoiceStatus.CANCELLED);
        invoiceRepository.save(invoice);

        return mapToDto(invoice);
    }
}
