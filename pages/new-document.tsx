import GenerateQuestionsForm from "@/@modules/home/GenerateQuestionsForm";
import AppHead from "@/@shared/components/AppHead";
import UserManagementBar from "@/@shared/components/UserManagementBar";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import React from "react";

const NewDocument: NextPage = () => {
  return (
    <AppLayout>
      <AppHead title="New Document" />
      <UserManagementBar pageTitle="New Document" />
      <div className="my-20"></div>
      <GenerateQuestionsForm />
    </AppLayout>
  );
};

export default NewDocument;
