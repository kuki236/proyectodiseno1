package com.rrhh.shared.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    public ResourceNotFoundException(String resource, Integer id) {
        super(String.format("%s con ID %d no encontrado", resource, id));
    }
}

