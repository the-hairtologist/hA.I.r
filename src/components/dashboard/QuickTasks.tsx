import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare, Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Task {
  id: string;
  task: string;
  completed: boolean;
}

export const QuickTasks = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [newTask, setNewTask] = useState("");

  const { data: tasks = [] } = useQuery({
    queryKey: ['quick-tasks', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('stylist_todos')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      return data as Task[] || [];
    },
    enabled: !!session?.user?.id,
  });

  const addTask = useMutation({
    mutationFn: async (task: string) => {
      const { error } = await supabase
        .from('stylist_todos')
        .insert({ user_id: session?.user?.id, task, completed: false });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-tasks'] });
      setNewTask("");
      toast.success("Task added");
    },
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from('stylist_todos')
        .update({ completed })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-tasks'] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('stylist_todos')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-tasks'] });
      toast.success("Task deleted");
    },
  });

  return (
    <Card variant="glass" className="backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl font-pixel">
          <CheckSquare className="h-5 w-5 text-primary" />
          Quick Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add a task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTask.trim()) {
                addTask.mutate(newTask.trim());
              }
            }}
          />
          <Button
            size="icon"
            onClick={() => newTask.trim() && addTask.mutate(newTask.trim())}
            disabled={!newTask.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {tasks.length === 0 ? (
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground text-center py-4">
              No tasks yet. Add one above!
            </p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg brutal-border bg-card/50 group"
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={(checked) =>
                    toggleTask.mutate({ id: task.id, completed: !!checked })
                  }
                />
                <span
                  className={`flex-1 text-xs sm:text-sm lg:text-base ${
                    task.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.task}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteTask.mutate(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
