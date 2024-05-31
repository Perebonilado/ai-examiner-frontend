import React, { FC } from "react";
import SidebarItem from "../SidebarItem";
import CourseIcon from "@/icons/CourseIcon";
import ExpandableSidebarItem from "../ExpandableSidebarItem/ExpandableSidebarItem";
import Button from "@/@shared/ui/Button";
import LogoutIcon from "@/icons/LogoutIcon";
import ToggleMenuIcon from "@/icons/ToggleMenuIcon";
import { useState } from "react";
import cn from "classnames";
import { useGetAllUserDocumentsQuery } from "@/api-services/document.service";
import { useRouter } from "next/router";
import { useActiveNavLink } from "@/hooks/useActiveNavLink";
import { logout } from "@/utils";
import AppLogoAlt from "../AppLogoAlt";
import DashboardIcon from "@/icons/DashboardIcon";

const Sidebar: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    data: recentDocuments,
    isLoading,
    error,
    refetch,
  } = useGetAllUserDocumentsQuery({
    courseId: "",
    page: 1,
    pageSize: 5,
    title: "",
    id: "",
  });

  const sideBarContainerStyling = cn(
    `w-full max-w-[300px] h-full max-md:absolute max-md:bottom-0 max-md:z-30 transition-all max-md:top-0`,
    {
      "max-md:-translate-x-0": isOpen,
      "max-md:-translate-x-full": !isOpen,
    }
  );

  const [activeNavLink] = useActiveNavLink();
  const router = useRouter();

  return (
    <>
      {
        <div className="absolute z-50 left-6 bottom-3 md:hidden">
          <Button
            title=""
            starticon={<ToggleMenuIcon />}
            className="!w-[45px] h-[45px] !bg-black"
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
      }
      <aside className={sideBarContainerStyling}>
        <div className="h-full relative p-2">
          <div className="absolute bg-[#2F004F] h-[100%] w-[100%] px-4 max-md:top-0 top-0 left-1/2 -translate-x-1/2">
            <div className="h-[150px] flex pt-6 justify-center">
              <AppLogoAlt />
            </div>
            <div className="h-[calc(100%-150px)]">
              <div className="h-[calc(100%-100px)]">
                <div className="flex flex-col gap-3 border-b-[.3px] pb-12">
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
                </div>

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

              <div className="h-[100px] flex items-end justify-end py-4">
                <Button
                  title="Logout"
                  variant="outlined"
                  endicon={<LogoutIcon />}
                  onClick={() => {
                    logout(() => {
                      window.location.pathname = '/auth/login'
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
