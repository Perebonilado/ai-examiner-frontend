import DocumentCardContainer from "@/@modules/documents/DocumentCardContainer";
import AppHead from "@/@shared/components/AppHead";
import { Pagination } from "@/@shared/components/Pagination/Pagination";
import Button from "@/@shared/ui/Button";
import TextField from "@/@shared/ui/Input/TextField";
import { useGetAllUserDocumentsQuery } from "@/api-services/document.service";
import AppLayout from "@/layouts/AppLayout";
import { CircleAlert, FileSearch, Search } from "lucide-react";
import { NextPage } from "next";
import React from "react";
import { useEffect, useState } from "react";

const PAGE_SIZE = 10;

const DocumentGridSkeleton = () => (
  <div
    role="status"
    className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-4 gap-y-[18px] max-md:grid-cols-2 max-md:gap-x-3 max-md:gap-y-4"
  >
    <span className="sr-only">Fetching your documents</span>
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="flex flex-col gap-2.5 animate-pulse" aria-hidden>
        <div className="aspect-[4/3] rounded-xl bg-sunken" />
        <div className="px-0.5">
          <div className="h-3.5 w-4/5 rounded bg-sunken" />
          <div className="h-3 w-1/2 rounded bg-sunken mt-2" />
        </div>
      </div>
    ))}
  </div>
);

const AllDocuments: NextPage = () => {
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState("");
  const { data, isLoading, error, refetch } = useGetAllUserDocumentsQuery(
    { courseId: "", page, pageSize: PAGE_SIZE, title, id: "" },
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [title]);

  const totalCount = data?.meta?.totalCount ?? 0;
  const pageSize = data?.meta?.pageSize || PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <>
      <AppHead title="All Documents" />
      <AppLayout>
        <div className="mx-auto w-full max-w-[1180px]">
          <div className="flex items-end justify-between gap-4 mb-6 max-md:flex-col max-md:items-stretch max-md:mb-[18px]">
            <div>
              <h1 className="text-[28px] max-md:text-2xl leading-[1.2] font-bold tracking-[-0.015em] text-ink">
                All documents
              </h1>
              {data?.meta && (
                <p className="mt-1.5 text-[15px] text-subtle tabular-nums">
                  {totalCount} {totalCount === 1 ? "document" : "documents"}
                </p>
              )}
            </div>
            <div className="w-[340px] max-md:w-full">
              <TextField
                aria-label="Search by title"
                placeholder="Search by title"
                starticon={<Search strokeWidth={1.75} />}
                style={{ height: 40 }}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
              />
            </div>
          </div>

          {!data && error && (
            <div className="flex flex-col items-center text-center gap-3 py-16">
              <span className="w-11 h-11 rounded-full grid place-items-center bg-danger-bg text-danger">
                <CircleAlert size={20} strokeWidth={1.75} />
              </span>
              <p className="text-sm text-subtle max-w-[320px]">
                Something went wrong while trying to get your documents
              </p>
              <Button
                title="Reload documents"
                variant="outlined"
                size="medium"
                className="mt-1"
                onClick={refetch}
              />
            </div>
          )}

          {!data && isLoading && <DocumentGridSkeleton />}

          {data && !data.documents.length && !isLoading && !error && (
            <div className="flex flex-col items-center text-center gap-3 py-16">
              <span className="w-11 h-11 rounded-full grid place-items-center bg-sunken text-muted">
                <FileSearch size={20} strokeWidth={1.75} />
              </span>
              <p className="text-[15px] font-semibold text-ink">
                No documents found
              </p>
            </div>
          )}

          <DocumentCardContainer data={data?.documents} />

          {data && totalPages > 1 && (
            <div className="flex items-center justify-between max-md:justify-center mt-[22px] text-[13px] text-subtle">
              <span className="max-md:hidden tabular-nums">
                Page {page} of {totalPages}
              </span>
              <Pagination
                className="!py-0"
                currentPage={page}
                pageSize={data.meta.pageSize}
                totalCount={data.meta.totalCount}
                onPageChange={(p) => {
                  setPage(() => p);
                }}
              />
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
};

export default AllDocuments;
