package dev.traced.core.cases.exception;

public class CaseTitleViolationException extends RuntimeException {
    public CaseTitleViolationException(String title, String diseaseName) {
        super("Case title must not contain the linked disease name. Title: '"
            + title + "' contains '" + diseaseName + "'");
    }
}
