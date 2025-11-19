"use client";

import { Button } from "@/components/ui/button";
import { Download, Upload, Database, Lock } from 'lucide-react';
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function BackupSystem({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const supabase = createClient();

  const exportData = async () => {
    if (!isAuthenticated) {
      alert("Você precisa estar autenticado para fazer backup.");
      return;
    }

    setIsExporting(true);
    try {
      const [
        { data: players },
        { data: rounds },
        { data: bets },
        { data: payments },
        { data: draws },
        { data: results },
        { data: winners },
      ] = await Promise.all([
        supabase.from("players").select("*"),
        supabase.from("rounds").select("*"),
        supabase.from("bets").select("*"),
        supabase.from("payments").select("*"),
        supabase.from("draws").select("*"),
        supabase.from("results").select("*"),
        supabase.from("winners").select("*"),
      ]);

      const backup = {
        version: "1.0",
        exported_at: new Date().toISOString(),
        data: {
          players,
          rounds,
          bets,
          payments,
          draws,
          results,
          winners,
        },
      };

      const jsonString = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonString], {
        type: "application/json",
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bolao-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.style.display = "none";
      
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      alert("Backup realizado com sucesso!");
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Erro ao exportar dados: " + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) {
      alert("Você precisa estar autenticado para restaurar backup.");
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm("ATENÇÃO: Restaurar um backup irá SUBSTITUIR todos os dados atuais. Tem certeza que deseja continuar?")) {
      event.target.value = "";
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      if (!backup.data) {
        throw new Error("Formato de backup inválido");
      }

      // Delete existing data (in reverse order due to foreign keys)
      await supabase.from("winners").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("results").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("draws").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("payments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("bets").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("rounds").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("players").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      // Insert backup data
      if (backup.data.players?.length) {
        await supabase.from("players").insert(backup.data.players);
      }
      if (backup.data.rounds?.length) {
        await supabase.from("rounds").insert(backup.data.rounds);
      }
      if (backup.data.bets?.length) {
        await supabase.from("bets").insert(backup.data.bets);
      }
      if (backup.data.payments?.length) {
        await supabase.from("payments").insert(backup.data.payments);
      }
      if (backup.data.draws?.length) {
        await supabase.from("draws").insert(backup.data.draws);
      }
      if (backup.data.results?.length) {
        await supabase.from("results").insert(backup.data.results);
      }
      if (backup.data.winners?.length) {
        await supabase.from("winners").insert(backup.data.winners);
      }

      alert("Backup restaurado com sucesso!");
      window.location.reload();
    } catch (error) {
      console.error("Error importing data:", error);
      alert("Erro ao importar dados: " + (error as Error).message);
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  if (!isAuthenticated) {
    return (
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          Você precisa estar autenticado para acessar o sistema de backup.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          O sistema de backup permite exportar e importar todos os dados da aplicação. Use esta funcionalidade para fazer cópias de segurança regulares.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Download className="h-5 w-5 text-emerald-600" />
                Exportar Dados
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Faça o download de todos os dados em formato JSON.
              </p>
            </div>
            <Button
              onClick={exportData}
              disabled={isExporting}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {isExporting ? "Exportando..." : "Exportar Backup"}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Upload className="h-5 w-5 text-amber-600" />
                Importar Dados
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Restaure um backup anterior. ATENÇÃO: Todos os dados atuais serão substituídos.
              </p>
            </div>
            <div>
              <input
                type="file"
                accept=".json"
                onChange={importData}
                disabled={isImporting}
                className="hidden"
                id="import-file"
              />
              <Button
                onClick={() => document.getElementById('import-file')?.click()}
                disabled={isImporting}
                variant="outline"
                className="w-full border-amber-600 text-amber-600 hover:bg-amber-50"
              >
                {isImporting ? "Importando..." : "Restaurar Backup"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`border rounded-lg ${className}`}>
      {children}
    </div>
  );
}
