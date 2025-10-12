import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Save, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Note {
  id: string;
  content: string;
  created_at: string;
}

interface QuickNotesProps {
  compact?: boolean;
}

export function QuickNotes({ compact = false }: QuickNotesProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, [user?.id]);

  const loadNotes = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from("stylist_notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error loading notes:", error);
      toast.error("Failed to load notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!user?.id) return;
    
    // Validate input
    const trimmedNote = newNote.trim();
    if (!trimmedNote) {
      toast.error("Note cannot be empty");
      return;
    }
    
    if (trimmedNote.length > 500) {
      toast.error("Note must be less than 500 characters");
      return;
    }

    try {
      const { error } = await supabase
        .from("stylist_notes")
        .insert({ user_id: user.id, content: trimmedNote });

      if (error) throw error;

      toast.success("Note saved");
      setNewNote("");
      loadNotes();
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note. Please try again.");
    }
  };

  if (compact) {
    return (
      <div className="space-y-3 bg-gradient-to-b from-yellow-100 to-yellow-50 dark:from-yellow-900/40 dark:to-yellow-800/30 p-4 rounded-lg border-l-4 border-yellow-400 shadow-lg relative overflow-hidden">
        {/* Realistic notepad lines - blue ruled lines */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i} 
              className="border-b border-blue-300/40 dark:border-blue-400/30" 
              style={{ height: '32px', marginTop: i === 0 ? '8px' : '0' }}
            />
          ))}
        </div>
        
        {/* Red margin line on left */}
        <div className="absolute left-12 top-0 bottom-0 w-px bg-red-300/50 dark:bg-red-400/30 pointer-events-none" />
        
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <StickyNote className="h-4 w-4 text-yellow-700 dark:text-yellow-300" />
            <h3 className="text-sm font-bold text-yellow-900 dark:text-yellow-100">Quick Notes</h3>
          </div>
          
          <Textarea
            placeholder="Jot down your thoughts..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            maxLength={500}
            className="min-h-[120px] resize-none bg-transparent border-none focus:ring-1 focus:ring-yellow-400 text-yellow-900 dark:text-yellow-50 placeholder:text-yellow-600/60 dark:placeholder:text-yellow-400/60 shadow-none rounded p-3 pl-14 font-mono text-sm leading-8"
            style={{ lineHeight: '32px' }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-yellow-700 dark:text-yellow-300 font-mono">
              {newNote.length}/500
            </span>
            <Button
              onClick={handleSaveNote}
              disabled={!newNote.trim()}
              size="sm"
              className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-yellow-950 shadow-md"
            >
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="relative z-10 space-y-2 pt-2">
            <div className="h-14 bg-yellow-200/50 dark:bg-yellow-800/30 rounded animate-pulse" />
          </div>
        ) : notes.length > 0 ? (
          <div className="relative z-10 space-y-2 max-h-40 overflow-y-auto pt-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-2.5 rounded bg-yellow-50/80 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50 hover:border-yellow-400 dark:hover:border-yellow-500 transition-colors"
              >
                <p className="text-xs text-yellow-900 dark:text-yellow-50 font-mono leading-relaxed">
                  {note.content}
                </p>
                <p className="text-[10px] text-yellow-600 dark:text-yellow-400 mt-1.5 font-mono">
                  {new Date(note.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <Card className="brutal-border brutal-shadow-lg hover:brutal-shadow-xl transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-display">
          <div className="p-2 rounded-lg bg-gradient-purple-pink">
            <StickyNote className="h-5 w-5 text-primary-foreground" />
          </div>
          <span>Quick Notes</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="space-y-2">
            <Textarea
              placeholder="Jot down a quick note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              maxLength={500}
              className="min-h-[80px] resize-none brutal-border"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {newNote.length}/500
              </span>
              <Button
                onClick={handleSaveNote}
                disabled={!newNote.trim()}
                size="sm"
                className="gap-2 brutal-border brutal-shadow-sm hover:brutal-shadow-md transition-shadow"
              >
                <Save className="h-4 w-4" />
                Save Note
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : notes.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded-lg bg-muted/30 brutal-border text-sm"
                >
                  <p className="text-foreground/90">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              No notes yet. Start writing!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
