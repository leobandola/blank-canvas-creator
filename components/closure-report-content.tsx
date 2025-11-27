"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, DollarSign } from "lucide-react"

type Round = {
  id: string
  name: string
  lottery_type: string
  status: string
  start_date: string
}

type BetWithPayment = {
  id: string
  numbers: number[]
  payments: Array<{
    id: string
    status: string
    amount: number
    payment_date: string | null
  }>
}

interface ClosureReportContentProps {
  round: Round
  bets: BetWithPayment[]
  totalBets: number
  paidBets: number
  pendingBets: number
  totalAmount: number
  pendingAmount: number
}

export function ClosureReportContent({
  round,
  bets,
  totalBets,
  paidBets,
  pendingBets,
  totalAmount,
  pendingAmount,
}: ClosureReportContentProps) {
  const sortedBets = [...bets].sort((a, b) => a.id.localeCompare(b.id))

  return (
    <div className="print-content">
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-content {
            width: 100%;
            max-width: 100%;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>

      <Card className="border-amber-200 mb-6">
        <CardHeader className="bg-gradient-to-r from-amber-600 to-red-600 text-white">
          <CardTitle className="text-3xl">Relatório de Fechamento</CardTitle>
          <p className="text-amber-50 mt-2">
            Gerado em{" "}
            {new Date().toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div>
              <span className="font-semibold">Rodada:</span> {round.name}
            </div>
            <div>
              <span className="font-semibold">Tipo:</span>{" "}
              <Badge variant="outline" className="capitalize">
                {round.lottery_type === "quina" ? "Quina (1-80)" : "Mega Sena (1-60)"}
              </Badge>
            </div>
            <div>
              <span className="font-semibold">Status:</span>{" "}
              <Badge variant={round.status === "active" ? "default" : "secondary"}>
                {round.status === "active" ? "Ativa" : "Finalizada"}
              </Badge>
            </div>
            <div>
              <span className="font-semibold">Data de Início:</span>{" "}
              {new Date(round.start_date).toLocaleDateString("pt-BR")}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Apostas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalBets}</div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-700">Pagamentos Efetuados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{paidBets}</div>
            <p className="text-sm text-muted-foreground mt-1">R$ {totalAmount.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-700">Pagamentos Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{pendingBets}</div>
            <p className="text-sm text-muted-foreground mt-1">R$ {pendingAmount.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-700">Total Esperado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">R$ {(totalAmount + pendingAmount).toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Apostas (Anônimas)</CardTitle>
          <p className="text-sm text-muted-foreground">Apostas identificadas apenas por número de jogo</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedBets.map((bet, index) => {
              const payment = bet.payments?.[0]
              const isPaid = payment?.status === "paid"

              return (
                <div key={bet.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">Jogo {index + 1}</h3>
                      <p className="text-xs text-muted-foreground">ID: {bet.id.slice(0, 8)}</p>
                    </div>
                    <div className="text-right">
                      {isPaid ? (
                        <Badge className="bg-emerald-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Pago
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                      {payment && (
                        <p className="text-sm mt-1 flex items-center justify-end">
                          <DollarSign className="h-3 w-3 mr-1" />
                          R$ {payment.amount.toFixed(2)}
                        </p>
                      )}
                      {isPaid && payment?.payment_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Pago em {new Date(payment.payment_date).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Números apostados:</p>
                    <div className="flex flex-wrap gap-1">
                      {bet.numbers
                        .sort((a, b) => a - b)
                        .map((num) => (
                          <Badge key={num} variant="outline" className="font-mono">
                            {num.toString().padStart(2, "0")}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {sortedBets.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nenhuma aposta cadastrada ainda.</p>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6 bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle>Observações do Fechamento</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Este relatório não contém identificação dos jogadores para privacidade</li>
            <li>Cada aposta é identificada apenas por número de jogo</li>
            <li>Use este relatório para conferência final antes dos sorteios</li>
            <li>Para identificação dos jogadores, consulte o Relatório de Pagamentos</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
