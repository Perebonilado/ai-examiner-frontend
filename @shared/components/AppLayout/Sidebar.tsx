import React, { FC, useEffect, useState } from "react";
import cn from "classnames";
import { useSelector } from "react-redux";
import { RootState } from "@/config/redux-config";
import CollapsibleButton from "./CollapsibleButton";
import NewDocumentIcon from "@/icons/NewDocumentIcon";
import { useActiveNavLink } from "@/hooks/useActiveNavLink";
import AllDocumentsIcon from "@/icons/AllDocumentsIcon";
import RecentDocumentContainer from "./RecentDocumentContainer";
import { useGetAllUserDocumentsQuery } from "@/api-services/document.service";
import UserLogoutBox from "./UserLogoutBox";
import { accessToken, typeBasedRoutes } from "@/constants";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

const Sidebar: FC = () => {
  const { navOpen: isOpen } = useSelector(
    (state: RootState) => state.navigationSliceReducer
  );

  const sidebarClass = cn(
    `h-[calc(100vh-50px)] bg-[#2F004F] flex flex-col gap-4 items-start pt-4 transition-all ease-in-out duration-300 px-4`,
    {
      ["w-[212px]"]: isOpen,
      ["w-[63px]"]: !isOpen,
    }
  );

  const [isWebRoute, setIsWebRoute] = useState(true);

  const router = useRouter();

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

      <div className="w-full h-[1px] bg-white rounded-full my-3"></div>

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
