import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Download } from 'lucide-react';
import { notFound } from 'next/navigation';
import { ClosureReportContent } from '@/components/closure-report-content';
import { getUser } from '@/lib/auth';
import { UserNav } from '@/components/user-nav';

export default async function ClosureReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getUser();

  const { data: round, error: roundError } = await supabase
    .from("rounds")
    .select("*")
    .eq("id", id)
    .single();

  if (roundError || !round) {
    notFound();
  }

  const { data: bets, error: betsError } = await supabase
    .from("bets")
    .select(`
      *,
      payments(*)
    `)
    .eq("round_id", id)
    .order("created_at", { ascending: true });

  if (betsError) {
    console.error("Error fetching bets:", betsError);
  }

  const totalBets = bets?.length || 0;
  const paidBets = bets?.filter(bet => bet.payments?.[0]?.status === 'paid').length || 0;
  const pendingBets = totalBets - paidBets;
  const totalAmount = bets
    ?.filter(bet => bet.payments?.[0]?.status === 'paid')
    .reduce((sum, bet) => sum + (bet.payments?.[0]?.amount || 0), 0) || 0;
  const pendingAmount = bets
    ?.filter(bet => bet.payments?.[0]?.status !== 'paid')
    .reduce((sum, bet) => sum + (bet.payments?.[0]?.amount || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {user && (
          <div className="flex justify-end mb-4 no-print">
            <UserNav user={user} />
          </div>
        )}

        <div className="mb-6 no-print">
          <Button asChild variant="ghost">
            <Link href={`/rounds/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Rodada
            </Link>
          </Button>
        </div>

        <div className="flex justify-end mb-4 no-print">
          <Button onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
        </div>

        <ClosureReportContent
          round={round}
          bets={bets || []}
          totalBets={totalBets}
          paidBets={paidBets}
          pendingBets={pendingBets}
          totalAmount={totalAmount}
          pendingAmount={pendingAmount}
        />
      </div>
    </div>
  );
}
