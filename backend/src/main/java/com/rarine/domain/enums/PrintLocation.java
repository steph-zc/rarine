package com.rarine.domain.enums;

public enum PrintLocation {
    FRONT_LARGE("Frente grande"),
    FRONT_SMALL("Frente pequena"),
    BACK("Costa"),
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
