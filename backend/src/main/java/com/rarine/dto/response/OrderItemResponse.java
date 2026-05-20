package com.rarine.dto.response;

import java.util.List;

public record OrderItemResponse(
    Long id,
    Long productId,
    String productName,
    String color,
    String size,
    String collar,
    String fabric,
    int quantity,
    String notes,
    List<ItemEmbroideryResponse> embroideries
) {}
