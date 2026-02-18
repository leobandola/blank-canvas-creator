import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { RoundsList } from "@/components/rounds-list";
import { CreateRoundDialog } from "@/components/create-round-dialog";
import { Round } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function RoundsPage() {
  const { user } = useAuth();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRounds = async () => {
    const { data } = await supabase
      .from("rounds")
      .select("*")
      .order("created_at", { ascending: false });
    setRounds(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRounds(); }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Rodadas</h1>
          <p className="text-muted-foreground">Gerencie as rodadas ativas e finalizadas</p>
        </div>
        {user && <CreateRoundDialog onSuccess={fetchRounds} />}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <RoundsList rounds={rounds} isAuthenticated={!!user} onRefresh={fetchRounds} />
      )}
    </div>
  );
}
