import TopicsTableRow from "@/@modules/topics/TopicsTableRow";
import { AppLoader } from "@/@shared/components/AppLoader";
import EnhancedTable from "@/@shared/components/EnhancedTable/EnhancedTable";
import { Pagination } from "@/@shared/components/Pagination/Pagination";
import Button from "@/@shared/ui/Button";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import DropDown from "@/@shared/ui/Input/DropDown";
import { useGetAllUserCoursesQuery } from "@/api-services/couse.service";
import { useGetAllUserTopicsQuery } from "@/api-services/topic.service";
import { useModalContext } from "@/contexts/ModalContext";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const AllTopics: NextPage = () => {
  const [page, setPage] = useState(1);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [courseOptions, setCourseOptions] = useState<
    {
      label: string;
      value: string;
      defaultSelected?: boolean | undefined;
    }[]
  >([]);
  const { data, isLoading, error, refetch } = useGetAllUserTopicsQuery(
    { courseId: courseId || "", page, pageSize: 10, title, id: "" },
    { refetchOnMountOrArgChange: true }
  );
  const { data: courses } = useGetAllUserCoursesQuery(
    { page, pageSize: 100000000, title: "" },
    { refetchOnMountOrArgChange: true }
  );
  const { setModalContent } = useModalContext();

  useEffect(() => {
    if (error && "status" in error) {
      if ("data" in error) {
        const { message } = error.data as { message: string };
        toast.error(message);
      } else toast.error("Oops! Something went wrong");
    }
  }, [error]);

  useEffect(() => {
    if (isLoading) {
      setModalContent(<AppLoader />);
    } else {
      setModalContent(null);
    }
  }, [isLoading]);

  useEffect(() => {
    if (courses) {
      setCourseOptions(() => [
        { label: "All", value: "", defaultSelected: true },
        ...courses.courses.map((c) => ({ label: c.title, value: c.id })),
      ]);
    }
  }, [courses]);

  return (
    <AppLayout>
      <div className="flex items-center justify-between w-full pb-10 gap-3">
        <h2 className="text-2xl font-bold">All Topics</h2>
        <div className="max-w-[350px] w-full">
          <DropDown
            options={courseOptions}
            label="Filter by Course"
            onChange={(e) => {
              setCourseId(e.target.value);
            }}
          />
        </div>
      </div>
      {!data && error && (
        <div className="flex flex-col gap-4 justify-center items-center py-8">
          <ErrorMessage message="Something went wrong while trying to get your topics" />
          <Button title="Reload topics" onClick={refetch} />
        </div>
      )}
      <EnhancedTable
        maxWidth="100%"
        headCellData={[
          { title: "Title", flex: 1 },
          { title: "Question Sets Count", flex: 1 },
          { title: "Created At", flex: 1 },
          { title: "Actions", flex: 1 },
        ]}
        generic={true}
        rowData={data?.topics}
        rowComponent={(rows) => <TopicsTableRow {...rows} />}
      />
      {data && (
        <Pagination
          className=""
          currentPage={page}
          pageSize={data.meta.pageSize}
          totalCount={data.meta.totalCount}
          onPageChange={(p) => {
            setPage(() => p);
          }}
        />
      )}
    </AppLayout>
  );
};

export default AllTopics;
