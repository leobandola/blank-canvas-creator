import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PlayerList } from "@/components/player-list";
import { AddPlayerDialog } from "@/components/add-player-dialog";
import { Player } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function PlayersPage() {
  const { user, isAdmin } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlayers = async () => {
    const { data } = await supabase
      .from("players")
      .select("*")
      .order("name", { ascending: true });
    setPlayers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPlayers(); }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Jogadores</h1>
          <p className="text-muted-foreground">Gerencie os participantes do bolão</p>
        </div>
        {isAdmin && <AddPlayerDialog onSuccess={fetchPlayers} />}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <PlayerList players={players} isAuthenticated={isAdmin} onRefresh={fetchPlayers} />
      )}
    </div>
  );
}
