import { get, post } from "@/shared/lib/api/http";
import type { EtymologyGardenDto } from "../types/etymology.types";

export async function getGarden(): Promise<EtymologyGardenDto> {
  return get<EtymologyGardenDto>("/api/etymology/garden");
}

export async function collectRoot(rootId: string): Promise<{ firstTime: boolean }> {
  return post<{ collected: boolean; firstTime: boolean }>(
    `/api/etymology/${rootId}/collect`,
    {},
  );
}
