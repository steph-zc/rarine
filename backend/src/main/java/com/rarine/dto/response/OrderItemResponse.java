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
    String price,
    List<ItemEmbroideryResponse> embroideries
) {}
