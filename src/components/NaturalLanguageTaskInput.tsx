import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNaturalLanguageInput } from '@/hooks/use-natural-language-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Flag, Hash, Repeat, Lightbulb, X, Check } from 'lucide-react';

interface NaturalLanguageTaskInputProps {
  onTaskCreate: (task: any) => void;
  placeholder?: string;
  className?: string;
}

export function NaturalLanguageTaskInput({ 
  onTaskCreate, 
  placeholder = "Try: 'Meeting tomorrow at 2 PM #work urgent'",
  className = ''
}: NaturalLanguageTaskInputProps) {
  const {
    input,
    setInput,
    parsedTask,
    suggestions,
    isParsing,
    error,
    clearInput,
  } = useNaturalLanguageInput();

  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleCreateTask = () => {
    if (parsedTask) {
      onTaskCreate(parsedTask);
      clearInput();
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(`${input} ${suggestion.replace(/^Add \w+: /, '')}`);
  };

  const formatParsedDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: date.getHours() ? 'numeric' : undefined,
      minute: date.getHours() ? 'numeric' : undefined,
    });
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {input && (
          <Button
            size="sm"
            variant="ghost"
            onClick={clearInput}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Error display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-500"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parsed task preview */}
      <AnimatePresence>
        {parsedTask && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3"
          >
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="font-medium text-blue-900">
                      {parsedTask.name}
                    </div>
                    
                    {parsedTask.description && (
                      <div className="text-sm text-blue-700">
                        {parsedTask.description}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {parsedTask.date && (
                        <Badge variant="secondary" className="gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatParsedDate(parsedTask.date)}
                        </Badge>
                      )}
                      
                      {parsedTask.deadline && (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {formatParsedDate(parsedTask.deadline)}
                        </Badge>
                      )}
                      
                      {parsedTask.priority && parsedTask.priority !== 'None' && (
                        <Badge 
                          variant={parsedTask.priority === 'High' ? 'destructive' : 
                                  parsedTask.priority === 'Medium' ? 'default' : 'secondary'}
                          className="gap-1"
                        >
                          <Flag className="h-3 w-3" />
                          {parsedTask.priority}
                        </Badge>
                      )}
                      
                      {parsedTask.estimate && (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {parsedTask.estimate}
                        </Badge>
                      )}
                      
                      {parsedTask.labels && parsedTask.labels.length > 0 && (
                        <div className="flex gap-1">
                          {parsedTask.labels.map((label) => (
                            <Badge key={label} variant="outline" className="gap-1">
                              <Hash className="h-3 w-3" />
                              {label}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {parsedTask.recurringPattern && (
                        <Badge variant="outline" className="gap-1">
                          <Repeat className="h-3 w-3" />
                          {parsedTask.recurringInterval && parsedTask.recurringInterval > 1 
                            ? `Every ${parsedTask.recurringInterval} ${parsedTask.recurringPattern}s`
                            : parsedTask.recurringPattern?.charAt(0).toUpperCase() + parsedTask.recurringPattern?.slice(1)
                          }
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={handleCreateTask}
                    className="ml-3"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Create
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 z-10 mt-1"
          >
            <Card className="border-gray-200 shadow-lg">
              <CardContent className="p-2">
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                  <Lightbulb className="h-4 w-4" />
                  Suggestions
                </div>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full justify-start text-left h-8 px-2 py-1"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
