import { useQuery } from "@tanstack/react-query";
import { examRoutes } from "@/Api/Routes/Exam/index.route";

// Verifique qual tipo está correto:
// - ExamesTypes (com 's') ou ExamsType (sem 's')

export const usePendingExams = () => {
  return useQuery<ExamesTypes[]>({ // Use o tipo correto
    queryKey: ["pending-exams"],
    queryFn: async (): Promise<ExamesTypes[]> => {
      const response = await examRoutes.getPendingExams();
      
      // Type assertion para lidar com unknown
      const data = response as any;
      
      if (data && typeof data === "object" && Array.isArray(data.data)) {
        return data.data;
      }
      
      if (Array.isArray(data)) {
        return data;
      }
      
      return [];
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });
};