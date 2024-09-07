export interface PermissionModel {
  maxQA: number;
  maxGenerationReached: boolean;
  canUseAdvancedPreferences: boolean;
  canGenerateMultipleChoice: boolean;
  canGenerateFlashcards: boolean;
  maxFileSizeAllowed: number;
  canDiscuss: boolean;
}
