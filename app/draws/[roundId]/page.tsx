import { createClient } from "@/lib/supabase/server";
import { DrawsDetailList } from "@/components/draws-detail-list";
import { AddDrawDialog } from "@/components/add-draw-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { UserNav } from '@/components/user-nav';

export default async function DrawDetailPage({
  params,
}: {
  params: Promise<{ roundId: string }>;
}) {
  const { roundId } = await params;
  const supabase = await createClient();
  const user = await getUser();

  const { data: round, error: roundError } = await supabase
    .from("rounds")
    .select("*")
    .eq("id", roundId)
    .single();

  if (roundError || !round) {
    notFound();
  }

  const { data: draws, error: drawsError } = await supabase
    .from("draws")
    .select("*")
    .eq("round_id", roundId)
    .order("draw_number", { ascending: false });

  if (drawsError) {
    console.error("Error fetching draws:", drawsError);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {user && (
          <div className="flex justify-end mb-4">
            <UserNav user={user} />
          </div>
        )}

        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/draws">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Sorteios
            </Link>
          </Button>

          <Card className="border-blue-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl mb-3">{round.name}</CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant={round.status === "active" ? "default" : "secondary"}
                      className={round.status === "active" ? "bg-blue-600" : ""}
                    >
                      {round.status === "active" ? "Ativa" : "Finalizada"}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {round.lottery_type === "quina" ? "Quina (1-80)" : "Mega Sena (1-60)"}
                    </Badge>
                  </div>
                </div>
                {user && round.status === "active" && (
                  <AddDrawDialog roundId={roundId} lotteryType={round.lottery_type} nextDrawNumber={(draws?.[0]?.draw_number || 0) + 1} />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {draws?.length || 0} {draws?.length === 1 ? "sorteio realizado" : "sorteios realizados"}
              </p>
            </CardContent>
          </Card>
        </div>

        <DrawsDetailList draws={draws || []} roundId={roundId} />
      </div>
    </div>
  );
}
