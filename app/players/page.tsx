import { createClient } from "@/lib/supabase/server";
import { PlayerList } from "@/components/player-list";
import { AddPlayerDialog } from "@/components/add-player-dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { UserNav } from '@/components/user-nav';

export default async function PlayersPage() {
  const supabase = await createClient();
  const user = await getUser();

  const { data: players, error } = await supabase
    .from("players")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching players:", error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {user && (
          <div className="flex justify-end mb-4">
            <UserNav user={user} />
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-emerald-900 mb-2">
              Jogadores
            </h1>
            <p className="text-muted-foreground">
              Gerencie os participantes do bolão
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Início
              </Link>
            </Button>
            {user && <AddPlayerDialog />}
          </div>
        </div>

        <PlayerList players={players || []} isAuthenticated={!!user} />
      </div>
    </div>
  );
}
