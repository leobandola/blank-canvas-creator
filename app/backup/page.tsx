import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackupSystem } from "@/components/backup-system";
import { createServerClient } from "@/lib/supabase/server";

export default async function BackupPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Sistema de Backup</CardTitle>
        </CardHeader>
        <CardContent>
          <BackupSystem isAuthenticated={!!user} />
        </CardContent>
      </Card>
    </div>
  );
}
