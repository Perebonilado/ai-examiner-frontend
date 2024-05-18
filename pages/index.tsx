import CourseTableRow from "@/@modules/home/CourseTableRow";
import CreateCourseForm from "@/@modules/home/CreateCourseForm";
import Jumbotron from "@/@modules/home/Jumbotron";
import AppHead from "@/@shared/components/AppHead";
import { AppLoader } from "@/@shared/components/AppLoader";
import EnhancedTable from "@/@shared/components/EnhancedTable/EnhancedTable";
import Navbar from "@/@shared/components/Navbar";
import { Pagination } from "@/@shared/components/Pagination/Pagination";
import Button from "@/@shared/ui/Button";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import { useGetAllUserCoursesQuery } from "@/api-services/couse.service";
import { useModalContext } from "@/contexts/ModalContext";
import AppLayout from "@/layouts/AppLayout";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Home() {
  // const [page, setPage] = useState(1);
  // const { data, isLoading, error, refetch } = useGetAllUserCoursesQuery(
  //   { page, pageSize: 10, title: "" },
  //   { refetchOnMountOrArgChange: true }
  // );

  // const { setModalContent } = useModalContext();

  // useEffect(() => {
  //   if (error && "status" in error) {
  //     if ("data" in error) {
  //       const { message } = error.data as { message: string };
  //       toast.error(message);
  //     } else toast.error("Oops! Something went wrong");
  //   }
  // }, [error]);

  // useEffect(() => {
  //   if (isLoading) {
  //     setModalContent(<AppLoader />);
  //   } else {
  //     setModalContent(null);
  //   }
  // }, [isLoading]);

  // const handleCreateCourse = () => {
  //   setModalContent(<CreateCourseForm />);
  // };

  return (
    <>
      <Navbar />
      <Jumbotron />

      {/* <AppHead title="All Courses" />
      <AppLayout>
        <div className="flex items-center justify-between w-full pb-10">
          <h2 className="text-2xl font-bold">All Courses</h2>
          <Button title="Create Course" onClick={handleCreateCourse} />
        </div>
        {!data && error && (
          <div className="flex flex-col gap-4 justify-center items-center py-8">
            <ErrorMessage message="Something went wrong while trying to get your courses" />
            <Button title="Reload courses" onClick={refetch} />
          </div>
        )}
        <EnhancedTable
          maxWidth="100%"
          headCellData={[
            { title: "Title", flex: 1 },
            { title: "Description", flex: 2 },
            { title: "Topic Count", flex: 1 },
            { title: "Created At", flex: 1 },
            // { title: "Actions", flex: 1 },
          ]}
          generic={true}
          rowData={data?.courses || []}
          rowComponent={(rows) => <CourseTableRow {...rows} />}
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
      </AppLayout> */}
    </>
  );
}
