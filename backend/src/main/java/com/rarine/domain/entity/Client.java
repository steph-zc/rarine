package com.rarine.domain.entity;
import com.rarine.domain.enums.ClientType;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "clients")
public class Client {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Enumerated(EnumType.STRING)
  @Column(name = "type", nullable = false, length = 2)
  private ClientType type;

  @Column(name = "name", nullable = false, length = 200)
  private String name;

  @Column(name = "document", nullable = false, length = 30, unique = true)
  private String document;

  @Column(name = "cnpj", length = 18)
  private String cnpj;

  @Column(name = "razao_social", length = 200)
  private String razaoSocial;

  @Column(name = "email", length = 200)
  private String email;

  @Column(name = "phone", length = 30)
  private String phone;

  @Column(name = "city", length = 100)
  private String city;

  @Column(name = "school", length = 200)
  private String school;

  @Column(name = "child_name", length = 200)
  private String childName;

  @Column(name = "trade_name", length = 200)
  private String tradeName;

  @Column(name = "state_registration", length = 50)
  private String stateRegistration;

  @Column(name = "responsible_name", length = 200)
  private String responsibleName;

  @Column(name = "responsible_phone", length = 30)
  private String responsiblePhone;

  @Column(name = "active", nullable = false)
  private boolean active = true;

  @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
  private OffsetDateTime updatedAt;

  public Long getId() {
    return id;
  }

  public ClientType getType() {
    return type;
  }

  public void setType(ClientType type) {
    this.type = type;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDocument() {
    return document;
  }

  public void setDocument(String document) {
    this.document = document;
  }

  public String getCnpj() {
    return cnpj;
  }

  public void setCnpj(String cnpj) {
    this.cnpj = cnpj;
  }

  public String getRazaoSocial() {
    return razaoSocial;
  }

  public void setRazaoSocial(String razaoSocial) {
    this.razaoSocial = razaoSocial;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPhone() {
    return phone;
  }

  public void setPhone(String phone) {
    this.phone = phone;
  }

  public String getCity() {
    return city;
  }

  public void setCity(String city) {
    this.city = city;
  }

  public String getSchool() {
    return school;
  }

  public void setSchool(String school) {
    this.school = school;
  }

  public String getChildName() {
    return childName;
  }

  public void setChildName(String childName) {
    this.childName = childName;
  }

  public String getTradeName() {
    return tradeName;
  }

  public void setTradeName(String tradeName) {
    this.tradeName = tradeName;
  }

  public String getStateRegistration() {
    return stateRegistration;
  }

  public void setStateRegistration(String stateRegistration) {
    this.stateRegistration = stateRegistration;
  }

  public String getResponsibleName() {
    return responsibleName;
  }

  public void setResponsibleName(String responsibleName) {
    this.responsibleName = responsibleName;
  }

  public String getResponsiblePhone() {
    return responsiblePhone;
  }

  public void setResponsiblePhone(String responsiblePhone) {
    this.responsiblePhone = responsiblePhone;
  }

  public boolean isActive() {
    return active;
  }

  public void setActive(boolean active) {
    this.active = active;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public OffsetDateTime getUpdatedAt() {
    return updatedAt;
  }
}

