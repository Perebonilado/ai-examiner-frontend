import React, { FC } from "react";
import classnames from "classnames";
import { usePagination, DOTS } from "../../../hooks/usePagination";
import s from "./styles.module.scss";

interface Props {
  onPageChange: (p: number) => void;
  totalCount: number;
  siblingCount?: number;
  currentPage: number;
  pageSize: number;
  className: string;
}

export const Pagination: FC<Props> = (props) => {
  const {
    onPageChange,
    totalCount,
    siblingCount = 1,
    currentPage,
    pageSize,
    className,
  } = props;

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  let lastPage = paginationRange[paginationRange.length - 1];

  return (
    <ul
      className={classnames(s["pagination-container"], {
        [className]: className,
      })}
    >
      {/* Left navigation arrow */}
      <li
        className={classnames(s["pagination-btn"], {
          [s.disabled]: currentPage === 1,
        })}
        onClick={onPrevious}
      >
        <div className="flex justify-center items-center">
          <p className="text-center text-sm">Previous</p>
        </div>
      </li>
      {paginationRange.map((pageNumber) => {
        // If the pageItem is a DOT, render the DOTS unicode character
        if (pageNumber === DOTS) {
          return (
            <li className={`${s["pagination-item"]} ${s.dots}`}>&#8230;</li>
          );
        }

        // Render our Page Pills
        return (
          <li
            className={classnames(s["pagination-item"], {
              [s.selected]: pageNumber === currentPage,
            })}
            onClick={() => onPageChange(Number(pageNumber))}
          >
            {pageNumber}
          </li>
        );
      })}
      {/*  Right Navigation arrow */}
      <li
        className={classnames(s["pagination-btn"], {
          [s.disabled]: currentPage === lastPage,
        })}
        onClick={onNext}
      >
        <div className="flex justify-center items-center">
          <p className="text-center text-sm">Next</p>
        </div>
      </li>
    </ul>
  );
};

