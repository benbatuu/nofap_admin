'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from './use-api';

export interface FilterField {
  key: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'boolean';
  label: string;
  placeholder?: string;
  options?: { value: any; label: string }[];
  defaultValue?: any;
  validation?: (value: any) => string | null;
}

export interface FilterValue {
  [key: string]: any;
}

export interface FilterState {
  values: FilterValue;
  errors: Record<string, string>;
  isValid: boolean;
  hasActiveFilters: boolean;
}

export interface FilterActions {
  setValue: (key: string, value: any) => void;
  setValues: (values: Partial<FilterValue>) => void;
  clearValue: (key: string) => void;
  clearAll: () => void;
  reset: () => void;
  validate: () => boolean;
  getQueryParams: () => URLSearchParams;
  getActiveFilters: () => FilterValue;
}

export interface FilterOptions {
  fields: FilterField[];
  initialValues?: FilterValue;
  debounceMs?: number;
  validateOnChange?: boolean;
  persistToUrl?: boolean;
  storageKey?: string;
  onValuesChange?: (values: FilterValue) => void;
  onValidationChange?: (isValid: boolean, errors: Record<string, string>) => void;
}

export function useFilters(options: FilterOptions): FilterState & FilterActions {
  const {
    fields,
    initialValues = {},
    debounceMs = 300,
    validateOnChange = true,
    persistToUrl = false,
    storageKey,
    onValuesChange,
    onValidationChange,
  } = options;

  // Initialize values with defaults
  const getInitialValues = useCallback(() => {
    const defaults: FilterValue = {};
    
    // Set field defaults
    fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        defaults[field.key] = field.defaultValue;
      }
    });

    // Load from localStorage if storageKey is provided
    if (storageKey && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsedStored = JSON.parse(stored);
          Object.assign(defaults, parsedStored);
        }
      } catch (error) {
        console.warn('Failed to load filters from localStorage:', error);
      }
    }

    // Load from URL if persistToUrl is enabled
    if (persistToUrl && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      fields.forEach(field => {
        const urlValue = urlParams.get(field.key);
        if (urlValue !== null) {
          defaults[field.key] = parseUrlValue(urlValue, field.type);
        }
      });
    }

    return { ...defaults, ...initialValues };
  }, [fields, initialValues, storageKey, persistToUrl]);

  const [values, setValuesState] = useState<FilterValue>(getInitialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Debounced values for search fields
  const debouncedValues = useDebounce(values, debounceMs);

  // Validation
  const validateField = useCallback((field: FilterField, value: any): string | null => {
    if (field.validation) {
      return field.validation(value);
    }

    // Built-in validations
    switch (field.type) {
      case 'number':
        if (value !== undefined && value !== null && value !== '' && isNaN(Number(value))) {
          return `${field.label} must be a valid number`;
        }
        break;
      case 'date':
      case 'daterange':
        if (value && !isValidDate(value)) {
          return `${field.label} must be a valid date`;
        }
        break;
    }

    return null;
  }, []);

  const validateAll = useCallback(() => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const error = validateField(field, values[field.key]);
      if (error) {
        newErrors[field.key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    onValidationChange?.(isValid, newErrors);
    return isValid;
  }, [fields, values, validateField, onValidationChange]);

  // Computed state
  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);
  const hasActiveFilters = useMemo(() => {
    return Object.entries(values).some(([key, value]) => {
      const field = fields.find(f => f.key === key);
      if (!field) return false;
      
      return value !== undefined && 
             value !== null && 
             value !== '' && 
             value !== field.defaultValue &&
             !(Array.isArray(value) && value.length === 0);
    });
  }, [values, fields]);

  // Actions
  const setValue = useCallback((key: string, value: any) => {
    setValuesState(prev => {
      const newValues = { ...prev, [key]: value };
      
      // Validate if enabled
      if (validateOnChange) {
        const field = fields.find(f => f.key === key);
        if (field) {
          const error = validateField(field, value);
          setErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            if (error) {
              newErrors[key] = error;
            } else {
              delete newErrors[key];
            }
            return newErrors;
          });
        }
      }
      
      return newValues;
    });
  }, [fields, validateField, validateOnChange]);

  const setValues = useCallback((newValues: Partial<FilterValue>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
    
    if (validateOnChange) {
      setTimeout(validateAll, 0);
    }
  }, [validateAll, validateOnChange]);

  const clearValue = useCallback((key: string) => {
    setValuesState(prev => {
      const newValues = { ...prev };
      delete newValues[key];
      return newValues;
    });
    
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  }, []);

  const clearAll = useCallback(() => {
    setValuesState({});
    setErrors({});
  }, []);

  const reset = useCallback(() => {
    const defaults = getInitialValues();
    setValuesState(defaults);
    setErrors({});
  }, [getInitialValues]);

  const getQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(','));
          }
        } else {
          params.set(key, String(value));
        }
      }
    });
    
    return params;
  }, [values]);

  const getActiveFilters = useCallback(() => {
    const active: FilterValue = {};
    
    Object.entries(values).forEach(([key, value]) => {
      const field = fields.find(f => f.key === key);
      if (field && value !== undefined && value !== null && value !== '' && value !== field.defaultValue) {
        if (Array.isArray(value) && value.length > 0) {
          active[key] = value;
        } else if (!Array.isArray(value)) {
          active[key] = value;
        }
      }
    });
    
    return active;
  }, [values, fields]);

  // Effects
  useEffect(() => {
    onValuesChange?.(debouncedValues);
  }, [debouncedValues, onValuesChange]);

  // Persist to localStorage
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(values));
      } catch (error) {
        console.warn('Failed to save filters to localStorage:', error);
      }
    }
  }, [values, storageKey]);

  // Persist to URL
  useEffect(() => {
    if (persistToUrl && typeof window !== 'undefined') {
      const params = getQueryParams();
      const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [persistToUrl, getQueryParams]);

  return {
    // State
    values,
    errors,
    isValid,
    hasActiveFilters,
    
    // Actions
    setValue,
    setValues,
    clearValue,
    clearAll,
    reset,
    validate: validateAll,
    getQueryParams,
    getActiveFilters,
  };
}

// Specialized hooks for common filter patterns
export function useSearchFilter(
  initialValue: string = '',
  options: {
    debounceMs?: number;
    minLength?: number;
    onSearch?: (query: string) => void;
  } = {}
) {
  const { debounceMs = 300, minLength = 0, onSearch } = options;
  
  const [query, setQuery] = useState(initialValue);
  const debouncedQuery = useDebounce(query, debounceMs);

  useEffect(() => {
    if (debouncedQuery.length >= minLength) {
      onSearch?.(debouncedQuery);
    }
  }, [debouncedQuery, minLength, onSearch]);

  const clear = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    debouncedQuery,
    setQuery,
    clear,
    isSearching: query !== debouncedQuery,
  };
}

export function useDateRangeFilter(
  initialRange?: { start?: Date; end?: Date },
  options: {
    onRangeChange?: (range: { start?: Date; end?: Date }) => void;
  } = {}
) {
  const { onRangeChange } = options;
  
  const [range, setRange] = useState(initialRange || {});

  const setStart = useCallback((start: Date | undefined) => {
    setRange(prev => ({ ...prev, start }));
  }, []);

  const setEnd = useCallback((end: Date | undefined) => {
    setRange(prev => ({ ...prev, end }));
  }, []);

  const setRange_ = useCallback((newRange: { start?: Date; end?: Date }) => {
    setRange(newRange);
  }, []);

  const clear = useCallback(() => {
    setRange({});
  }, []);

  useEffect(() => {
    onRangeChange?.(range);
  }, [range, onRangeChange]);

  return {
    range,
    setStart,
    setEnd,
    setRange: setRange_,
    clear,
    hasRange: !!(range.start || range.end),
  };
}

export function useMultiSelectFilter<T>(
  options: T[],
  initialSelected: T[] = [],
  onSelectionChange?: (selected: T[]) => void
) {
  const [selected, setSelected] = useState<T[]>(initialSelected);

  const toggle = useCallback((item: T) => {
    setSelected(prev => {
      const isSelected = prev.includes(item);
      const newSelected = isSelected 
        ? prev.filter(i => i !== item)
        : [...prev, item];
      
      onSelectionChange?.(newSelected);
      return newSelected;
    });
  }, [onSelectionChange]);

  const select = useCallback((item: T) => {
    setSelected(prev => {
      if (!prev.includes(item)) {
        const newSelected = [...prev, item];
        onSelectionChange?.(newSelected);
        return newSelected;
      }
      return prev;
    });
  }, [onSelectionChange]);

  const deselect = useCallback((item: T) => {
    setSelected(prev => {
      const newSelected = prev.filter(i => i !== item);
      onSelectionChange?.(newSelected);
      return newSelected;
    });
  }, [onSelectionChange]);

  const selectAll = useCallback(() => {
    setSelected(options);
    onSelectionChange?.(options);
  }, [options, onSelectionChange]);

  const deselectAll = useCallback(() => {
    setSelected([]);
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  const isSelected = useCallback((item: T) => selected.includes(item), [selected]);
  const isAllSelected = useMemo(() => selected.length === options.length, [selected.length, options.length]);
  const isNoneSelected = useMemo(() => selected.length === 0, [selected.length]);

  return {
    selected,
    toggle,
    select,
    deselect,
    selectAll,
    deselectAll,
    isSelected,
    isAllSelected,
    isNoneSelected,
    count: selected.length,
  };
}

// Utility functions
function parseUrlValue(value: string, type: FilterField['type']): any {
  switch (type) {
    case 'number':
      return Number(value);
    case 'boolean':
      return value === 'true';
    case 'multiselect':
      return value.split(',');
    case 'date':
      return new Date(value);
    default:
      return value;
  }
}

function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}