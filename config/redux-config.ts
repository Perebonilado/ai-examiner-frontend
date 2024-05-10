import { AuthService } from "@/api-services/auth.service";
import { QuestionsService } from "@/api-services/questions.service";
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

export const reduxStore = configureStore({
  reducer: {
    [QuestionsService.reducerPath]: QuestionsService.reducer,
    [AuthService.reducerPath]: AuthService.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      QuestionsService.middleware,
      AuthService.middleware,
    ]),
});

export type RootState = ReturnType<typeof reduxStore.getState>;

export type AppDispatch = typeof reduxStore.dispatch;

setupListeners(reduxStore.dispatch);
