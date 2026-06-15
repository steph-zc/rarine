package com.rarine.domain.enums;

public enum PrintLocation {
    FRONT_LARGE("Frente grande"),
    FRONT_SMALL("Frente pequena"),
    BACK_LARGE("Costas grande"),
    BACK_SMALL("Costas pequena"),
    SLEEVE_RIGHT("Manga direita"),
    SLEEVE_LEFT("Manga esquerda");

    private final String label;

    PrintLocation(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
