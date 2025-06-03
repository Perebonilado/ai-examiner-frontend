import React, { FC, useEffect, useState } from "react";
import cn from "classnames";
import { useActiveNavLink } from "@/hooks/useActiveNavLink";
import { useGetAllUserDocumentsQuery } from "@/api-services/document.service";
import SidebarItem from "./SidebarItem";
import CourseIcon from "@/icons/CourseIcon";
import ExpandableSidebarItem from "./ExpandableSidebarItem/ExpandableSidebarItem";
import Button from "../ui/Button";
import LogoutIcon from "@/icons/LogoutIcon";
import { logout } from "@/utils";
import NewDocumentIcon from "@/icons/NewDocumentIcon";
import { useRouter } from "next/router";
import { accessToken, navLinks, typeBasedRoutes } from "@/constants";
import Cookies from "js-cookie";
import NavLink from "./NavLink";
import CollapsibleButton from "./AppLayout/CollapsibleButton";
import AllDocumentsIcon from "@/icons/AllDocumentsIcon";
import RecentDocumentContainer from "./AppLayout/RecentDocumentContainer";
import LogoutIconAlt from "@/icons/LogoutIconAlt";

interface Props {
  isSideNav: boolean;
  handleCloseSidebar: () => void;
}

const MobileSidebar: FC<Props> = ({ isSideNav, handleCloseSidebar }) => {
  const [isWebRoute, setIsWebRoute] = useState(true);

  const router = useRouter();

  const sideNavClasses = cn(
    `fixed transition-all duration-[.3s] z-50 w-[95vw] h-[calc(100vh-100px)] top-[90px] bg-[#2F004F] left-[2.5vw] flex flex-col md:hidden`,
    {
      "-translate-x-[calc(100%+2.5vw)]": !isSideNav,
    }
  );

  const [activeNavLink] = useActiveNavLink();

  const { data: recentDocuments } = useGetAllUserDocumentsQuery(
    {
      courseId: "",
      page: 1,
      pageSize: 5,
      title: "",
      id: "",
    },
    { skip: isWebRoute }
  );

  useEffect(() => {
    window.addEventListener("resize", handleSidebarOnWindowResize);

    return () => {
      window.removeEventListener("resize", handleSidebarOnWindowResize);
    };
  }, []);

  useEffect(() => {
    checkRouteType();
  }, [router.pathname]);

  const checkRouteType = () => {
    const userIsLoggedIn = Cookies.get(accessToken);
    const activeRoute = typeBasedRoutes.find(
      (r) => r.route === router.pathname
    );

    if (activeRoute) {
      if (activeRoute.type === "web") {
        setIsWebRoute(true);
      } else {
        if (userIsLoggedIn) {
          setIsWebRoute(false);
        } else {
          setIsWebRoute(true);
        }
      }
    } else {
      setIsWebRoute(false);
    }
  };

  const handleSidebarOnWindowResize = () => {
    handleCloseSidebar();
  };

  return (
    <div className={sideNavClasses}>
      <div style={{ flex: 3 }} className="flex flex-col gap-6 pt-10 px-4">
        {isWebRoute &&
          navLinks.map((item, idx) => {
            return <NavLink {...item} color="white" key={idx} />;
          })}

        {!isWebRoute && (
          <>
            <CollapsibleButton
              showTextByDefault={true}
              icon={
                <NewDocumentIcon
                  fill={
                    activeNavLink === "/new-document" ? "#2F004F" : "#FFFFFF"
                  }
                />
              }
              isActive={activeNavLink === "/new-document"}
              title="New Document"
              link="/new-document"
            />
            <CollapsibleButton
              showTextByDefault={true}
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
          </>
        )}
      </div>
      {!isWebRoute && (
        <div style={{ flex: 1 }} className="flex items-center px-4 ">
          <Button
            title="Logout"
            variant="text"
            endicon={<LogoutIconAlt />}
            className="!text-white"
            onClick={() => {
              logout(() => {
                window.location.pathname = "/auth/login";
              });
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MobileSidebar;
