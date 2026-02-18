import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { PrizesRoundsList } from "@/components/prizes-rounds-list";
import { Loader2 } from "lucide-react";
import { Round } from "@/lib/types";

export default function PrizesPage() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from("rounds").select("*").order("created_at", { ascending: false });
      setRounds(data || []);
      setLoading(false);
    }
    fetch();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Premiações</h1>
          <p className="text-muted-foreground">Confira os vencedores e prêmios distribuídos</p>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <PrizesRoundsList rounds={rounds} />
      )}
    </div>
  );
}
