"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar,
  Clock,
  Flag,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  X,
  ChevronRight
} from "lucide-react";
import { 
  SmartSuggestion, 
  ProductivityInsight, 
  WorkloadAnalysis,
  generateSmartSuggestions,
  generateProductivityInsights,
  analyzeWorkload,
  suggestOptimalSchedule
} from "@/lib/smart-suggestions";

interface SmartSuggestionsProps {
  tasks: any[];
  lists: any[];
  labels: any[];
  onSuggestionAction?: (suggestion: SmartSuggestion) => void;
  className?: string;
}

export function SmartSuggestions({ 
  tasks, 
  lists, 
  labels, 
  onSuggestionAction,
  className = ""
}: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [insights, setInsights] = useState<ProductivityInsight[]>([]);
  const [workload, setWorkload] = useState<WorkloadAnalysis | null>(null);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Generate all smart data
    const newSuggestions = generateSmartSuggestions(tasks, lists, labels);
    const newInsights = generateProductivityInsights(tasks);
    const newWorkload = analyzeWorkload(tasks);

    setSuggestions(newSuggestions);
    setInsights(newInsights);
    setWorkload(newWorkload);
  }, [tasks, lists, labels]);

  const handleDismissSuggestion = (suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
  };

  const handleSuggestionClick = (suggestion: SmartSuggestion) => {
    if (onSuggestionAction) {
      onSuggestionAction(suggestion);
    }
  };

  const visibleSuggestions = suggestions.filter(s => !dismissedSuggestions.has(s.id));

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getWorkloadColor = (level: string) => {
    switch (level) {
      case 'overwhelming': return 'text-red-600';
      case 'heavy': return 'text-orange-600';
      case 'moderate': return 'text-yellow-600';
      case 'light': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (!workload) {
    return <div className={className}>Loading insights...</div>;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Workload Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Workload Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{workload.totalTasks}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{workload.completedTasks}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{workload.overdueTasks}</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{workload.upcomingTasks}</div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Workload Level</span>
              <span className={`font-medium ${getWorkloadColor(workload.workloadLevel)}`}>
                {workload.workloadLevel.charAt(0).toUpperCase() + workload.workloadLevel.slice(1)}
              </span>
            </div>
            <Progress 
              value={workload.workloadLevel === 'overwhelming' ? 100 : 
                     workload.workloadLevel === 'heavy' ? 75 :
                     workload.workloadLevel === 'moderate' ? 50 : 25} 
              className="h-2"
            />
          </div>

          {workload.estimatedTotalTime > 0 && (
            <div className="text-sm text-gray-600">
              Estimated total time: {Math.round(workload.estimatedTotalTime / 60)}h {workload.estimatedTotalTime % 60}m
            </div>
          )}
        </CardContent>
      </Card>

      {/* Productivity Insights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Productivity Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium text-sm">{insight.metric}</div>
                <div className="text-xs text-gray-600">{insight.description}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{insight.value}</span>
                {getTrendIcon(insight.trend)}
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Smart Suggestions */}
      {visibleSuggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Smart Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AnimatePresence>
              {visibleSuggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  layout
                >
                  <Card className={`border-l-4 ${
                    suggestion.priority === 'high' ? 'border-l-red-500' :
                    suggestion.priority === 'medium' ? 'border-l-yellow-500' :
                    'border-l-green-500'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {suggestion.type === 'scheduling' && <Calendar className="h-4 w-4" />}
                            {suggestion.type === 'priority' && <Flag className="h-4 w-4" />}
                            {suggestion.type === 'productivity' && <TrendingUp className="h-4 w-4" />}
                            {suggestion.type === 'workload' && <AlertTriangle className="h-4 w-4" />}
                            <h4 className="font-medium">{suggestion.title}</h4>
                            <Badge variant="outline" className={getPriorityColor(suggestion.priority)}>
                              {suggestion.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                          {suggestion.action && (
                            <Button
                              size="sm"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="gap-1"
                            >
                              {suggestion.action.label}
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismissSuggestion(suggestion.id)}
                          className="h-8 w-8 p-0 ml-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
