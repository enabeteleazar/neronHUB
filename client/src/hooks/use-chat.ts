import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sendInputText } from "@/services/neron-api";

export type LocalChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export function useChatHistory() {
  return useQuery({
    queryKey: ["neron", "chat", "history"],
    queryFn: async (): Promise<LocalChatMessage[]> => [],
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message: string) => {
      const result = await sendInputText(message);
      if (!result.ok) throw new Error(result.error?.message || "Failed to send command to Neron Core");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["neron", "chat", "history"] });
    },
  });
}
