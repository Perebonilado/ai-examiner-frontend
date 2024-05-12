import TopicsTableRow from "@/@modules/topics/TopicsTableRow";
import EnhancedTable from "@/@shared/components/EnhancedTable/EnhancedTable";
import { Pagination } from "@/@shared/components/Pagination/Pagination";
import Button from "@/@shared/ui/Button";
import DropDown from "@/@shared/ui/Input/DropDown";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import React from "react";

const AllTopics: NextPage = () => {
  return (
    <AppLayout>
      <div className="flex items-center justify-between w-full pb-10 gap-3">
        <h2 className="text-2xl font-bold">All Topics</h2>
        <div className="max-w-[350px] w-full">
          <DropDown
            options={[
              { label: "All", value: "", defaultSelected: true },
              { label: "Zoo 101", value: "123" },
              { label: "Anthropology 101", value: "234" },
            ]}
            label="Filter by Course"
          />
        </div>
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
      <Pagination
        className=""
        currentPage={1}
        pageSize={5}
        totalCount={10}
        onPageChange={(p) => {}}
      />
    </AppLayout>
  );
};

export default AllTopics;

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