import { describe, it, expect } from "bun:test";
import { parseNaturalLanguageInput, getNaturalLanguageSuggestions } from '@/lib/nlp-parser';

describe('Natural Language Parser', () => {
  describe('parseNaturalLanguageInput', () => {
    it('should parse simple task name', () => {
      const result = parseNaturalLanguageInput('Buy groceries');
      expect(result.success).toBe(true);
      expect(result.task?.name).toBe('Buy groceries');
    });

    it('should parse task with priority', () => {
      const result = parseNaturalLanguageInput('Urgent meeting with boss');
      expect(result.success).toBe(true);
      expect(result.task?.name).toBe('meeting with boss');
      expect(result.task?.priority).toBe('High');
    });

    it('should parse task with labels', () => {
      const result = parseNaturalLanguageInput('Review code #work #urgent');
      expect(result.success).toBe(true);
      expect(result.task?.name).toBe('Review code');
      expect(result.task?.labels).toEqual(['work', 'urgent']);
    });

    it('should parse task with date', () => {
      const result = parseNaturalLanguageInput('Meeting tomorrow');
      expect(result.success).toBe(true);
      expect(result.task?.name).toBe('Meeting');
      expect(result.task?.date).toBeInstanceOf(Date);
    });

    it('should parse task with time', () => {
      const result = parseNaturalLanguageInput('Call at 2 PM');
      expect(result.success).toBe(true);
      expect(result.task?.name).toBe('Call');
      expect(result.task?.deadline).toBeInstanceOf(Date);
    });

    it('should parse task with date and time', () => {
      const result = parseNaturalLanguageInput('Meeting tomorrow at 2 PM');
      expect(result.success).toBe(true);
      expect(result.task?.name).toBe('Meeting');
      expect(result.task?.date).toBeInstanceOf(Date);
    });

    it('should parse task with estimate', () => {
      const result = parseNaturalLanguageInput('Write report 2h');
      expect(result.success).toBe(true);
      expect(result.task?.name).toBe('Write report');
      expect(result.task?.estimate).toBe('2h');
    });

    it('should parse task with complex estimate', () => {
      const result = parseNaturalLanguageInput('Development 1h 30m');
      expect(result.success).toBe(true);
      expect(result.task?.name).toBe('Development');
      expect(result.task?.estimate).toBe('1h 30m');
    });

    it('should parse task with recurring pattern', () => {
      const result = parseNaturalLanguageInput('Daily standup meeting');
      expect(result.success).toBe(true);
      expect(result.task?.name).toBe('standup meeting');
      expect(result.task?.recurringPattern).toBe('daily');
    });

    it('should parse task with custom recurring interval', () => {
      const result = parseNaturalLanguageInput('Team sync every 2 weeks');
      expect(result.success).toBe(true);
      expect(result.task?.name).toBe('Team sync');
      expect(result.task?.recurringPattern).toBe('weekly');
      expect(result.task?.recurringInterval).toBe(2);
    });

    it('should parse complex task with all fields', () => {
      const result = parseNaturalLanguageInput('Important client presentation tomorrow at 3 PM #work 2h weekly');
      expect(result.success).toBe(true);
      expect(result.task?.name).toBe('client presentation');
      expect(result.task?.priority).toBe('High');
      expect(result.task?.labels).toEqual(['work']);
      expect(result.task?.estimate).toBe('2h');
      expect(result.task?.recurringPattern).toBe('weekly');
      expect(result.task?.date).toBeInstanceOf(Date);
    });

    it('should parse task with description using dash separator', () => {
      const result = parseNaturalLanguageInput('Meeting - Discuss project timeline');
      expect(result.success).toBe(true);
      expect(result.task?.name).toBe('Meeting');
      expect(result.task?.description).toBe('Discuss project timeline');
    });

    it('should parse task with description using colon separator', () => {
      const result = parseNaturalLanguageInput('Call: Follow up on proposal');
      expect(result.success).toBe(true);
      expect(result.task?.name).toBe('Call');
      expect(result.task?.description).toBe('Follow up on proposal');
    });

    it('should handle empty input', () => {
      const result = parseNaturalLanguageInput('');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Empty input');
    });

    it('should handle whitespace-only input', () => {
      const result = parseNaturalLanguageInput('   ');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Empty input');
    });
  });

  describe('getNaturalLanguageSuggestions', () => {
    it('should return time suggestions when no time is present', () => {
      const suggestions = getNaturalLanguageSuggestions('Meeting tomorrow');
      expect(suggestions.some(s => s.includes('Add time'))).toBe(true);
    });

    it('should return date suggestions when no date is present', () => {
      const suggestions = getNaturalLanguageSuggestions('Meeting at 2 PM');
      expect(suggestions.some(s => s.includes('Add date'))).toBe(true);
    });

    it('should return priority suggestions when no priority is present', () => {
      const suggestions = getNaturalLanguageSuggestions('Meeting tomorrow');
      expect(suggestions.some(s => s.includes('Add priority'))).toBe(true);
    });

    it('should return label suggestions when no labels are present', () => {
      const suggestions = getNaturalLanguageSuggestions('Meeting tomorrow');
      expect(suggestions.some(s => s.includes('Add labels'))).toBe(true);
    });

    it('should return estimate suggestions when no estimate is present', () => {
      const suggestions = getNaturalLanguageSuggestions('Meeting tomorrow');
      expect(suggestions.some(s => s.includes('Add estimate'))).toBe(true);
    });

    it('should return recurring suggestions when no recurring pattern is present', () => {
      const suggestions = getNaturalLanguageSuggestions('Meeting tomorrow');
      expect(suggestions.some(s => s.includes('Add recurring'))).toBe(true);
    });

    it('should return fewer suggestions for complete input', () => {
      const suggestions = getNaturalLanguageSuggestions('Urgent meeting tomorrow at 2 PM #work 2h daily');
      expect(suggestions.length).toBeLessThan(6);
    });

    it('should return no suggestions for very short input', () => {
      const suggestions = getNaturalLanguageSuggestions('hi');
      expect(suggestions).toEqual([]);
    });

    it('should return no suggestions for empty input', () => {
      const suggestions = getNaturalLanguageSuggestions('');
      expect(suggestions).toEqual([]);
    });
  });

  describe('Date parsing edge cases', () => {
    it('should parse relative dates correctly', () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = parseNaturalLanguageInput('Meeting tomorrow');
      expect(result.success).toBe(true);
      expect(result.task?.date?.toDateString()).toBe(tomorrow.toDateString());
    });

    it('should parse weekdays correctly', () => {
      const result = parseNaturalLanguageInput('Meeting Monday');
      expect(result.success).toBe(true);
      expect(result.task?.date).toBeInstanceOf(Date);
    });

    it('should parse specific dates with slashes', () => {
      const result = parseNaturalLanguageInput('Meeting on 12/25/2024');
      expect(result.success).toBe(true);
      expect(result.task?.date).toBeInstanceOf(Date);
    });

    it('should parse ISO dates', () => {
      const result = parseNaturalLanguageInput('Meeting on 2024-12-25');
      expect(result.success).toBe(true);
      expect(result.task?.date).toBeInstanceOf(Date);
    });
  });

  describe('Priority parsing', () => {
    it('should parse various urgency levels as High priority', () => {
      const urgentWords = ['urgent', 'asap', 'critical', 'emergency'];
      urgentWords.forEach(word => {
        const result = parseNaturalLanguageInput(`Task ${word}`);
        expect(result.success).toBe(true);
        expect(result.task?.priority).toBe('High');
      });
    });

    it('should parse importance as High priority', () => {
      const result = parseNaturalLanguageInput('Important task');
      expect(result.success).toBe(true);
      expect(result.task?.priority).toBe('High');
    });

    it('should parse medium priority', () => {
      const mediumWords = ['medium', 'moderate', 'normal'];
      mediumWords.forEach(word => {
        const result = parseNaturalLanguageInput(`Task ${word} priority`);
        expect(result.success).toBe(true);
        expect(result.task?.priority).toBe('Medium');
      });
    });

    it('should parse low priority', () => {
      const lowWords = ['low', 'minor', 'casual'];
      lowWords.forEach(word => {
        const result = parseNaturalLanguageInput(`Task ${word} priority`);
        expect(result.success).toBe(true);
        expect(result.task?.priority).toBe('Low');
      });
    });
  });
});
