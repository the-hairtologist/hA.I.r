import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Save } from "lucide-react";
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
      <div className="space-y-3">
        <div className="space-y-2">
          <Textarea
            placeholder="Write your note here..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-[100px] resize-none bg-transparent border-none focus:ring-0 text-gray-800 placeholder:text-gray-500"
            style={{ 
              fontFamily: 'Courier New, monospace',
              lineHeight: '1.8rem',
              fontSize: '0.95rem'
            }}
          />
          <Button
            onClick={handleSaveNote}
            disabled={!newNote.trim()}
            size="sm"
            className="gap-2"
            variant="secondary"
          >
            <Save className="h-4 w-4" />
            Save Note
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2 pt-2 border-t border-yellow-600/20">
            {[1].map((i) => (
              <div key={i} className="h-12 bg-yellow-300/30 rounded animate-pulse" />
            ))}
          </div>
        ) : notes.length > 0 ? (
          <div className="space-y-2 max-h-40 overflow-y-auto pt-2 border-t border-yellow-600/20">
            {notes.map((note) => (
              <div
                key={note.id}
                className="text-sm pb-2 border-b border-yellow-600/10 last:border-0"
              >
                <p className="text-gray-800" style={{ fontFamily: 'Courier New, monospace', lineHeight: '1.6' }}>
                  {note.content}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <Card className="brutal-border brutal-shadow-lg hover:brutal-shadow-xl transition-shadow bg-gradient-to-br from-card to-warning/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-display">
          <div className="p-2 rounded-lg bg-gradient-amber-orange">
            <StickyNote className="h-5 w-5 text-on-surface-primary" />
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
              className="min-h-[80px] resize-none brutal-border"
            />
            <Button
              onClick={handleSaveNote}
              disabled={!newNote.trim()}
              size="sm"
              className="w-full gap-2 brutal-border brutal-shadow-sm hover:brutal-shadow-md transition-shadow"
            >
              <Save className="h-4 w-4" />
              Save Note
            </Button>
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
