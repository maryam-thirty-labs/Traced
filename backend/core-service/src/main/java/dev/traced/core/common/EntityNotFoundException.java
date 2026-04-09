package dev.traced.core.common;

public class EntityNotFoundException extends RuntimeException {
    public EntityNotFoundException(String entityType, String identifier) {
        super(entityType + " not found: " + identifier);
    }
}
