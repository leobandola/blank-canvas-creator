import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Home, TrendingUp } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { UserNav } from '@/components/user-nav';

export default async function DrawsPage() {
  const supabase = await createClient();
  const user = await getUser();

  const { data: rounds, error } = await supabase
    .from("rounds")
    .select("*, draws(count)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching rounds:", error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {user && (
          <div className="flex justify-end mb-4">
            <UserNav user={user} />
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-blue-900 mb-2">
              Sorteios
            </h1>
            <p className="text-muted-foreground">
              Registre e confira os resultados dos sorteios de cada rodada
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Início
            </Link>
          </Button>
        </div>

        {!rounds || rounds.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhuma rodada cadastrada. Crie uma rodada para começar a registrar sorteios.
              </p>
              <Button asChild className="mt-4">
                <Link href="/rounds">Criar Rodada</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {rounds.map((round: any) => (
              <Card key={round.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{round.name}</CardTitle>
                      <CardDescription className="mb-3">
                        Criada em {new Date(round.created_at).toLocaleDateString('pt-BR')}
                      </CardDescription>
                      <div className="flex gap-2 flex-wrap">
                        <Badge
                          variant={round.status === "active" ? "default" : "secondary"}
                          className={round.status === "active" ? "bg-blue-600" : ""}
                        >
                          {round.status === "active" ? "Ativa" : "Finalizada"}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {round.lottery_type === "quina" ? "Quina" : "Mega Sena"}
                        </Badge>
                        <Badge variant="outline">
                          {round.draws?.[0]?.count || 0} sorteios
                        </Badge>
                      </div>
                    </div>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                      <Link href={`/draws/${round.id}`}>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        {round.status === "active" && user ? "Gerenciar" : "Ver"} Sorteios
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
