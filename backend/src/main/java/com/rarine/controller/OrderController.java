package com.rarine.controller;

import com.rarine.domain.entity.*;
import com.rarine.dto.request.ItemEmbroideryCreateRequest;
import com.rarine.dto.request.OrderCreateRequest;
import com.rarine.dto.request.OrderItemCreateRequest;
import com.rarine.dto.response.*;
import com.rarine.exception.NotFoundException;
import com.rarine.repository.*;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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

    // ── Adicionar Item ao Pedido ──────────────────────────────────────────────

    @PostMapping("/{orderId}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderItemResponse addItem(@PathVariable Long orderId,
                                     @Valid @RequestBody OrderItemCreateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new NotFoundException("Product not found"));

        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setProduct(product);
        item.setColor(request.color());
        item.setSize(request.size());
        item.setCollar(request.collar());
        item.setFabric(request.fabric());
        item.setQuantity(request.quantity());
        item.setNotes(request.notes());

        return toItemResponse(orderItemRepository.save(item));
    }

    // ── Definir Bordado no Item ───────────────────────────────────────────────

    @PostMapping("/{orderId}/items/{itemId}/embroideries")
    @ResponseStatus(HttpStatus.CREATED)
    public ItemEmbroideryResponse addEmbroidery(@PathVariable Long orderId,
                                                @PathVariable Long itemId,
                                                @Valid @RequestBody ItemEmbroideryCreateRequest request) {
        if (!orderRepository.existsById(orderId)) {
            throw new NotFoundException("Order not found");
        }
        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Order item not found"));
        if (!item.getOrder().getId().equals(orderId)) {
            throw new NotFoundException("Order item not found");
        }

        Set<EmbroideryColor> colors = request.colorIds().stream()
                .map(cid -> embroideryColorRepository.findById(cid)
                        .orElseThrow(() -> new NotFoundException("Embroidery color not found: " + cid)))
                .collect(Collectors.toSet());

        ItemEmbroidery emb = new ItemEmbroidery();
        emb.setOrderItem(item);
        emb.setLocation(request.location());
        emb.setDescription(request.description());
        emb.setColors(colors);

        item.getEmbroideries().add(emb);
        orderItemRepository.save(item);

        return toEmbroideryResponse(emb);
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
                items,
                atts,
                withItems.getCreatedAt(),
                withItems.getUpdatedAt());
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private OrderItemResponse toItemResponse(OrderItem i) {
        List<ItemEmbroideryResponse> embs = i.getEmbroideries().stream()
                .map(this::toEmbroideryResponse).toList();
        return new OrderItemResponse(
                i.getId(),
                i.getProduct().getId(),
                i.getProduct().getName(),
                i.getColor(),
                i.getSize(),
                i.getCollar(),
                i.getFabric(),
                i.getQuantity(),
                i.getNotes(),
                embs);
    }

    private ItemEmbroideryResponse toEmbroideryResponse(ItemEmbroidery e) {
        Set<EmbroideryColorResponse> colorResponses = e.getColors().stream()
                .map(c -> new EmbroideryColorResponse(
                        c.getId(), c.getName(), c.getThreadCode(),
                        c.getBrand(), c.getCreatedAt(), c.getUpdatedAt()))
                .collect(Collectors.toSet());
        return new ItemEmbroideryResponse(
                e.getId(), e.getLocation(), e.getDescription(), colorResponses);
    }

    private OrderAttachmentResponse toAttachmentResponse(OrderAttachment a) {
        return new OrderAttachmentResponse(
                a.getId(), a.getFileType(), a.getFilePath(),
                a.getDescription(), a.getCreatedAt());
    }
}
