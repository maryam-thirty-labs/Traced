import { SideRail } from "@/shared/ui/SideRail";
import { AuthGuard } from "@/shared/lib/auth/AuthGuard";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <SideRail />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </AuthGuard>
  );
}
