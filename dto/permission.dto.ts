export interface PermissionDto {
  maxQA: number;
  maxGenerationReached: boolean;
  canUseAdvancedPreferences: boolean;
  canGenerateMultipleChoice: boolean;
  canGenerateFlashcards: boolean;
  maxFileSizeAllowed: number;
}
