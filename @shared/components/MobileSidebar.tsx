import React, { FC, useEffect } from "react";
import cn from "classnames";
import { useActiveNavLink } from "@/hooks/useActiveNavLink";
import { useGetAllUserDocumentsQuery } from "@/api-services/document.service";
import SidebarItem from "./SidebarItem";
import DashboardIcon from "@/icons/DashboardIcon";
import CourseIcon from "@/icons/CourseIcon";
import ExpandableSidebarItem from "./ExpandableSidebarItem/ExpandableSidebarItem";
import Button from "../ui/Button";
import LogoutIcon from "@/icons/LogoutIcon";
import { logout } from "@/utils";

interface Props {
  isSideNav: boolean;
  handleCloseSidebar: () => void;
}

const MobileSidebar: FC<Props> = ({ isSideNav, handleCloseSidebar }) => {
  const sideNavClasses = cn(
    `absolute transition-all duration-[.3s] z-50 w-[95vw] h-[calc(100vh-100px)] top-[90px] bg-[#2F004F] left-[2.5vw] flex flex-col md:hidden`,
    {
      "translate-x-[calc(100%+2.5vw)]": !isSideNav,
    }
  );

  const [activeNavLink] = useActiveNavLink();

  const {
    data: recentDocuments,
  } = useGetAllUserDocumentsQuery({
    courseId: "",
    page: 1,
    pageSize: 5,
    title: "",
    id: "",
  });

  useEffect(() => {
    window.addEventListener("resize", handleSidebarOnWindowResize);

    return () => {
      window.removeEventListener("resize", handleSidebarOnWindowResize);
    };
  }, []);

  const handleSidebarOnWindowResize = () => {
    handleCloseSidebar();
  };

  return (
    <div className={sideNavClasses}>
      <div style={{ flex: 8 }} className="flex flex-col gap-6 pt-10 px-4">
        <SidebarItem
          icon={<DashboardIcon />}
          isActive={activeNavLink === "/dashboard"}
          title="Dashboard"
          link="/dashboard"
        />
        <SidebarItem
          icon={<CourseIcon />}
          isActive={activeNavLink === "/documents"}
          title="All Documents"
          link="/documents"
        />

        <div className="pt-10">
          <ExpandableSidebarItem
            title="Recent Documents"
            data={recentDocuments?.documents.map((t) => ({
              link: `/questions/view-questions/${t.id}`,
              title: t.title,
            }))}
          />
        </div>
      </div>
      <div style={{ flex: 1 }} className="flex items-center px-4 ">
        <Button
          title="Logout"
          variant="text"
          endicon={<LogoutIcon />}
          className="!text-white"
          onClick={() => {
            logout(() => {
              window.location.pathname = "/auth/login";
            });
          }}
        />
      </div>
    </div>
  );
};

export default MobileSidebar;
