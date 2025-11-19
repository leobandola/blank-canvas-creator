"use client";

import { Round } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy } from 'lucide-react';
import Link from "next/link";

export function PrizesRoundsList({ rounds }: { rounds: Round[] }) {
  if (rounds.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Nenhuma rodada cadastrada ainda.
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
                  <Badge
                    variant={round.status === "active" ? "default" : "secondary"}
                    className={round.status === "active" ? "bg-purple-600" : ""}
                  >
                    {round.status === "active" ? "Ativa" : "Finalizada"}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {round.lottery_type === "quina" ? "Quina" : "Mega Sena"}
                  </Badge>
                </div>
              </div>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href={`/prizes/${round.id}`}>
                  <Trophy className="h-4 w-4 mr-2" />
                  Ver Classificação
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
