package com.rarine.dto.response;

import java.time.OffsetDateTime;

public record OrderAttachmentResponse(
    Long id,
    String fileType,
    String filePath,
    String description,
    OffsetDateTime createdAt
) {}
