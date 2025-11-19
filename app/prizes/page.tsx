import { createClient } from "@/lib/supabase/server";
import { PrizesRoundsList } from "@/components/prizes-rounds-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { UserNav } from '@/components/user-nav';

export default async function PrizesPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {user && (
          <div className="flex justify-end mb-4">
            <UserNav user={user} />
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-purple-900 mb-2">
              Premiações
            </h1>
            <p className="text-muted-foreground">
              Confira os vencedores e prêmios distribuídos
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Início
            </Link>
          </Button>
        </div>

        <PrizesRoundsList rounds={rounds || []} />
      </div>
    </div>
  );
}
