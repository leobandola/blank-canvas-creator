import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Trophy, Target } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function DrawResultsPage({
  params,
}: {
  params: Promise<{ roundId: string; drawId: string }>;
}) {
  const { roundId, drawId } = await params;
  const supabase = await createClient();

  const { data: draw } = await supabase
    .from("draws")
    .select("*")
    .eq("id", drawId)
    .single();

  if (!draw) {
    notFound();
  }

  const { data: results } = await supabase
    .from("results")
    .select(`
      *,
      bet:bets(
        *,
        player:players(*)
      )
    `)
    .eq("draw_id", drawId)
    .order("matches_count", { ascending: false });

  const { data: accumulatedResults } = await supabase
    .from("results")
    .select(`
      bet_id,
      bet:bets(
        player:players(name)
      )
    `)
    .eq("draw_id", drawId)
    .order("accumulated_matches", { ascending: false });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href={`/draws/${roundId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Sorteios
            </Link>
          </Button>

          <Card className="border-blue-200 bg-gradient-to-r from-blue-100 to-emerald-100">
            <CardHeader>
              <CardTitle className="text-3xl mb-3">
                Resultado do Sorteio #{draw.draw_number}
              </CardTitle>
              <div className="flex flex-wrap gap-2 mb-4">
                {draw.numbers.sort((a: number, b: number) => a - b).map((num: number) => (
                  <Badge key={num} variant="default" className="bg-blue-600 text-xl px-4 py-2 font-mono">
                    {num.toString().padStart(2, "0")}
                  </Badge>
                ))}
              </div>
              <p className="text-muted-foreground">
                Data: {new Date(draw.draw_date).toLocaleDateString("pt-BR")}
              </p>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Resultados do Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results?.map((result, index) => (
                  <div
                    key={result.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      index === 0 && result.matches_count > 0
                        ? "bg-amber-50 border-amber-200"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {index === 0 && result.matches_count > 0 && (
                        <Trophy className="h-6 w-6 text-amber-600" />
                      )}
                      <div>
                        <p className="font-semibold">{result.bet.player.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.matched_numbers.sort((a: number, b: number) => a - b).map((num: number) => (
                            <Badge key={num} variant="outline" className="font-mono text-xs">
                              {num.toString().padStart(2, "0")}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={result.matches_count > 0 ? "default" : "secondary"}
                      className={`text-lg px-4 py-1 ${
                        result.matches_count > 0 ? "bg-emerald-600" : ""
                      }`}
                    >
                      {result.matches_count} {result.matches_count === 1 ? "acerto" : "acertos"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
