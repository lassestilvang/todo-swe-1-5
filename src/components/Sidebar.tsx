"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Plus, List, Tag, Calendar, Inbox, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/contexts/TaskContext";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListColor, setNewListColor] = useState("#3b82f6");
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const { state, actions } = useTaskContext();

  const navigationItems = [
    { icon: Inbox, label: "Inbox", count: 5 },
    { icon: Calendar, label: "Today", count: 3 },
    { icon: List, label: "Week", count: 8 },
    { icon: Tag, label: "All Tasks", count: 16 },
  ];

  const handleCreateList = async () => {
    if (newListName.trim()) {
      await actions.createList({
        name: newListName.trim(),
        color: newListColor,
        isDefault: false,
      });
      setNewListName("");
      setNewListColor("#3b82f6");
      setIsListDialogOpen(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    await actions.deleteList(listId);
  };

  const handleEditList = (listId: string) => {
    setEditingListId(listId);
  };

  const handleUpdateList = async (listId: string, newName: string) => {
    await actions.updateList(listId, { name: newName });
    setEditingListId(null);
  };

  const getListTaskCount = (listId: string) => {
    return state.tasks.filter(task => task.listId === listId && !task.completed).length;
  };

  return (
    <motion.div
      className={cn(
        "flex flex-col bg-card border-r",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
      layout
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between p-4 border-b"
        layout
      >
        <AnimatePresence>
          {!isCollapsed && (
            <motion.h2 
              className="text-lg font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              Task Planner
            </motion.h2>
          )}
        </AnimatePresence>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ duration: 0.2 }}
            >
              {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </motion.div>
          </Button>
        </motion.div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {navigationItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <item.icon className="h-4 w-4" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="ml-2 flex-1 flex items-center"
                    >
                      <span className="flex-1">{item.label}</span>
                      {item.count > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {item.count}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Lists Section */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Lists</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsListDialogOpen(true)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {state.lists.map((list) => (
                <div
                  key={list.id}
                  className="group flex items-center"
                >
                  {editingListId === list.id ? (
                    <Input
                      defaultValue={list.name}
                      className="flex-1 h-8 text-sm"
                      onBlur={(e) => handleUpdateList(list.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUpdateList(list.id, e.currentTarget.value);
                        } else if (e.key === "Escape") {
                          setEditingListId(null);
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <>
                      <Button variant="ghost" className="flex-1 justify-start px-2 h-8">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: list.color }}
                        />
                        <span className="flex-1 text-left">{list.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {getListTaskCount(list.id)}
                        </span>
                      </Button>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleEditList(list.id)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        {!list.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500"
                            onClick={() => handleDeleteList(list.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Labels Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Labels</h3>
                <Button variant="ghost" size="sm">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-1">
                {state.labels.map((label) => (
                  <Button key={label.id} variant="ghost" className="w-full justify-start px-2 h-8">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="flex-1 text-left">{label.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {state.tasks.filter(task => task.labels?.some(l => l.id === label.id)).length}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Footer */}
      <motion.div 
        className="p-2 border-t"
        layout
      >
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              className="ml-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              New Task
            </motion.span>
          )}
        </AnimatePresence>
        <Button variant="ghost" className="w-full justify-start">
          <Plus className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Create List Dialog */}
      <Dialog open={isListDialogOpen} onOpenChange={setIsListDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">List Name</label>
              <Input
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <div className="flex space-x-2 mt-1">
                {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"].map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "w-8 h-8 rounded-full border-2",
                      newListColor === color ? "border-gray-900" : "border-gray-300"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewListColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsListDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateList}>
                Create List
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
