import { Client, type StompSubscription } from "@stomp/stompjs";
import { getToken } from "@/shared/lib/auth/auth";

const WS_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/^http/, "ws") + "/ws";

type GameEvent = Record<string, unknown>;

export type GameEventHandler = (event: GameEvent) => void;

/**
 * STOMP client for multiplayer room subscriptions.
 * JWT sent on CONNECT frame — server validates before accepting subscriptions.
 */
export function createStompClient(): Client {
  const token = getToken();

  return new Client({
    brokerURL: WS_URL,
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    reconnectDelay: 5000,
  });
}

export async function subscribeToRoom(
  client: Client,
  roomCode: string,
  handler: GameEventHandler,
): Promise<StompSubscription | null> {
  return new Promise((resolve) => {
    if (!client.connected) {
      client.onConnect = () => {
        const sub = client.subscribe(`/topic/room/${roomCode}`, (message) => {
          try {
            handler(JSON.parse(message.body));
          } catch {
            // ignore malformed
          }
        });
        resolve(sub);
      };
      client.activate();
    } else {
      const sub = client.subscribe(`/topic/room/${roomCode}`, (message) => {
        try {
          handler(JSON.parse(message.body));
        } catch {
          // ignore
        }
      });
      resolve(sub);
    }
  });
}
