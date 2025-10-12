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
      <div className="space-y-4">
        <div className="space-y-3">
          <Textarea
            placeholder="Write your thoughts here..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            maxLength={500}
            className="min-h-[140px] resize-none bg-white/50 backdrop-blur-sm border-none focus:ring-0 focus:outline-none text-foreground placeholder:text-muted-foreground/60 shadow-none rounded-lg p-4"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {newNote.length}/500
            </span>
            <Button
              onClick={handleSaveNote}
              disabled={!newNote.trim()}
              size="sm"
              className="gap-2 bg-gradient-primary text-white hover:opacity-90 transition-opacity brutal-border brutal-shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              Save Note
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2 pt-3 border-t border-border/50">
            <div className="h-16 bg-muted/30 rounded-lg animate-pulse" />
          </div>
        ) : notes.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto pt-3 border-t border-border/50">
            {notes.map((note) => (
              <div
                key={note.id}
                className="group relative p-3 rounded-lg bg-white/40 backdrop-blur-sm border border-border/30 hover:border-primary/30 transition-all duration-200 hover:shadow-md"
              >
                <p className="text-sm text-foreground/90">
                  {note.content}
                </p>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <span className="opacity-60">•</span>
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
            <StickyNote className="h-5 w-5 text-white" />
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
