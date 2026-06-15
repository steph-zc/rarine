package com.rarine.report;

import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfWriter;

import com.rarine.domain.entity.ItemEmbroidery;
import com.rarine.domain.entity.Order;
import com.rarine.domain.entity.OrderAttachment;
import com.rarine.domain.entity.OrderItem;
import com.rarine.domain.enums.ClientType;
import com.rarine.domain.enums.PrintLocation;

/**
 * Gera a Ficha Técnica (PDF) de uma Ordem de Serviço replicando, com precisão,
 * o modelo MODELO_-_Ficha_técnica-6.pdf.
 *
 * O layout é desenhado por posicionamento absoluto (coordenadas extraídas do
 * modelo), garantindo fidelidade total de fontes, tamanhos, negrito, margens e
 * espaçamento, e que toda a ficha caiba sempre em UMA ÚNICA página A4.
 *
 * As seções DETALHES (10 linhas) e OBSERVAÇÕES (3 linhas) permanecem sempre em
 * branco — preenchidas à mão após a impressão.
 */
public final class OrderReportGenerator {

    // ── Dimensões da página (A4, em pontos) ─────────────────────────────────
    private static final float PAGE_W = 595.28f;
    private static final float PAGE_H = 841.89f;
    private static final float LEFT   = 16.6f;
    private static final float RIGHT  = 578.2f;
    private static final float COL2   = 297.3f;   // divisória de 2 colunas (cliente)
    private static final float TITLE_DIV = 481.6f; // divisória título | Nº

    // Divisórias de coluna da tabela DETALHES
    private static final float D1 = 54.1f, D2 = 93.2f, D3 = 437.0f, D4 = 507.3f;

    // Cores (modelo: barras com K=0,2 → cinza claro)
    private static final java.awt.Color GRAY  = new java.awt.Color(204, 204, 204);
    private static final java.awt.Color BLACK = java.awt.Color.BLACK;
    private static final java.awt.Color GRID  = new java.awt.Color(150, 150, 150);

    // ── Limites horizontais (coordenada "top": origem no topo da página) ─────
    private static final float T_TOP        = 11.9f;
    private static final float T_TITLE_B    = 38.8f;
    private static final float T_IMG_B      = 333.6f;
    private static final float T_INFO_B     = 356.4f;
    private static final float T_CLI1_B     = 373.9f;
    private static final float T_CLI2_B     = 391.5f;
    private static final float T_DESC_B     = 414.3f;
    private static final float T_MAT_B      = 431.4f;
    private static final float T_GOLA_B     = 448.5f;
    private static final float T_EST_B      = 465.6f;
    private static final float T_BORD_B     = 482.6f;
    private static final float T_BL1        = 499.7f;
    private static final float T_BL2        = 516.8f;
    private static final float T_BL3        = 533.9f;
    private static final float T_DET_BARTOP = 551.3f;
    private static final float T_DET_BARBOT = 574.0f;
    private static final float T_DET_HDR_B  = 589.8f;
    private static final float T_DET_BOT    = 749.3f;
    private static final float T_OBS_BARTOP = 749.8f;
    private static final float T_OBS_BARBOT = 772.6f;
    private static final float T_OBS1       = 790.7f;
    private static final float T_OBS2       = 808.9f;
    private static final float T_OBS3       = 827.0f;

    private static BaseFont BOLD;
    private static BaseFont REG;

    private OrderReportGenerator() {}

    public static byte[] generate(Order order, List<OrderAttachment> attachments) {
        Document doc = new Document(PageSize.A4, 0, 0, 0, 0);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            doc.open();
            BOLD = BaseFont.createFont(BaseFont.HELVETICA_BOLD, BaseFont.WINANSI, BaseFont.NOT_EMBEDDED);
            REG  = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.WINANSI, BaseFont.NOT_EMBEDDED);

            PdfContentByte cb = writer.getDirectContent();
            drawFills(cb);
            drawImage(cb, order, attachments);
            drawGrid(cb);
            drawTexts(cb, order);

            doc.close();
        } catch (Exception e) {
            throw new RuntimeException("Falha ao gerar a ficha técnica do pedido " + order.getId(), e);
        }
        return out.toByteArray();
    }

    // ── Conversão top → coordenada PDF (origem no rodapé) ────────────────────
    private static float y(float top) { return PAGE_H - top; }
    private static float baseline(float glyphBottom) { return PAGE_H - glyphBottom + 2f; }

    // ── Fundos cinza das 4 barras de seção ───────────────────────────────────
    private static void drawFills(PdfContentByte cb) {
        band(cb, T_IMG_B, T_INFO_B, GRAY);            // INFORMAÇÕES DO CLIENTE
        band(cb, T_CLI2_B, T_DESC_B, GRAY);           // DESCRIÇÃO DO PEDIDO
        band(cb, T_DET_BARTOP, T_DET_BARBOT, GRAY);   // DETALHES
        band(cb, T_OBS_BARTOP, T_OBS_BARBOT, GRAY);   // OBSERVAÇÕES
    }

    private static void band(PdfContentByte cb, float topA, float topB, java.awt.Color c) {
        cb.setColorFill(c);
        cb.rectangle(LEFT, y(topB), RIGHT - LEFT, topB - topA);
        cb.fill();
    }

    // ── Imagem selecionada para a ficha ──────────────────────────────────────
    private static void drawImage(PdfContentByte cb, Order order, List<OrderAttachment> attachments) {
        Image img = selectedImage(order, attachments);
        if (img == null) return;
        float boxX0 = LEFT + 8, boxX1 = RIGHT - 8;
        float boxTopA = T_TITLE_B + 3, boxTopB = T_IMG_B - 3;
        float maxW = boxX1 - boxX0, maxH = boxTopB - boxTopA;
        img.scaleToFit(maxW, maxH);
        float w = img.getScaledWidth(), h = img.getScaledHeight();
        float cx = (LEFT + RIGHT) / 2f;
        float centerTop = (boxTopA + boxTopB) / 2f;
        img.setAbsolutePosition(cx - w / 2f, y(centerTop) - h / 2f);
        try { cb.addImage(img); } catch (Exception ignored) {}
    }

    // ── Linhas da grade ──────────────────────────────────────────────────────
    private static void drawGrid(PdfContentByte cb) {
        // Estrutura principal — preto
        cb.setColorStroke(BLACK);
        cb.setLineWidth(1f);
        cb.rectangle(LEFT, y(T_OBS3), RIGHT - LEFT, T_OBS3 - T_TOP);
        cb.stroke();

        cb.setLineWidth(0.8f);
        hline(cb, T_TITLE_B);
        vline(cb, TITLE_DIV, T_TOP, T_TITLE_B);
        hline(cb, T_IMG_B);
        hline(cb, T_INFO_B);
        hline(cb, T_CLI1_B);
        hline(cb, T_CLI2_B);
        vline(cb, COL2, T_INFO_B, T_CLI2_B);
        hline(cb, T_DESC_B);
        hline(cb, T_MAT_B);
        hline(cb, T_GOLA_B);
        hline(cb, T_EST_B);
        hline(cb, T_BORD_B);
        hline(cb, T_BL1);
        hline(cb, T_BL2);
        hline(cb, T_BL3);
        hline(cb, T_DET_BARTOP);
        hline(cb, T_DET_BARBOT);
        hline(cb, T_OBS_BARTOP);
        hline(cb, T_OBS_BARBOT);
        hline(cb, T_OBS1);
        hline(cb, T_OBS2);

        // Grade interna de DETALHES — cinza
        cb.setColorStroke(GRID);
        cb.setLineWidth(0.7f);
        hline(cb, T_DET_HDR_B);
        float step = (T_DET_BOT - T_DET_HDR_B) / 10f;
        for (int k = 1; k <= 10; k++) hline(cb, T_DET_HDR_B + step * k);
        vline(cb, D1, T_DET_BARBOT, T_DET_BOT);
        vline(cb, D2, T_DET_BARBOT, T_DET_BOT);
        vline(cb, D3, T_DET_BARBOT, T_DET_BOT);
        vline(cb, D4, T_DET_BARBOT, T_DET_BOT);
    }

    private static void hline(PdfContentByte cb, float top) {
        cb.moveTo(LEFT, y(top));
        cb.lineTo(RIGHT, y(top));
        cb.stroke();
    }

    private static void vline(PdfContentByte cb, float x, float topA, float topB) {
        cb.moveTo(x, y(topA));
        cb.lineTo(x, y(topB));
        cb.stroke();
    }

    // ── Textos ────────────────────────────────────────────────────────────────
    private static void drawTexts(PdfContentByte cb, Order order) {
        var c = order.getClient();
        boolean pj = c.getType() == ClientType.PJ;
        String rawCnpj = pj
                ? (c.getCnpj() != null && !c.getCnpj().isBlank() ? c.getCnpj() : c.getDocument())
                : null;

        cb.setColorFill(BLACK);

        // Cabeçalho
        center(cb, BOLD, 14.3f, "FICHA TECNICA - ORDEM DE SERVIÇO", 297.3f, baseline(33.2f));
        center(cb, BOLD, 17.4f, "Nº " + String.format("%03d", order.getId()), (TITLE_DIV + RIGHT) / 2f, baseline(36.5f));

        // Barras de seção
        center(cb, BOLD, 10.9f, "INFORMAÇÕES DO CLIENTE", 297.3f, baseline(351.7f));
        center(cb, BOLD, 10.9f, "DESCRIÇÃO DO PEDIDO",   297.3f, baseline(409.6f));
        center(cb, BOLD, 10.9f, "DETALHES",              297.3f, baseline(569.4f));
        center(cb, BOLD, 13.0f, "OBSERVAÇÕES:",          297.3f, baseline(769.0f));

        // Informações do cliente
        float ybCli = baseline(372.8f);
        float ybCid = baseline(390.3f);
        label(cb, "Cliente:", 21f, ybCli);
        value(cb, fit(c.getName(), COL2 - 80f, 12f), 80f, ybCli);
        label(cb, "Telefone (wpp):", 301.5f, ybCli);
        value(cb, fit(formatPhone(c.getPhone()), RIGHT - 416f, 12f), 416f, ybCli);
        label(cb, "Cidade:", 20.3f, ybCid);
        value(cb, fit(c.getCity(), COL2 - 78f, 12f), 78f, ybCid);
        label(cb, "CNPJ:", 301.5f, ybCid);
        value(cb, fit(pj ? formatCnpj(rawCnpj) : "", RIGHT - 350f, 12f), 350f, ybCid);

        // Descrição do pedido
        float ybMat  = baseline(431.1f);
        float ybGola = baseline(447.2f);
        float ybEst  = baseline(464.1f);
        float ybBord = baseline(481.3f);
        label(cb, "Material:", 20.3f, ybMat);
        value(cb, fit(joinFabrics(order), RIGHT - 88f, 12f), 88f, ybMat);
        label(cb, "Gola:", 20.4f, ybGola);
        value(cb, fit(joinCollars(order), RIGHT - 62f, 12f), 62f, ybGola);
        label(cb, "Estampa:", 20.4f, ybEst);
        value(cb, fit(joinLocations(order), RIGHT - 92f, 12f), 92f, ybEst);
        label(cb, "Bordado:", 20.5f, ybBord);
        wrapValue(cb, joinDescriptions(order), 90f, 234f, ybBord, 12f);
        label(cb, "Cores:", 239.6f, ybBord);
        wrapValue(cb, joinColorsWithCodes(order), 290f, RIGHT - 4f, ybBord, 12f);

        // Cabeçalho da tabela DETALHES
        float ybHdr = baseline(586.7f);
        center(cb, BOLD, 8.5f, "Qtd.",        (LEFT + D1) / 2f, ybHdr);
        center(cb, BOLD, 8.5f, "Tam.",        (D1 + D2) / 2f,   ybHdr);
        center(cb, BOLD, 8.5f, "Observações", (D2 + D3) / 2f,   ybHdr);
        center(cb, BOLD, 8.5f, "Valor Unit.", (D3 + D4) / 2f,   ybHdr);
        center(cb, BOLD, 8.5f, "Valor total", (D4 + RIGHT) / 2f, ybHdr);
    }

    private static void center(PdfContentByte cb, BaseFont bf, float size, String s, float x, float yb) {
        ColumnText.showTextAligned(cb, Element.ALIGN_CENTER, new Phrase(s, new Font(bf, size)), x, yb, 0);
    }

    private static void label(PdfContentByte cb, String s, float x, float yb) {
        ColumnText.showTextAligned(cb, Element.ALIGN_LEFT, new Phrase(s, new Font(BOLD, 13f)), x, yb, 0);
    }

    private static void value(PdfContentByte cb, String s, float x, float yb) {
        if (s == null || s.isBlank()) return;
        ColumnText.showTextAligned(cb, Element.ALIGN_LEFT, new Phrase(s, new Font(REG, 12f)), x, yb, 0);
    }

    /**
     * Valor (Bordado/Cores) que se ajusta justificado e, quando não cabe na linha,
     * quebra para as linhas de baixo — alinhado à mesma coluna da linha de cima.
     * O texto é limitado verticalmente à área de DESCRIÇÃO (não invade DETALHES).
     */
    private static void wrapValue(PdfContentByte cb, String text, float llx, float urx, float firstBaseline, float size) {
        if (text == null || text.isBlank()) return;
        float leading = 17.1f; // mesmo passo das linhas da descrição
        ColumnText ct = new ColumnText(cb);
        ct.setSimpleColumn(llx, y(T_DET_BARTOP), urx, firstBaseline + leading);
        ct.setLeading(leading);
        ct.setAlignment(Element.ALIGN_JUSTIFIED);
        ct.setText(new Phrase(text, new Font(REG, size)));
        try { ct.go(); } catch (Exception ignored) {}
    }

    /** Trunca o texto (com reticências) para caber em maxW pontos. */
    private static String fit(String s, float maxW, float size) {
        if (s == null) return "";
        s = s.trim();
        if (s.isEmpty() || REG.getWidthPoint(s, size) <= maxW) return s;
        String ell = "…";
        while (s.length() > 1 && REG.getWidthPoint(s + ell, size) > maxW) {
            s = s.substring(0, s.length() - 1);
        }
        return s + ell;
    }

    // ── Imagem ────────────────────────────────────────────────────────────────
    private static Image selectedImage(Order order, List<OrderAttachment> attachments) {
        if (attachments == null || attachments.isEmpty()) return null;
        Long selectedId = order.getImageAttachmentId();
        if (selectedId != null) {
            for (OrderAttachment a : attachments) {
                if (selectedId.equals(a.getId())) {
                    Image img = loadImage(a);
                    if (img != null) return img;
                }
            }
        }
        return firstImage(attachments);
    }

    private static Image firstImage(List<OrderAttachment> attachments) {
        if (attachments == null) return null;
        for (OrderAttachment a : attachments) {
            if (!isImage(a)) continue;
            Image img = loadImage(a);
            if (img != null) return img;
        }
        return null;
    }

    private static Image loadImage(OrderAttachment a) {
        try {
            return Image.getInstance(Files.readAllBytes(Paths.get(a.getFilePath())));
        } catch (Exception e) {
            return null;
        }
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

    // ── Dados ─────────────────────────────────────────────────────────────────
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

    private static String joinLocations(Order order) {
        return order.getItems().stream()
                .flatMap(i -> i.getEmbroideries().stream())
                .map(ItemEmbroidery::getLocation)
                .filter(l -> l != null)
                .distinct()
                .map(PrintLocation::getLabel)
                .collect(Collectors.joining(", "));
    }

    private static String joinDescriptions(Order order) {
        return order.getItems().stream()
                .flatMap(i -> i.getEmbroideries().stream())
                .map(ItemEmbroidery::getDescription)
                .filter(OrderReportGenerator::notBlank)
                .distinct()
                .collect(Collectors.joining(", "));
    }

    /** Cores com código de linha: "Azul Royal (150), Preto (310)". */
    private static String joinColorsWithCodes(Order order) {
        return order.getItems().stream()
                .flatMap(i -> i.getEmbroideries().stream())
                .flatMap(e -> e.getColors().stream())
                .map(col -> {
                    String name = stripHex(col.getName());
                    String code = col.getThreadCode();
                    return notBlank(code) ? name + " (" + code + ")" : name;
                })
                .distinct()
                .collect(Collectors.joining(", "));
    }

    /** Formata telefone: (61) 9 8765-4321 ou (61) 3210-5678 */
    private static String formatPhone(String phone) {
        if (phone == null) return "";
        String d = phone.replaceAll("[^0-9]", "");
        if (d.length() == 11)
            return "(" + d.substring(0, 2) + ") " + d.charAt(2) + " " + d.substring(3, 7) + "-" + d.substring(7);
        if (d.length() == 10)
            return "(" + d.substring(0, 2) + ") " + d.substring(2, 6) + "-" + d.substring(6);
        return safe(phone);
    }

    /** Formata CNPJ: 12.345.678/0001-90 */
    private static String formatCnpj(String cnpj) {
        if (cnpj == null) return "";
        String d = cnpj.replaceAll("[^0-9]", "");
        if (d.length() == 14)
            return d.substring(0, 2) + "." + d.substring(2, 5) + "." + d.substring(5, 8)
                    + "/" + d.substring(8, 12) + "-" + d.substring(12, 14);
        return safe(cnpj);
    }

    private static String capitalize(String s) {
        if (s == null || s.isBlank()) return safe(s);
        String t = s.trim();
        return Character.toUpperCase(t.charAt(0)) + t.substring(1);
    }

    private static String stripHex(String name) {
        if (name == null) return "";
        return name.replaceAll("\\s*\\(#?[0-9A-Fa-f]{6}\\)\\s*$", "").trim();
    }

    private static boolean notBlank(String s) { return s != null && !s.isBlank(); }
    private static String safe(String s) { return s == null ? "" : s; }
}
