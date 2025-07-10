package com.parking.billing_service.service;
 
import com.parking.billing_service.dto.CreateInvoiceRequest;
import com.parking.billing_service.dto.InvoiceResponseDTO;
import com.parking.billing_service.dto.PaymentRequestDTO;
 
import java.util.List;
 
public interface BillingService {
 
    InvoiceResponseDTO createInvoice(CreateInvoiceRequest request);
 
    List<InvoiceResponseDTO> getAllInvoices();
 
    InvoiceResponseDTO getInvoiceById(Long invoiceId);

    List<InvoiceResponseDTO> getInvoicesByUserId(Long userId);

    InvoiceResponseDTO payInvoice(Long invoiceId, PaymentRequestDTO payment);

    InvoiceResponseDTO cancelInvoice(Long invoiceId);
}
 