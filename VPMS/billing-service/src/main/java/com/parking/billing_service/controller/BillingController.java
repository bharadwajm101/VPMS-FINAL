package com.parking.billing_service.controller;
 
import com.parking.billing_service.dto.ApiResponse;
import com.parking.billing_service.dto.CreateInvoiceRequest;
import com.parking.billing_service.dto.InvoiceResponseDTO;
import com.parking.billing_service.dto.PaymentRequestDTO;
import com.parking.billing_service.service.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
 
@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillingController {
 
    private final BillingService billingService;
 
    // 1. Create Invoice (ADMIN, STAFF, CUSTOMER)
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF','CUSTOMER')")
    public ResponseEntity<ApiResponse<InvoiceResponseDTO>> createInvoice(
            @RequestBody CreateInvoiceRequest request) {
        InvoiceResponseDTO response = billingService.createInvoice(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Invoice created successfully", response));
    }
 
    // 2. Get Invoice by ID (ADMIN, STAFF, CUSTOMER)
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF','CUSTOMER')")
    public ResponseEntity<ApiResponse<InvoiceResponseDTO>> getInvoiceById(@PathVariable Long id) {
        InvoiceResponseDTO response = billingService.getInvoiceById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Invoice fetched successfully", response));
    }
 
    // 3. Get All Invoices (ADMIN, STAFF)
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<List<InvoiceResponseDTO>>> getAllInvoices() {
        List<InvoiceResponseDTO> list = billingService.getAllInvoices();
        return ResponseEntity.ok(new ApiResponse<>(true, "All invoices retrieved", list));
    }
 
    // 4. Get Invoices by User ID (ADMIN, STAFF, CUSTOMER)
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF','CUSTOMER')")
    public ResponseEntity<ApiResponse<List<InvoiceResponseDTO>>> getInvoicesByUser(
            @PathVariable Long userId) {
        List<InvoiceResponseDTO> list = billingService.getInvoicesByUserId(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "User invoices retrieved", list));
 
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF','CUSTOMER')")
    public ResponseEntity<ApiResponse<InvoiceResponseDTO>> payInvoice(
        @PathVariable Long id,
        @RequestBody PaymentRequestDTO paymentRequest) {
    InvoiceResponseDTO response = billingService.payInvoice(id, paymentRequest);
    return ResponseEntity.ok(new ApiResponse<>(true, "Invoice paid successfully", response));
}
@PostMapping("/{id}/cancel")
@PreAuthorize("hasAnyAuthority('ADMIN','STAFF','CUSTOMER')")
public ResponseEntity<ApiResponse<InvoiceResponseDTO>> cancelInvoice(@PathVariable Long id) {
    InvoiceResponseDTO response = billingService.cancelInvoice(id);
    return ResponseEntity.ok(new ApiResponse<>(true, "Invoice cancelled successfully", response));
}
}
 