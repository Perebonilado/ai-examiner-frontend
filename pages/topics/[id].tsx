import TopicsTableRow from "@/@modules/topics/TopicsTableRow";
import { AppLoader } from "@/@shared/components/AppLoader";
import EnhancedTable from "@/@shared/components/EnhancedTable/EnhancedTable";
import { Pagination } from "@/@shared/components/Pagination/Pagination";
import Button from "@/@shared/ui/Button";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import { useGetCourseByIdQuery } from "@/api-services/couse.service";
import { useGetAllUserTopicsQuery } from "@/api-services/topic.service";
import { useModalContext } from "@/contexts/ModalContext";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Topic: NextPage = () => {
  const [page, setPage] = useState(1);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const params = useParams();

  const { data, isLoading, error, refetch } = useGetAllUserTopicsQuery(
    { courseId: courseId || "", page, pageSize: 10, title },
    { refetchOnMountOrArgChange: true, skip: !courseId }
  );

  const { data: course, isLoading: courseLoading } = useGetCourseByIdQuery(courseId || "", {
    skip: !courseId,
    refetchOnMountOrArgChange: true,
  });

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
    if (isLoading || courseLoading) {
      setModalContent(<AppLoader />);
    } else {
      setModalContent(null);
    }
  }, [isLoading, courseLoading]);

  useEffect(() => {
    if (params) {
      setCourseId(params.id as string);
    }
  }, [params]);

  return (
    <AppLayout>
      <div className="flex items-center justify-between w-full pb-10">
        {course && <h2 className="text-2xl font-bold">{course.title} Topics</h2>}
        <Button title="Add Topic" />
      </div>
      {!data && error && (
        <div className="flex flex-col gap-4 justify-center items-center py-8">
          <ErrorMessage message="Something went wrong while trying to get topics for this course" />
          <Button title="Reload courses" onClick={refetch} />
        </div>
      )}
      <EnhancedTable
        maxWidth="100%"
        headCellData={[
          { title: "Title", flex: 1 },
          { title: "Question Set Count", flex: 1 },
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
