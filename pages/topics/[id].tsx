import TopicsTableRow from "@/@modules/topics/TopicsTableRow";
import EnhancedTable from "@/@shared/components/EnhancedTable/EnhancedTable";
import Button from "@/@shared/ui/Button";
import DropDown from "@/@shared/ui/Input/DropDown";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import React from "react";

const Topic: NextPage = () => {
  return (
    <AppLayout>
      <div className="flex items-center justify-between w-full pb-10">
        <h2 className="text-2xl font-bold">Zoo 101 Topics</h2>
        <DropDown
          options={[
            { label: "Zoo 101", value: "123" },
            { label: "Anthropology 101", value: "234" },
          ]}
        />
      </div>
      <EnhancedTable
        maxWidth="100%"
        headCellData={[
          { title: "Title", flex: 1 },
          { title: "Question Count", flex: 1 },
          { title: "Created At", flex: 1 },
          { title: "Actions", flex: 1 },
        ]}
        generic={true}
        rowData={mock}
        rowComponent={(rows: (typeof mock)[0]) => <TopicsTableRow {...rows} />}
      />
    </AppLayout>
  );
};

export default Topic;

const mock = [
  {
    title: "Macro Invertebrates",
    documentLink: "https://google.com",
    questionCount: 3,
    createdAt: new Date(),
  },
  {
    title: "Life Cycle of Mosquitoes",
    documentLink: "https://google.com",
    questionCount: 3,
    createdAt: new Date(),
  },
  {
    title: "Migration of Amphibians",
    documentLink: "https://google.com",
    questionCount: 3,
    createdAt: new Date(),
  },
  {
    title: "Reproduction of Crustaceans",
    documentLink: "https://google.com",
    questionCount: 3,
    createdAt: new Date(),
  },
];
