package com.rarine.controller;

import com.rarine.domain.entity.*;
import com.rarine.dto.request.EstampaCreateRequest;
import com.rarine.dto.request.OrderCreateRequest;
import com.rarine.dto.request.OrderItemCreateRequest;
import com.rarine.dto.request.OrderUpdateRequest;
import com.rarine.dto.response.*;
import com.rarine.exception.NotFoundException;
import com.rarine.report.OrderReportGenerator;
import com.rarine.repository.*;

import jakarta.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@Transactional
public class OrderController {

    private static final String UPLOAD_DIR = "uploads/orders";

    private final OrderRepository orderRepository;
    private final ClientRepository clientRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final EmbroideryColorRepository embroideryColorRepository;

    public OrderController(OrderRepository orderRepository,
                           ClientRepository clientRepository,
                           ProductRepository productRepository,
                           OrderItemRepository orderItemRepository,
                           EmbroideryColorRepository embroideryColorRepository) {
        this.orderRepository = orderRepository;
        this.clientRepository = clientRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.embroideryColorRepository = embroideryColorRepository;
    }

    // ── Criar Pedido ──────────────────────────────────────────────────────────

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse create(@Valid @RequestBody OrderCreateRequest request) {
        Client client = clientRepository.findById(request.clientId())
                .orElseThrow(() -> new NotFoundException("Client not found"));
        Order order = new Order();
        order.setClient(client);
        order.setDeadline(request.deadline());
        order.setNotes(request.notes());
        Order saved = orderRepository.save(order);
        return fetchAndMap(saved.getId());
    }

    // ── Listar / Visualizar Pedido ────────────────────────────────────────────

    @GetMapping
    public List<OrderResponse> list() {
        return orderRepository.findAll().stream()
                .map(o -> fetchAndMap(o.getId()))
                .toList();
    }

    @GetMapping("/{id}")
    public OrderResponse get(@PathVariable Long id) {
        return fetchAndMap(id);
    }

    @PutMapping("/{id}")
    public OrderResponse update(@PathVariable Long id,
                                @Valid @RequestBody OrderUpdateRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        Client client = clientRepository.findById(request.clientId())
                .orElseThrow(() -> new NotFoundException("Client not found"));
        order.setClient(client);
        order.setDeadline(request.deadline());
        order.setNotes(request.notes());
        orderRepository.save(order);
        return fetchAndMap(id);
    }

    // ── Lançar Preço do Pedido (texto livre, perfil do cliente) ───────────────

    @PatchMapping("/{id}/price")
    public OrderResponse updatePrice(@PathVariable Long id,
                                     @RequestParam(required = false) String price) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        order.setPrice(price == null || price.isBlank() ? null : price.trim());
        orderRepository.save(order);
        return fetchAndMap(id);
    }

    // ── Alterar Status do Pedido ──────────────────────────────────────────────

    @PatchMapping("/{id}/status")
    public OrderResponse updateStatus(@PathVariable Long id,
                                      @RequestParam String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        try {
            order.setStatus(com.rarine.domain.enums.OrderStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Status inválido: " + status);
        }
        orderRepository.save(order);
        return fetchAndMap(id);
    }

    // ── Adicionar Item ao Pedido ──────────────────────────────────────────────

    @PostMapping("/{orderId}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderItemResponse addItem(@PathVariable Long orderId,
                                     @Valid @RequestBody OrderItemCreateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        // RN04.03: itens só podem ser editados enquanto a OS está em "Pedido"
        if (order.getStatus() != com.rarine.domain.enums.OrderStatus.PEDIDO) {
            throw new IllegalStateException("Itens só podem ser adicionados enquanto a OS está em Pedido.");
        }
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new NotFoundException("Product not found"));

        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setProduct(product);
        item.setProductName(product.getName()); // snapshot (RN02.01)
        item.setColor(request.color());
        item.setCollar(request.collar());
        item.setManga(request.manga());
        item.setFabric(request.fabric());
        item.setQuantity(1); // tamanho/quantidade são preenchidos à mão na ficha impressa
        item.setHasPrint(Boolean.TRUE.equals(request.hasPrint()));

        // Estampa/bordado: cada local escolhido com suas cores (conceito unificado)
        if (request.estampas() != null) {
            for (EstampaCreateRequest est : request.estampas()) {
                if (est == null || est.location() == null) continue;
                Set<EmbroideryColor> colors = est.colorIds() == null ? Set.of()
                        : est.colorIds().stream()
                            .map(cid -> embroideryColorRepository.findById(cid)
                                    .orElseThrow(() -> new NotFoundException("Embroidery color not found: " + cid)))
                            .collect(Collectors.toSet());
                ItemEmbroidery emb = new ItemEmbroidery();
                emb.setOrderItem(item);
                emb.setLocation(est.location());
                emb.setDescription(est.description());
                emb.setColors(colors);
                item.getEmbroideries().add(emb);
            }
        }

        return toItemResponse(orderItemRepository.save(item));
    }

    // ── Gerar Ficha Técnica (PDF) ─────────────────────────────────────────────

    @GetMapping("/{id}/report")
    public ResponseEntity<byte[]> report(@PathVariable Long id) {
        Order withItems = orderRepository.findByIdWithItemsAndEmbroideries(id)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        Order withAttachments = orderRepository.findByIdWithAttachments(id)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        byte[] pdf = OrderReportGenerator.generate(withItems,
                new java.util.ArrayList<>(withAttachments.getAttachments()));

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"ficha-os-" + id + ".pdf\"")
                .body(pdf);
    }

    // ── Anexar Imagem ao Pedido ───────────────────────────────────────────────

    @PostMapping(value = "/{orderId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public OrderAttachmentResponse addAttachment(@PathVariable Long orderId,
                                                 @RequestParam("file") MultipartFile file,
                                                 @RequestParam(required = false) String description) throws IOException {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        Path dir = Paths.get(UPLOAD_DIR, orderId.toString());
        Files.createDirectories(dir);

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path dest = dir.resolve(filename);
        file.transferTo(dest.toAbsolutePath());

        OrderAttachment att = new OrderAttachment();
        att.setOrder(order);
        att.setFileType(file.getContentType());
        att.setFilePath(dest.toString());
        att.setDescription(description);

        order.getAttachments().add(att);
        orderRepository.save(order);

        return toAttachmentResponse(att);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Executa duas queries separadas para evitar MultipleBagFetchException,
     * depois monta o response combinando items+bordados e attachments.
     */
    private OrderResponse fetchAndMap(Long id) {
        Order withItems = orderRepository.findByIdWithItemsAndEmbroideries(id)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        Order withAttachments = orderRepository.findByIdWithAttachments(id)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        List<OrderItemResponse> items = withItems.getItems().stream()
                .map(this::toItemResponse).toList();
        List<OrderAttachmentResponse> atts = withAttachments.getAttachments().stream()
                .map(this::toAttachmentResponse).toList();

        return new OrderResponse(
                withItems.getId(),
                withItems.getClient().getId(),
                withItems.getClient().getName(),
                withItems.getStatus(),
                withItems.getDeadline(),
                withItems.getNotes(),
                withItems.getPrice(),
                items,
                atts,
                withItems.getCreatedAt(),
                withItems.getUpdatedAt());
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private OrderItemResponse toItemResponse(OrderItem i) {
        List<ItemEmbroideryResponse> embs = i.getEmbroideries().stream()
                .map(this::toEmbroideryResponse).toList();
        // Usa o snapshot do nome (RN02.01); cai para o nome ao vivo apenas em itens legados
        String productName = i.getProductName() != null ? i.getProductName() : i.getProduct().getName();
        return new OrderItemResponse(
                i.getId(),
                i.getProduct().getId(),
                productName,
                i.getColor(),
                i.getCollar(),
                i.getManga(),
                i.getFabric(),
                i.isHasPrint(),
                embs);
    }

    private ItemEmbroideryResponse toEmbroideryResponse(ItemEmbroidery e) {
        Set<EmbroideryColorResponse> colorResponses = e.getColors().stream()
                .map(c -> new EmbroideryColorResponse(
                        c.getId(), c.getName(), c.getThreadCode(),
                        c.getBrand(), c.getHexColor(), c.getCreatedAt(), c.getUpdatedAt()))
                .collect(Collectors.toSet());
        return new ItemEmbroideryResponse(
                e.getId(), e.getLocation(), e.getDescription(), colorResponses);
    }

    private OrderAttachmentResponse toAttachmentResponse(OrderAttachment a) {
        return new OrderAttachmentResponse(
                a.getId(), a.getFileType(), a.getFilePath(),
                a.getDescription(), a.getCreatedAt());
    }

    // ── Tratamento de erros de regra de negócio ───────────────────────────────

    @ExceptionHandler({ IllegalStateException.class, IllegalArgumentException.class })
    @ResponseStatus(HttpStatus.CONFLICT)
    org.springframework.http.ProblemDetail handleBusinessRule(RuntimeException ex) {
        org.springframework.http.ProblemDetail pd =
                org.springframework.http.ProblemDetail.forStatus(HttpStatus.CONFLICT);
        pd.setTitle("Regra de negócio");
        pd.setDetail(ex.getMessage());
        return pd;
    }
}
