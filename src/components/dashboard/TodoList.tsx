import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Trash2, ListTodo, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
  created_at: string;
}

export const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", session.user.id)
        .order("completed", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (error: any) {
      console.error("Error loading todos:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    setAdding(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("todos")
        .insert({
          user_id: session.user.id,
          title: newTodo.trim(),
          completed: false,
        });

      if (error) throw error;

      setNewTodo("");
      await loadTodos();
      toast.success("Task added!");
    } catch (error: any) {
      console.error("Error adding todo:", error);
      toast.error("Failed to add task");
    } finally {
      setAdding(false);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("todos")
        .update({ completed: !completed })
        .eq("id", id);

      if (error) throw error;

      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !completed } : todo
      ));
    } catch (error: any) {
      console.error("Error toggling todo:", error);
      toast.error("Failed to update task");
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from("todos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTodos(todos.filter(todo => todo.id !== id));
      toast.success("Task deleted");
    } catch (error: any) {
      console.error("Error deleting todo:", error);
      toast.error("Failed to delete task");
    }
  };

  const incompleteTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <Card className="border-[3px] border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))] bg-yellow-200 overflow-hidden">
      <CardHeader className="border-b-[3px] border-foreground bg-yellow-300 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]">
            <ListTodo className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="font-display text-xl">My Tasks</CardTitle>
            <p className="text-xs font-bold text-foreground">
              {incompleteTodos.length} pending • {completedTodos.length} done
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Add Task Form */}
        <form onSubmit={addTodo} className="flex gap-2">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] bg-card placeholder:text-muted-foreground"
            disabled={adding}
            maxLength={200}
          />
          <Button
            type="submit"
            disabled={!newTodo.trim() || adding}
            className="border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all bg-primary text-primary-foreground"
            size="icon"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        {/* Todo List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {loading ? (
            <p className="text-center text-sm text-muted-foreground py-8">Loading tasks...</p>
          ) : todos.length === 0 ? (
            <div className="text-center py-8 bg-primary/5 rounded-lg border-[3px] border-foreground border-dashed">
              <ListTodo className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-bold">No tasks yet!</p>
              <p className="text-xs text-muted-foreground mt-1">Add your first task above</p>
            </div>
          ) : (
            <>
              {/* Incomplete Tasks */}
              {incompleteTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-start gap-3 p-3 bg-card border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] rounded-lg group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id, todo.completed)}
                    className="mt-0.5 border-[2px] border-foreground data-[state=checked]:bg-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground break-words">
                      {todo.title}
                    </p>
                    {todo.due_date && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(todo.due_date), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTodo(todo.id)}
                    className="h-auto p-1 hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}

              {/* Completed Tasks */}
              {completedTodos.length > 0 && (
                <>
                  {incompleteTodos.length > 0 && (
                    <div className="border-t-[3px] border-foreground my-3"></div>
                  )}
                  {completedTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-start gap-3 p-3 bg-muted/50 border-[3px] border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] rounded-lg group opacity-60"
                    >
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => toggleTodo(todo.id, todo.completed)}
                        className="mt-0.5 border-[2px] border-foreground data-[state=checked]:bg-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-through break-words">
                          {todo.title}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTodo(todo.id)}
                        className="h-auto p-1 hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};