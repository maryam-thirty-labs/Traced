import { SideRail } from "@/shared/ui/SideRail";
import { AuthGuard } from "@/shared/lib/auth/AuthGuard";
import { MeProvider } from "@/shared/lib/auth/MeContext";
import { LearningActivatedToast } from "@/shared/ui/LearningActivatedToast";
import { SpecialityProvider } from "@/features/speciality/hooks/useSpecialityContext";
import { SpecialityPanel } from "@/features/speciality/components/SpecialityPanel";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <MeProvider>
        <SpecialityProvider>
          <div className="flex h-screen overflow-hidden">
            <SideRail />
            <main className="flex-1 overflow-y-auto">{children}</main>
            <SpecialityPanel />
          </div>
          <LearningActivatedToast />
        </SpecialityProvider>
      </MeProvider>
    </AuthGuard>
  );
}
