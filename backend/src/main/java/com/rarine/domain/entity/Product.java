package com.rarine.domain.entity;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class Product {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "name", nullable = false, length = 200)
  private String name;

  @Column(name = "type", nullable = false, length = 100)
  private String type;

  @Column(name = "model", length = 100)
  private String model;

  @Column(name = "collar", length = 100)
  private String collar;

  @Column(name = "fabric", length = 100)
  private String fabric;

  @Column(name = "base_color", length = 100)
  private String baseColor;

  @Column(name = "has_embroidery", nullable = false)
  private boolean hasEmbroidery;

  @Column(name = "has_print", nullable = false)
  private boolean hasPrint;

  @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
  private OffsetDateTime updatedAt;

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getModel() {
    return model;
  }

  public void setModel(String model) {
    this.model = model;
  }

  public String getCollar() {
    return collar;
  }

  public void setCollar(String collar) {
    this.collar = collar;
  }

  public String getFabric() {
    return fabric;
  }

  public void setFabric(String fabric) {
    this.fabric = fabric;
  }

  public String getBaseColor() {
    return baseColor;
  }

  public void setBaseColor(String baseColor) {
    this.baseColor = baseColor;
  }

  public boolean isHasEmbroidery() {
    return hasEmbroidery;
  }

  public void setHasEmbroidery(boolean hasEmbroidery) {
    this.hasEmbroidery = hasEmbroidery;
  }

  public boolean isHasPrint() {
    return hasPrint;
  }

  public void setHasPrint(boolean hasPrint) {
    this.hasPrint = hasPrint;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public OffsetDateTime getUpdatedAt() {
    return updatedAt;
  }
}

