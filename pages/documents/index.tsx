import DocumentCardContainer from "@/@modules/documents/DocumentCardContainer";
import DocumentsTableRow from "@/@modules/documents/DocumentsTableRow";
import AppHead from "@/@shared/components/AppHead";
import { AppLoader } from "@/@shared/components/AppLoader";
import EnhancedTable from "@/@shared/components/EnhancedTable/EnhancedTable";
import { Pagination } from "@/@shared/components/Pagination/Pagination";
import Button from "@/@shared/ui/Button";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import TextField from "@/@shared/ui/Input/TextField";
import { useGetAllUserDocumentsQuery } from "@/api-services/document.service";
import { useModalContext } from "@/contexts/ModalContext";
import { SearchIcon } from "@/icons/SearchIcon";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const AllDocuments: NextPage = () => {
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState("");
  const { data, isLoading, error, refetch } = useGetAllUserDocumentsQuery(
    { courseId: "", page, pageSize: 10, title, id: "" },
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

  return (
    <>
      <AppHead title="All Documents" />
      <AppLayout>
        <div className="flex items-center justify-between w-full pb-10 gap-3 max-lg:flex-col max-lg:gap-12">
          <h2 className="text-2xl font-bold">All Documents</h2>
          <div className="w-full max-w-[350px]">
            <TextField label="Search" placeholder="Search by title" starticon={<SearchIcon />} value={title} onChange={(e)=>{
              setTitle(e.target.value)
            }}/>
          </div>
        </div>
        {!data && error && (
          <div className="flex flex-col gap-4 justify-center items-center py-8">
            <ErrorMessage message="Something went wrong while trying to get your documents" />
            <Button title="Reload documents" onClick={refetch} />
          </div>
        )}

        <DocumentCardContainer data={data?.documents}/>
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
    </>
  );
};

export default AllDocuments;
