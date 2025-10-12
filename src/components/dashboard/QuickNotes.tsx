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
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.trim() || !user?.id) return;

    try {
      const { error } = await supabase
        .from("stylist_notes")
        .insert({ user_id: user.id, content: newNote.trim() });

      if (error) throw error;

      toast.success("Note saved");
      setNewNote("");
      loadNotes();
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note");
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
            className="min-h-[140px] resize-none bg-white/50 backdrop-blur-sm border-none focus:ring-0 focus:outline-none text-foreground placeholder:text-muted-foreground/60 shadow-none rounded-lg p-4"
            style={{ 
              fontFamily: 'Georgia, serif',
              lineHeight: '1.8',
              fontSize: '0.95rem'
            }}
          />
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
                <p className="text-sm text-foreground/90 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
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
    <Card className="brutal-border brutal-shadow-lg hover:brutal-shadow-xl transition-all duration-300 bg-gradient-to-br from-card via-primary/5 to-accent/5 overflow-hidden">
      <CardHeader className="pb-3 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-10 blur-3xl rounded-full" />
        <CardTitle className="flex items-center gap-3 text-lg font-display relative z-10">
          <div className="p-2.5 rounded-xl bg-gradient-primary shadow-lg">
            <StickyNote className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-primary bg-clip-text text-transparent font-bold">Quick Notes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="space-y-4">
          <div className="space-y-3">
            <Textarea
              placeholder="Capture your ideas..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[100px] resize-none brutal-border bg-white/50 dark:bg-card/50 backdrop-blur-sm focus:border-primary transition-colors"
              style={{ 
                fontFamily: 'Georgia, serif',
                lineHeight: '1.8'
              }}
            />
            <Button
              onClick={handleSaveNote}
              disabled={!newNote.trim()}
              size="sm"
              className="w-full gap-2 brutal-border brutal-shadow-sm hover:brutal-shadow-md transition-all bg-gradient-primary hover:opacity-90"
            >
              <Save className="h-4 w-4" />
              Save Note
            </Button>
          </div>

          {loading ? (
            <div className="space-y-2 pt-3 border-t border-border">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-muted/30 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : notes.length > 0 ? (
            <div className="space-y-2 max-h-56 overflow-y-auto pt-3 border-t border-border">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="group p-4 rounded-lg bg-gradient-to-br from-white/60 to-white/40 dark:from-card/60 dark:to-card/40 backdrop-blur-sm brutal-border hover:brutal-shadow-sm transition-all duration-200"
                >
                  <p className="text-sm text-foreground/90 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                    {note.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-primary/60" />
                    {new Date(note.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 pt-3 border-t border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-primary/10 mb-3">
                <StickyNote className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                No notes yet. Start writing!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
