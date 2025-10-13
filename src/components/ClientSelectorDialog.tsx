import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, X, Search } from "lucide-react";
import { useState } from "react";

interface ClientSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: any[];
  selectedClientId: string | null;
  onSelectClient: (clientId: string | null) => void;
}

export const ClientSelectorDialog = ({
  open,
  onOpenChange,
  clients,
  selectedClientId,
  onSelectClient
}: ClientSelectorDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = clients.filter(client =>
    client.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (clientId: string | null) => {
    onSelectClient(clientId);
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Select Client for AI Context
          </DialogTitle>
          <DialogDescription>
            Choose a client to personalize AI responses with their hair history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {selectedClientId && (
            <Button 
              onClick={() => handleSelect(null)}
              variant="outline"
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Client Selection
            </Button>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {filteredClients.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  {searchQuery ? "No clients found" : "No clients yet"}
                </div>
              ) : (
                filteredClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => handleSelect(client.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      client.id === selectedClientId
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {client.full_name || "Unnamed Client"}
                        </p>
                        {client.email && (
                          <p className="text-xs text-muted-foreground truncate">
                            {client.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};