import { useState, useCallback } from "react";
import {
  validateProject,
  validateProjectName,
  validateProjectData,
  type ValidationResult,
} from "../services/project-validation";
import type { Project } from "../types";

interface UseProjectValidationProps {
  showWarnings?: boolean;
}

export const useProjectValidation = ({
  showWarnings = true,
}: UseProjectValidationProps = {}) => {
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Validate complete project
  const validateCompleteProject = useCallback(async (project: Project) => {
    setIsValidating(true);

    try {
      const result = validateProject(project);
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Validate project name only
  const validateName = useCallback(async (name: string) => {
    setIsValidating(true);

    try {
      const result = validateProjectName(name);
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Validate project data only
  const validateData = useCallback(async (data: any) => {
    setIsValidating(true);

    try {
      const result = validateProjectData(data);
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Get validation messages for display
  const getValidationMessages = useCallback(() => {
    if (!validationResult) return { errors: [], warnings: [] };

    return {
      errors: validationResult.errors,
      warnings: showWarnings ? validationResult.warnings : [],
    };
  }, [validationResult, showWarnings]);

  // Check if validation passed
  const isValid = validationResult?.isValid ?? true;
  const hasErrors = (validationResult?.errors.length ?? 0) > 0;
  const hasWarnings = (validationResult?.warnings.length ?? 0) > 0;

  // Clear validation result
  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  // Quick validation functions for real-time feedback
  const isNameValid = useCallback((name: string) => {
    const result = validateProjectName(name);
    return result.isValid;
  }, []);

  const getNameErrors = useCallback((name: string) => {
    const result = validateProjectName(name);
    return result.errors;
  }, []);

  return {
    // State
    validationResult,
    isValidating,
    isValid,
    hasErrors,
    hasWarnings,

    // Actions
    validateCompleteProject,
    validateName,
    validateData,
    clearValidation,

    // Helpers
    getValidationMessages,
    isNameValid,
    getNameErrors,
  };
};
