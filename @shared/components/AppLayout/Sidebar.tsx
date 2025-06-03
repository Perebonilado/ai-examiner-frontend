import React, { FC } from "react";
import cn from "classnames";
import DocumentIcon from "@/icons/DocumentIcon";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/config/redux-config";
import { toggleNavigation } from "@/features/navigationSlice";
import CollapsibleButton from "./CollapsibleButton";
import NewDocumentIcon from "@/icons/NewDocumentIcon";
import CourseIcon from "@/icons/CourseIcon";
import { useActiveNavLink } from "@/hooks/useActiveNavLink";
import AllDocumentsIcon from "@/icons/AllDocumentsIcon";
import RecentDocumentItem from "./RecentDocumentItem";
import RecentDocumentContainer from "./RecentDocumentContainer";
import { useGetAllUserDocumentsQuery } from "@/api-services/document.service";
import UserLogoutBox from "./UserLogoutBox";
import ToolTip from "../ToolTip";

const Sidebar: FC = () => {
  const { navOpen: isOpen } = useSelector(
    (state: RootState) => state.navigationSliceReducer
  );

  const dispatch = useDispatch();

  const sidebarClass = cn(
    `h-[calc(100vh-50px)] bg-[#2F004F] flex flex-col gap-4 items-start pt-10 transition-all ease-in-out duration-300 px-4`,
    {
      ["w-[300px]"]: isOpen,
      ["w-[63px]"]: !isOpen,
    }
  );

  const { data: recentDocuments } = useGetAllUserDocumentsQuery({
    courseId: "",
    page: 1,
    pageSize: 5,
    title: "",
    id: "",
  });

  const [activeNavLink] = useActiveNavLink();

  return (
    <div className={sidebarClass}>
        <CollapsibleButton
          icon={
            <NewDocumentIcon
              fill={activeNavLink === "/new-document" ? "#2F004F" : "#FFFFFF"}
            />
          }
          isActive={activeNavLink === "/new-document"}
          title="New Document"
          link="/new-document"
        />
      <CollapsibleButton
        icon={
          <AllDocumentsIcon
            fill={activeNavLink === "/documents" ? "#2F004F" : "#FFFFFF"}
          />
        }
        isActive={activeNavLink === "/documents"}
        title="All Documents"
        link="/documents"
      />

      <div className="w-full h-[2px] bg-white rounded-full my-3"></div>

      <RecentDocumentContainer
        data={
          !recentDocuments
            ? []
            : recentDocuments?.documents.map((t) => ({
                link: `/questions/view-questions/${t.id}`,
                title: t.title,
              }))
        }
      />

      <UserLogoutBox />
    </div>
  );
};

export default Sidebar;
