package com.rarine.dto.response;

import com.rarine.domain.enums.OrderStatus;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record OrderResponse(
    Long id,
    Long clientId,
    String clientName,
    OrderStatus status,
    LocalDate deadline,
    String notes,
    String price,
    Long imageAttachmentId,
    List<OrderItemResponse> items,
    List<OrderAttachmentResponse> attachments,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
