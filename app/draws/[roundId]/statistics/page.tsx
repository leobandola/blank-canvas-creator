import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Trophy, BarChart3, Award } from 'lucide-react';
import { notFound } from 'next/navigation';
import { PrintButton } from "@/components/print-button";

export default async function RoundStatisticsPage({
  params,
}: {
  params: Promise<{ roundId: string }>;
}) {
  const { roundId } = await params;
  const supabase = await createClient();

  // Buscar informações da rodada
  const { data: round } = await supabase
    .from("rounds")
    .select("*")
    .eq("id", roundId)
    .single();

  if (!round) {
    notFound();
  }

  // Buscar todos os sorteios da rodada
  const { data: draws } = await supabase
    .from("draws")
    .select("id, draw_number, draw_date, numbers")
    .eq("round_id", roundId)
    .order("draw_number", { ascending: true });

  // Buscar todos os resultados acumulados
  const { data: results } = await supabase
    .from("results")
    .select(`
      id,
      matches_count,
      accumulated_matches,
      bet:bets(
        id,
        player:players(name)
      )
    `)
    .in("draw_id", draws?.map(d => d.id) || []);

  // Calcular estatísticas de distribuição de acertos
  const hitDistribution = new Map<number, number>();
  const betAccumulatedHits = new Map<string, number>();

  results?.forEach((result: any) => {
    // Acumular total de acertos por aposta
    const betId = result.bet.id;
    const current = betAccumulatedHits.get(betId) || 0;
    betAccumulatedHits.set(betId, current + result.matches_count);
  });

  // Contar quantas apostas têm cada quantidade de acertos
  betAccumulatedHits.forEach((totalHits) => {
    const count = hitDistribution.get(totalHits) || 0;
    hitDistribution.set(totalHits, count + 1);
  });

  // Ordenar por número de acertos (decrescente)
  const sortedDistribution = Array.from(hitDistribution.entries())
    .sort((a, b) => b[0] - a[0]);

  // Buscar apostas totais
  const { count: totalBets } = await supabase
    .from("bets")
    .select("*", { count: "exact", head: true })
    .eq("round_id", roundId);

  // Encontrar maior número de acertos
  const maxHits = sortedDistribution[0]?.[0] || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 print:hidden">
          <Button asChild variant="ghost" className="mb-4">
            <Link href={`/draws/${roundId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Sorteios
            </Link>
          </Button>
        </div>

        {/* Header do Relatório */}
        <Card className="mb-6 border-blue-600 border-2">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-8 w-8" />
                  <CardTitle className="text-3xl font-black uppercase tracking-wide">
                    {round.name}
                  </CardTitle>
                </div>
                <div className="flex gap-4 text-sm">
                  <span>
                    <strong>INÍCIO:</strong>{" "}
                    {round.round_start_date
                      ? new Date(round.round_start_date).toLocaleDateString("pt-BR")
                      : "N/A"}
                  </span>
                  <span>
                    <strong>FINAL:</strong>{" "}
                    {round.payment_deadline
                      ? new Date(round.payment_deadline).toLocaleDateString("pt-BR")
                      : "N/A"}
                  </span>
                  <span>
                    <strong>TOTAL DE APOSTAS:</strong> {totalBets || 0}
                  </span>
                </div>
              </div>
              <div className="print:hidden">
                <PrintButton />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Distribuição da Premiação Total */}
        {round.total_prize_pool && (
          <Card className="mb-6">
            <CardHeader className="bg-blue-600 text-white">
              <CardTitle className="text-center text-xl uppercase">
                Distribuição da Premiação Total
              </CardTitle>
            </CardHeader>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-6xl font-black text-blue-900">
                  R$ {round.total_prize_pool.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Premiação paga em até 5 dias úteis
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Prêmios Principais */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-amber-100 to-amber-50">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-600" />
                Prêmios Principais
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {round.prize_10_hits && (
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border-2 border-amber-200">
                  <span className="font-bold text-lg">PRÊMIO 10 ACERTOS</span>
                  <span className="text-2xl font-black text-amber-700">
                    R$ {round.prize_10_hits.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              
              {round.prize_2nd_place && (
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <span className="font-bold">2ª COLOCAÇÃO</span>
                  <span className="text-xl font-bold text-purple-700">
                    R$ {round.prize_2nd_place.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              
              {round.prize_zero_hits && (
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <span className="font-bold">ZERO ACERTO OU MENOS</span>
                  <span className="text-xl font-bold text-blue-700">
                    R$ {round.prize_zero_hits.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prêmios Adicionais */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-emerald-100 to-emerald-50">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-600" />
                Prêmios Adicionais
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {round.prize_per_draw && draws && draws.length > 0 && (
                <>
                  {draws.map((draw) => (
                    <div key={draw.id} className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                      <span className="font-semibold">
                        + ACERTOS <Badge variant="outline" className="ml-2">{draw.draw_number}</Badge> SORTEIO
                      </span>
                      <span className="text-lg font-bold text-emerald-700">
                        R$ {round.prize_per_draw.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </>
              )}
              
              {round.prize_indication && (
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border-2 border-slate-200">
                  <span className="font-bold">PRÊMIO INDICAÇÃO</span>
                  <span className="text-lg font-bold text-slate-700">
                    R$ {round.prize_indication.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Distribuição de Acertos */}
        <Card>
          <CardHeader className="bg-purple-600 text-white">
            <CardTitle className="text-center text-xl uppercase">
              Informativo - Distribuição de Acertos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-purple-100">
                    <th className="border-2 border-purple-300 p-3 text-center font-bold">
                      Quantidade de Acertos
                    </th>
                    <th className="border-2 border-purple-300 p-3 text-center font-bold">
                      Número de Jogos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDistribution.map(([hits, count]) => (
                    <tr key={hits} className={hits === maxHits ? "bg-amber-50" : ""}>
                      <td className="border-2 border-purple-200 p-4 text-center text-2xl font-bold text-purple-700">
                        {hits.toString().padStart(2, "0")}
                      </td>
                      <td className="border-2 border-purple-200 p-4 text-center text-2xl font-bold">
                        {count}
                      </td>
                    </tr>
                  ))}
                  {sortedDistribution.length === 0 && (
                    <tr>
                      <td colSpan={2} className="border-2 border-purple-200 p-8 text-center text-muted-foreground">
                        Nenhum resultado disponível ainda
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {maxHits >= 10 && (
              <div className="mt-4 p-4 bg-amber-100 rounded-lg border-2 border-amber-300">
                <p className="text-center font-bold text-amber-900">
                  🏆 {hitDistribution.get(maxHits)} jogo(s) completaram os 10 acertos! 🏆
                </p>
              </div>
            )}
            
            <p className="text-center text-xs text-muted-foreground mt-4 italic">
              Havendo mais de um ganhador em qualquer faixa de premiação, o valor do prêmio será dividido em partes iguais.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
