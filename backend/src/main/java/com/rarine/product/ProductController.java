package com.rarine.product;

import java.util.List;

import com.rarine.product.dto.ProductCreateRequest;
import com.rarine.product.dto.ProductResponse;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

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
    Product saved = repository.save(p);
    return toResponse(saved);
  }

  @GetMapping
  public List<ProductResponse> list() {
    return repository.findAll().stream().map(this::toResponse).toList();
  }

  private ProductResponse toResponse(Product p) {
    return new ProductResponse(
        p.getId(),
        p.getName(),
        p.getType(),
        p.getModel(),
        p.getCollar(),
        p.getFabric(),
        p.getBaseColor(),
        p.isHasEmbroidery(),
        p.isHasPrint(),
        p.getCreatedAt(),
        p.getUpdatedAt()
    );
  }
}

