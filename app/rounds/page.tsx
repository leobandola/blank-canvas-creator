import { createClient } from "@/lib/supabase/server";
import { RoundsList } from "@/components/rounds-list";
import { CreateRoundDialog } from "@/components/create-round-dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { UserNav } from '@/components/user-nav';

export default async function RoundsPage() {
  const supabase = await createClient();
  const user = await getUser();

  const { data: rounds, error } = await supabase
    .from("rounds")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching rounds:", error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {user && (
          <div className="flex justify-end mb-4">
            <UserNav user={user} />
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-amber-900 mb-2">
              Rodadas
            </h1>
            <p className="text-muted-foreground">
              Gerencie as rodadas ativas e finalizadas
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Início
              </Link>
            </Button>
            {user && <CreateRoundDialog />}
          </div>
        </div>

        <RoundsList rounds={rounds || []} isAuthenticated={!!user} />
      </div>
    </div>
  );
}
