package com.rarine.report;

import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPCellEvent;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import com.rarine.domain.entity.ItemEmbroidery;
import com.rarine.domain.entity.Order;
import com.rarine.domain.entity.OrderAttachment;
import com.rarine.domain.entity.OrderItem;
import com.rarine.domain.enums.ClientType;
import com.rarine.domain.enums.PrintLocation;

/**
 * Gera a Ficha Técnica (PDF) de uma Ordem de Serviço, seguindo o modelo
 * institucional da Rarine Confecções. Preenche apenas as informações
 * disponíveis; os demais campos ficam em branco.
 */
public final class OrderReportGenerator {

    private static final java.awt.Color HEADER_BG = new java.awt.Color(225, 225, 225);
    private static final java.awt.Color LINE = java.awt.Color.BLACK;

    // Tamanhos/negrito espelhando o modelo institucional (Arial-Black no PDF original)
    private static final Font F_TITLE   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
    private static final Font F_NUMBER  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
    private static final Font F_SECTION = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
    private static final Font F_LABEL   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
    private static final Font F_VALUE   = FontFactory.getFont(FontFactory.HELVETICA, 12);
    private static final Font F_THEAD   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8.5f);
    private static final Font F_CELL    = FontFactory.getFont(FontFactory.HELVETICA, 9);

    private OrderReportGenerator() {}

    public static byte[] generate(Order order, List<OrderAttachment> attachments) {
        Document doc = new Document(PageSize.A4, 28, 28, 28, 28);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            doc.open();

            doc.add(titleBar(order));
            doc.add(imageBox(attachments));
            doc.add(sectionBar("INFORMAÇÕES DO CLIENTE"));
            doc.add(clientInfo(order));
            doc.add(sectionBar("DESCRIÇÃO DO PEDIDO"));
            doc.add(descriptionBlock(order));
            doc.add(sectionBar("DETALHES"));
            doc.add(detailsTable(order));
            doc.add(sectionBar("OBSERVAÇÕES:"));
            // Observações preenche todo o espaço restante da página, com linhas
            float remaining = writer.getVerticalPosition(false) - doc.bottomMargin() - 1f;
            doc.add(observations(order.getNotes(), remaining));

            doc.close();
        } catch (Exception e) {
            throw new RuntimeException("Falha ao gerar a ficha técnica do pedido " + order.getId(), e);
        }
        return out.toByteArray();
    }

    // ── Seções ────────────────────────────────────────────────────────────────

    private static PdfPTable titleBar(Order order) {
        PdfPTable t = fullWidth(new float[] { 5f, 1.4f });
        PdfPCell title = new PdfPCell(new Phrase("FICHA TÉCNICA - ORDEM DE SERVIÇO", F_TITLE));
        title.setHorizontalAlignment(Element.ALIGN_CENTER);
        title.setVerticalAlignment(Element.ALIGN_MIDDLE);
        title.setPadding(8);
        title.setBorderColor(LINE);
        t.addCell(title);

        PdfPCell num = new PdfPCell(new Phrase("Nº " + String.format("%03d", order.getId()), F_NUMBER));
        num.setHorizontalAlignment(Element.ALIGN_CENTER);
        num.setVerticalAlignment(Element.ALIGN_MIDDLE);
        num.setPadding(8);
        num.setBorderColor(LINE);
        t.addCell(num);
        return t;
    }

    private static PdfPTable imageBox(List<OrderAttachment> attachments) {
        PdfPTable t = fullWidth(new float[] { 1f });
        PdfPCell cell = new PdfPCell();
        cell.setBorderColor(LINE);
        cell.setFixedHeight(250);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(4);

        Image img = firstImage(attachments);
        if (img != null) {
            img.scaleToFit(520, 240);
            img.setAlignment(Element.ALIGN_CENTER);
            cell.addElement(img);
        }
        t.addCell(cell);
        return t;
    }

    private static PdfPTable clientInfo(Order order) {
        var c = order.getClient();
        boolean pj = c.getType() == ClientType.PJ;
        PdfPTable t = fullWidth(new float[] { 1f, 1f });
        t.addCell(labelValue("Cliente:", c.getName()));
        t.addCell(labelValue("Telefone (wpp):", c.getPhone()));
        t.addCell(labelValue("Cidade:", c.getCity()));
        t.addCell(labelValue("CNPJ:", pj ? c.getDocument() : null));
        return t;
    }

    private static PdfPTable descriptionBlock(Order order) {
        PdfPTable t = fullWidth(new float[] { 1f, 1f });
        t.addCell(spanLabelValue("Material:", joinFabrics(order)));
        t.addCell(spanLabelValue("Gola:", joinCollars(order)));
        t.addCell(spanLabelValue("Estampa:", joinLocations(order)));
        // Bordado (descrição da arte) e Cores lado a lado, como no modelo
        t.addCell(labelValue("Bordado:", joinDescriptions(order)));
        t.addCell(labelValue("Cores:", joinColors(order)));
        return t;
    }

    /**
     * DETALHES é preenchido à mão após a impressão (quantidade, tamanho,
     * observações e valores). Aqui só montamos o cabeçalho e linhas em branco.
     */
    private static PdfPTable detailsTable(Order order) {
        PdfPTable t = fullWidth(new float[] { 1f, 1f, 4f, 1.6f, 1.6f });
        t.addCell(headerCell("Qtd."));
        t.addCell(headerCell("Tam."));
        t.addCell(headerCell("Observações"));
        t.addCell(headerCell("Valor Unit."));
        t.addCell(headerCell("Valor total"));

        for (int k = 0; k < 8; k++) {
            for (int col = 0; col < 5; col++) t.addCell(cell(null));
        }
        return t;
    }

    private static PdfPTable observations(String notes, float height) {
        PdfPTable t = fullWidth(new float[] { 1f });
        PdfPCell cell = new PdfPCell(new Phrase(safe(notes), F_VALUE));
        cell.setBorderColor(LINE);
        cell.setFixedHeight(Math.max(60f, height));
        cell.setVerticalAlignment(Element.ALIGN_TOP);
        cell.setPadding(6);
        cell.setCellEvent(new RuledLines());
        t.addCell(cell);
        return t;
    }

    /** Desenha linhas horizontais (pauta) dentro da célula de observações. */
    private static final class RuledLines implements PdfPCellEvent {
        @Override
        public void cellLayout(PdfPCell cell, Rectangle pos, PdfContentByte[] canvases) {
            PdfContentByte cb = canvases[PdfPTable.LINECANVAS];
            cb.saveState();
            cb.setLineWidth(0.4f);
            cb.setColorStroke(new java.awt.Color(205, 205, 205));
            float gap = 20f;
            float bottom = pos.getBottom() + 6f;
            // Primeira linha abaixo de onde fica o texto das observações
            for (float y = pos.getTop() - 26f; y > bottom; y -= gap) {
                cb.moveTo(pos.getLeft() + 6, y);
                cb.lineTo(pos.getRight() - 6, y);
            }
            cb.stroke();
            cb.restoreState();
        }
    }

    // ── Helpers de layout ───────────────────────────────────────────────────────

    private static PdfPTable fullWidth(float[] widths) {
        PdfPTable t = new PdfPTable(widths);
        t.setWidthPercentage(100);
        t.setSpacingBefore(0);
        t.setSpacingAfter(0);
        return t;
    }

    private static PdfPTable sectionBar(String text) {
        PdfPTable t = fullWidth(new float[] { 1f });
        PdfPCell cell = new PdfPCell(new Phrase(text, F_SECTION));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBackgroundColor(HEADER_BG);
        cell.setBorderColor(LINE);
        cell.setPadding(4);
        t.addCell(cell);
        return t;
    }

    /** Célula "Rótulo: valor" (rótulo em negrito, valor normal). */
    private static PdfPCell labelValue(String label, String value) {
        Phrase p = new Phrase();
        p.add(new com.lowagie.text.Chunk(label + " ", F_LABEL));
        p.add(new com.lowagie.text.Chunk(safe(value), F_VALUE));
        PdfPCell cell = new PdfPCell(p);
        cell.setBorderColor(LINE);
        cell.setPadding(5);
        cell.setMinimumHeight(18);
        return cell;
    }

    /** Igual a labelValue, mas ocupa a linha inteira (2 colunas). */
    private static PdfPCell spanLabelValue(String label, String value) {
        PdfPCell cell = labelValue(label, value);
        cell.setColspan(2);
        return cell;
    }

    private static PdfPCell headerCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, F_THEAD));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBackgroundColor(HEADER_BG);
        cell.setBorderColor(LINE);
        cell.setPadding(4);
        return cell;
    }

    private static PdfPCell cell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(safe(text), F_CELL));
        cell.setBorderColor(LINE);
        cell.setPadding(4);
        cell.setMinimumHeight(16);
        return cell;
    }

    // ── Helpers de dados ────────────────────────────────────────────────────────

    private static Image firstImage(List<OrderAttachment> attachments) {
        if (attachments == null) return null;
        for (OrderAttachment a : attachments) {
            if (!isImage(a)) continue;
            try {
                byte[] bytes = Files.readAllBytes(Paths.get(a.getFilePath()));
                return Image.getInstance(bytes);
            } catch (Exception ignored) {
                // anexo ausente/ilegível — segue para o próximo
            }
        }
        return null;
    }

    private static boolean isImage(OrderAttachment a) {
        String type = a.getFileType();
        if (type != null && type.toLowerCase().startsWith("image")) return true;
        String path = a.getFilePath();
        if (path == null) return false;
        String p = path.toLowerCase();
        return p.endsWith(".jpg") || p.endsWith(".jpeg") || p.endsWith(".png")
                || p.endsWith(".gif") || p.endsWith(".bmp");
    }

    private static String joinFabrics(Order order) {
        return order.getItems().stream()
                .map(OrderItem::getFabric).filter(OrderReportGenerator::notBlank)
                .map(OrderReportGenerator::capitalize)
                .distinct().collect(Collectors.joining(", "));
    }

    private static String joinCollars(Order order) {
        return order.getItems().stream()
                .map(OrderItem::getCollar).filter(OrderReportGenerator::notBlank)
                .map(OrderReportGenerator::capitalize)
                .distinct().collect(Collectors.joining(", "));
    }

    /** Locais de estampa/bordado aplicados (conceito unificado). */
    private static String joinLocations(Order order) {
        return order.getItems().stream()
                .flatMap(i -> i.getEmbroideries().stream())
                .map(ItemEmbroidery::getLocation).distinct()
                .map(PrintLocation::getLabel)
                .collect(Collectors.joining(", "));
    }

    private static String joinColors(Order order) {
        return order.getItems().stream()
                .flatMap(i -> i.getEmbroideries().stream())
                .flatMap(e -> e.getColors().stream())
                .map(c -> stripHex(c.getName())).filter(OrderReportGenerator::notBlank)
                .distinct().collect(Collectors.joining(", "));
    }

    /** Descrições das aplicações (campo "Bordado:" do modelo). */
    private static String joinDescriptions(Order order) {
        return order.getItems().stream()
                .flatMap(i -> i.getEmbroideries().stream())
                .map(ItemEmbroidery::getDescription).filter(OrderReportGenerator::notBlank)
                .distinct().collect(Collectors.joining(", "));
    }

    /** Primeira letra maiúscula (ex.: "polo" -> "Polo", "algodão" -> "Algodão"). */
    private static String capitalize(String s) {
        if (s == null || s.isBlank()) return safe(s);
        String t = s.trim();
        return Character.toUpperCase(t.charAt(0)) + t.substring(1);
    }

    /** Remove o sufixo de cor hex do nome (ex.: "Azul Royal (#2040A0)" -> "Azul Royal"). */
    private static String stripHex(String name) {
        if (name == null) return "";
        return name.replaceAll("\\s*\\(#?[0-9A-Fa-f]{6}\\)\\s*$", "").trim();
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    private static String safe(String s) {
        return s == null ? "" : s;
    }
}
