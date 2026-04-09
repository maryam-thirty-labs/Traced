import { SideRail } from "@/shared/ui/SideRail";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SideRail />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
