package com.rarine.controller;

import com.rarine.domain.entity.EmbroideryColor;
import com.rarine.dto.request.EmbroideryColorCreateRequest;
import com.rarine.dto.response.EmbroideryColorResponse;
import com.rarine.exception.NotFoundException;
import com.rarine.repository.EmbroideryColorRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/embroidery-colors")
public class EmbroideryColorController {

    private final EmbroideryColorRepository repository;

    public EmbroideryColorController(EmbroideryColorRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmbroideryColorResponse create(@Valid @RequestBody EmbroideryColorCreateRequest request) {
        EmbroideryColor ec = new EmbroideryColor();
        ec.setName(request.name());
        ec.setThreadCode(request.threadCode());
        ec.setBrand(request.brand());
        return toResponse(repository.save(ec));
    }

    @GetMapping
    public List<EmbroideryColorResponse> list() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    @GetMapping("/{id}")
    public EmbroideryColorResponse get(@PathVariable Long id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new NotFoundException("Embroidery color not found"));
    }

    @PutMapping("/{id}")
    public EmbroideryColorResponse update(@PathVariable Long id,
                                          @Valid @RequestBody EmbroideryColorCreateRequest request) {
        EmbroideryColor ec = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Embroidery color not found"));
        ec.setName(request.name());
        ec.setThreadCode(request.threadCode());
        ec.setBrand(request.brand());
        return toResponse(repository.save(ec));
    }

    private EmbroideryColorResponse toResponse(EmbroideryColor ec) {
        return new EmbroideryColorResponse(
                ec.getId(), ec.getName(), ec.getThreadCode(),
                ec.getBrand(), ec.getCreatedAt(), ec.getUpdatedAt());
    }
}
