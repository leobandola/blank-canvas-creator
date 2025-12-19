import { createClient } from "@/lib/supabase/server"
import { BetsList } from "@/components/bets-list"
import { CreateBetDialog } from "@/components/create-bet-dialog"
import { CopyBetsDialog } from "@/components/copy-bets-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Trophy, FileText } from "lucide-react"
import { notFound } from "next/navigation"
import { getUser } from "@/lib/auth"
import { UserNav } from "@/components/user-nav"

export default async function RoundDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const user = await getUser()

  const { data: round, error: roundError } = await supabase.from("rounds").select("*").eq("id", id).single()

  if (roundError || !round) {
    notFound()
  }

  const { data: bets, error: betsError } = await supabase
    .from("bets")
    .select(`
      *,
      player:players(*),
      payments(*)
    `)
    .eq("round_id", id)
    .order("created_at", { ascending: false })

  const { data: players } = await supabase.from("players").select("*").order("name", { ascending: true })

  if (betsError) {
    console.error("Error fetching bets:", betsError)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {user && (
          <div className="flex justify-end mb-4">
            <UserNav user={user} />
          </div>
        )}

        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/rounds">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Rodadas
            </Link>
          </Button>

          <Card className="border-amber-200">
            <CardHeader>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-3xl mb-3">{round.name}</CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant={round.status === "active" ? "default" : "secondary"}
                      className={round.status === "active" ? "bg-emerald-600" : ""}
                    >
                      {round.status === "active" ? "Ativa" : "Finalizada"}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {round.lottery_type === "quina" ? "Quina (1-80)" : "Mega Sena (1-60)"}
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      R$ {(round.bet_value || 5).toFixed(2)} por aposta
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button asChild variant="outline">
                    <Link href={`/rounds/${id}/report`}>
                      <FileText className="h-4 w-4 mr-2" />
                      Relatório Pagamentos
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/rounds/${id}/closure`}>
                      <FileText className="h-4 w-4 mr-2" />
                      Relatório Fechamento
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Trophy className="h-4 w-4" />
                  <span>
                    {bets?.length || 0} {bets?.length === 1 ? "aposta cadastrada" : "apostas cadastradas"}
                  </span>
                </div>

                {user && round.status === "active" && (
                  <div className="flex gap-2 flex-wrap">
                    <CopyBetsDialog
                      currentRoundId={id}
                      currentRoundName={round.name}
                      lotteryType={round.lottery_type}
                      betValue={round.bet_value || 5}
                    />
                    <CreateBetDialog
                      roundId={id}
                      players={players || []}
                      lotteryType={round.lottery_type}
                      betValue={round.bet_value || 5}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <BetsList bets={bets || []} roundId={id} isAuthenticated={!!user} lotteryType={round.lottery_type} />
      </div>
    </div>
  )
}
