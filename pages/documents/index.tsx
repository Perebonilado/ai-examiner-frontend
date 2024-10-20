import DocumentCardContainer from "@/@modules/documents/DocumentCardContainer";
import AppHead from "@/@shared/components/AppHead";
import { AppLoader } from "@/@shared/components/AppLoader";
import { Pagination } from "@/@shared/components/Pagination/Pagination";
import Spinner from "@/@shared/components/Spinner";
import Button from "@/@shared/ui/Button";
import ErrorMessage from "@/@shared/ui/ErrorMessage/ErrorMessage";
import TextField from "@/@shared/ui/Input/TextField";
import { useGetAllUserDocumentsQuery } from "@/api-services/document.service";
import { SearchIcon } from "@/icons/SearchIcon";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import React from "react";
import { useEffect, useState } from "react";

const AllDocuments: NextPage = () => {
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState("");
  const { data, isLoading, error, refetch } = useGetAllUserDocumentsQuery(
    { courseId: "", page, pageSize: 10, title, id: "" },
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [title]);

  return (
    <>
      <AppHead title="All Documents" />
      <AppLayout>
        <div className="flex items-start justify-between w-full pb-10 gap-3 max-lg:items-center max-lg:flex-col max-lg:gap-12 mt-7">
          <h2 className="text-2xl font-bold">All Documents</h2>
          <div className="w-full max-w-[350px]">
            <TextField
              label="Search"
              placeholder="Search by title"
              starticon={<SearchIcon />}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
          </div>
        </div>
        {!data && error && (
          <div className="flex flex-col gap-4 justify-center items-center py-8">
            <ErrorMessage message="Something went wrong while trying to get your documents" />
            <Button title="Reload documents" onClick={refetch} />
          </div>
        )}

        {!data && isLoading && (
          <div className="flex flex-col gap-4 justify-center items-center py-8">
            <Spinner size="sm"/>
            <p className="text-center font-semibold">
              Fetching your documents
            </p>
          </div>
        )}

        {data && !data.documents.length && !isLoading && !error && (
          <div className="flex flex-col gap-4 justify-center items-center py-8">
            <p className="text-center mt-3 font-semibold text-lg">
              No documents found
            </p>
          </div>
        )}

        <DocumentCardContainer data={data?.documents} />
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
