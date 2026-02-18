import { useAuth } from "@/lib/auth-context";
import { BackupSystem } from "@/components/backup-system";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BackupPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
