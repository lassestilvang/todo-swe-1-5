import { useState, useCallback } from 'react';
import { parseNaturalLanguageInput, getNaturalLanguageSuggestions, ParsedTask } from '@/lib/nlp-parser';

export interface UseNaturalLanguageInput {
  input: string;
  setInput: (value: string) => void;
  parsedTask: ParsedTask | null;
  suggestions: string[];
  isParsing: boolean;
  error: string | null;
  clearInput: () => void;
}

export function useNaturalLanguageInput(): UseNaturalLanguageInput {
  const [input, setInput] = useState('');
  const [parsedTask, setParsedTask] = useState<ParsedTask | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    setError(null);

    if (value.trim()) {
      setIsParsing(true);
      
      try {
        const result = parseNaturalLanguageInput(value);
        if (result.success && result.task) {
          setParsedTask(result.task);
          setError(null);
        } else {
          setParsedTask(null);
          setError(result.error || 'Failed to parse input');
        }
      } catch (err) {
        setParsedTask(null);
        setError('Parsing error');
      } finally {
        setIsParsing(false);
      }

      // Update suggestions
      const newSuggestions = getNaturalLanguageSuggestions(value);
      setSuggestions(newSuggestions);
    } else {
      setParsedTask(null);
      setSuggestions([]);
    }
  }, []);

  const clearInput = useCallback(() => {
    setInput('');
    setParsedTask(null);
    setSuggestions([]);
    setError(null);
    setIsParsing(false);
  }, []);

  return {
    input,
    setInput: handleInputChange,
    parsedTask,
    suggestions,
    isParsing,
    error,
    clearInput,
  };
}
