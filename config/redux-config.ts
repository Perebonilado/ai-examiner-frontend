import { AuthService } from "@/api-services/auth.service";
import { CourseService } from "@/api-services/course.service";
import { DocumentTopicService } from "@/api-services/document-topic.service";
import { DocumentService } from "@/api-services/document.service";
import { FileUploadService } from "@/api-services/file-upload.service";
import { LookUpService } from "@/api-services/look-up.service";
import { PermissionService } from "@/api-services/permission.service";
import { PlanService } from "@/api-services/plans.service";
import { QuestionsService } from "@/api-services/questions.service";
import { SubscriptionService } from "@/api-services/subscription.service";
import { UserService } from "@/api-services/user.service";
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import PermissionsReducer from "../features/permissionSlice";
import LoadingAndErrorReducer from "../features/loaderSlice";
import { DocumentMessageService } from "@/api-services/document-message.service";

export const reduxStore = configureStore({
  reducer: {
    [QuestionsService.reducerPath]: QuestionsService.reducer,
    [AuthService.reducerPath]: AuthService.reducer,
    [CourseService.reducerPath]: CourseService.reducer,
    [DocumentService.reducerPath]: DocumentService.reducer,
    [FileUploadService.reducerPath]: FileUploadService.reducer,
    [DocumentTopicService.reducerPath]: DocumentTopicService.reducer,
    [LookUpService.reducerPath]: LookUpService.reducer,
    [PlanService.reducerPath]: PlanService.reducer,
    [SubscriptionService.reducerPath]: SubscriptionService.reducer,
    [UserService.reducerPath]: UserService.reducer,
    [PermissionService.reducerPath]: PermissionService.reducer,
    [DocumentMessageService.reducerPath]: DocumentMessageService.reducer,
    permissionsState: PermissionsReducer,
    loadingAndErrorState: LoadingAndErrorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      QuestionsService.middleware,
      AuthService.middleware,
      CourseService.middleware,
      DocumentService.middleware,
      FileUploadService.middleware,
      DocumentTopicService.middleware,
      LookUpService.middleware,
      PlanService.middleware,
      SubscriptionService.middleware,
      UserService.middleware,
      PermissionService.middleware,
      DocumentMessageService.middleware,
    ]),
});

export type RootState = ReturnType<typeof reduxStore.getState>;

export type AppDispatch = typeof reduxStore.dispatch;

setupListeners(reduxStore.dispatch);
