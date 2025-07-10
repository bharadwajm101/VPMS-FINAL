package com.parking.slot_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parking.slot_service.dto.SlotRequestDTO;
import com.parking.slot_service.dto.SlotResponseDTO;
import com.parking.slot_service.service.SlotService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SlotController.class)
class SlotControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SlotService slotService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void addSlot_shouldReturnSuccess() throws Exception {
        SlotRequestDTO req = new SlotRequestDTO();
        req.setLocation("A1");
        req.setType("CAR");
        SlotResponseDTO res = new SlotResponseDTO(1L, "A1", "CAR", false);

        Mockito.when(slotService.addSlot(any(SlotRequestDTO.class))).thenReturn(res);

        mockMvc.perform(post("/api/slots")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Slot added successfully"))
                .andExpect(jsonPath("$.slot.location").value("A1"));
    }

    @Test
    void deleteSlot_shouldReturnSuccess() throws Exception {
        mockMvc.perform(delete("/api/slots/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Slot deleted successfully"));
    }

    @Test
    void updateSlot_shouldReturnSuccess() throws Exception {
        SlotRequestDTO req = new SlotRequestDTO();
        req.setLocation("B2");
        req.setType("BIKE");
        SlotResponseDTO res = new SlotResponseDTO(1L, "B2", "BIKE", true);

        Mockito.when(slotService.updateSlot(eq(1L), any(SlotRequestDTO.class))).thenReturn(res);

        mockMvc.perform(put("/api/slots/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Slot status updated"))
                .andExpect(jsonPath("$.slot.location").value("B2"));
    }

    @Test
    void getAvailableSlots_shouldReturnList() throws Exception {
        SlotResponseDTO res = new SlotResponseDTO(1L, "A1", "CAR", false);
        Mockito.when(slotService.getAvailableSlots()).thenReturn(List.of(res));

        mockMvc.perform(get("/api/slots/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slots[0].location").value("A1"));
    }

    @Test
    void getAllSlots_shouldReturnList() throws Exception {
        SlotResponseDTO res = new SlotResponseDTO(1L, "A1", "CAR", false);
        Mockito.when(slotService.getAllSlots()).thenReturn(List.of(res));

        mockMvc.perform(get("/api/slots"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slots[0].location").value("A1"));
    }

    @Test
    void updateSlotOccupancy_shouldReturnSlot() throws Exception {
        SlotResponseDTO res = new SlotResponseDTO(1L, "A1", "CAR", true);
        Mockito.when(slotService.updateSlotOccupancy(eq(1L), eq(true))).thenReturn(res);

        mockMvc.perform(put("/api/slots/slot/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"occupied\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slot.isOccupied").value(true));
    }

    @Test
    void markSlotOccupied_shouldReturnOk() throws Exception {
        mockMvc.perform(put("/api/slots/mark-occupied/1"))
                .andExpect(status().isOk());
    }

    @Test
    void markSlotAvailable_shouldReturnOk() throws Exception {
        mockMvc.perform(put("/api/slots/mark-available/1"))
                .andExpect(status().isOk());
    }

    @Test
    void updateSlotOccupancyWithParams_shouldReturnOk() throws Exception {
        mockMvc.perform(put("/api/slots/update-occupancy")
                .param("slotId", "1")
                .param("isOccupied", "true"))
                .andExpect(status().isOk());
    }
}