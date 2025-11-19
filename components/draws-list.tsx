"use client";

import { Round } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp } from 'lucide-react';
import Link from "next/link";

export function DrawsList({ rounds }: { rounds: Round[] }) {
  if (rounds.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Nenhuma rodada ativa no momento. Crie uma rodada para começar a registrar sorteios.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {rounds.map((round) => (
        <Card key={round.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{round.name}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline" className="capitalize">
                    {round.lottery_type === "quina" ? "Quina" : "Mega Sena"}
                  </Badge>
                </div>
              </div>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href={`/draws/${round.id}`}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Ver Sorteios
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
