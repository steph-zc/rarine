package com.rarine.dto.response;

import java.util.List;

public record OrderItemResponse(
    Long id,
    Long productId,
    String productName,
    String color,
    String collar,
    String manga,
    String fabric,
    boolean hasPrint,
    List<ItemEmbroideryResponse> embroideries
) {}
