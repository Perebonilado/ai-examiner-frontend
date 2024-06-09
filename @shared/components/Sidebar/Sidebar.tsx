import React, { FC } from "react";
import SidebarItem from "../SidebarItem";
import CourseIcon from "@/icons/CourseIcon";
import ExpandableSidebarItem from "../ExpandableSidebarItem/ExpandableSidebarItem";
import Button from "@/@shared/ui/Button";
import LogoutIcon from "@/icons/LogoutIcon";
import cn from "classnames";
import { useGetAllUserDocumentsQuery } from "@/api-services/document.service";
import { useRouter } from "next/router";
import { useActiveNavLink } from "@/hooks/useActiveNavLink";
import { logout } from "@/utils";
import AppLogoAlt from "../AppLogoAlt";
import NewDocumentIcon from '@/icons/NewDocumentIcon'


const Sidebar: FC = () => {
  const { data: recentDocuments } = useGetAllUserDocumentsQuery({
    courseId: "",
    page: 1,
    pageSize: 5,
    title: "",
    id: "",
  });

  const sideBarContainerStyling = cn(
    `max-md:hidden w-full max-w-[300px] h-full max-md:absolute max-md:bottom-0 max-md:z-30 transition-all max-md:top-0`
  );

  const [activeNavLink] = useActiveNavLink();

  return (
    <>
      <aside className={sideBarContainerStyling}>
        <div className="h-full relative p-2">
          <div className="absolute bg-[#2F004F] max-md:fixed h-[100%] w-[100%] px-4 max-md:top-0 top-0 left-1/2 -translate-x-1/2">
            <div className="h-[150px] flex pt-6 justify-center">
              <AppLogoAlt />
            </div>
            <div className="h-[calc(100%-150px)]">
              <div className="h-[calc(100%-100px)]">
                <div className="flex flex-col gap-3 border-b-[.3px] pb-12">
                  <SidebarItem
                    icon={<NewDocumentIcon />}
                    isActive={activeNavLink === "/new-document"}
                    title="New Document"
                    link="/new-document"
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

              <div className="h-[100px] flex items-end py-4">
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
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
