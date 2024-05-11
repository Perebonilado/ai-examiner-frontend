import QuestionTableRow from "@/@modules/questions/QuestionTableRow";
import EnhancedTable from "@/@shared/components/EnhancedTable/EnhancedTable";
import Button from "@/@shared/ui/Button";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import React from "react";

const ViewQuestions: NextPage = () => {
  return (
    <AppLayout>
      <div className="flex items-center justify-between w-full pb-10">
        <h2 className="text-2xl font-bold">Zoo 101 Questions</h2>
        <Button title="Generate New Questions" />
      </div>
      <EnhancedTable
        maxWidth="100%"
        headCellData={[
            { title: "id", flex: 1 },
            { title: "type", flex: 1 },
            { title: "Created At", flex: 1 },
          { title: "Count", flex: 1 },
          { title: "Actions", flex: 1 },
        ]}
        generic={true}
        rowData={mock}
        rowComponent={(rows: (typeof mock)[0]) => (
          <QuestionTableRow {...rows} />
        )}
      />
    </AppLayout>
  );
};

export default ViewQuestions;

const mock = [
  {
    id: 1,
    createdAt: new Date(),
    type: "Multiple Choice",
    count: 5,
  },
  {
    id: 2,
    createdAt: new Date(),
    type: "Multiple Choice",
    count: 10,
  },
  {
    id: 3,
    createdAt: new Date(),
    type: "Multiple Choice",
    count: 20,
  },
  {
    id: 4,
    createdAt: new Date(),
    type: "Multiple Choice",
    count: 5,
  },
  {
    id: 5,
    createdAt: new Date(),
    type: "Multiple Choice",
    count: 5,
  },
];
