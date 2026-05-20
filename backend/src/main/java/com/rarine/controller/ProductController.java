package com.rarine.controller;

import java.util.List;

import com.rarine.domain.entity.Product;
import com.rarine.dto.request.ProductCreateRequest;
import com.rarine.dto.response.ProductResponse;
import com.rarine.exception.NotFoundException;
import com.rarine.repository.ProductRepository;

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

import com.rarine.dto.request.ProductUpdateRequest;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository repository;

    public ProductController(ProductRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody ProductCreateRequest request) {
        Product p = new Product();
        p.setName(request.name());
        p.setType(request.type());
        p.setModel(request.model());
        p.setCollar(request.collar());
        p.setFabric(request.fabric());
        p.setBaseColor(request.baseColor());
        p.setHasEmbroidery(request.hasEmbroidery());
        p.setHasPrint(request.hasPrint());
        return toResponse(repository.save(p));
    }

    @GetMapping
    public List<ProductResponse> list() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable Long id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new NotFoundException("Product not found"));
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id,
                                  @Valid @RequestBody ProductUpdateRequest request) {
        Product p = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        p.setName(request.name());
        p.setType(request.type());
        p.setModel(request.model());
        p.setCollar(request.collar());
        p.setFabric(request.fabric());
        p.setBaseColor(request.baseColor());
        p.setHasEmbroidery(request.hasEmbroidery());
        p.setHasPrint(request.hasPrint());
        return toResponse(repository.save(p));
    }

    private ProductResponse toResponse(Product p) {
        return new ProductResponse(
                p.getId(), p.getName(), p.getType(), p.getModel(),
                p.getCollar(), p.getFabric(), p.getBaseColor(),
                p.isHasEmbroidery(), p.isHasPrint(),
                p.getCreatedAt(), p.getUpdatedAt());
    }
}
