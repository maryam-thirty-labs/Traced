import { get, post } from "@/shared/lib/api/http";
import type {
  LessonCompletionDto,
  LessonDto,
  RetrievalAnswer,
} from "../types/lesson.types";

export async function getTodayLesson(): Promise<LessonDto> {
  return get<LessonDto>("/api/lessons/today");
}

export async function completeTodayLesson(
  answers: RetrievalAnswer[],
): Promise<LessonCompletionDto> {
  return post<LessonCompletionDto>("/api/lessons/today/complete", {
    retrievalAnswers: answers,
  });
}
