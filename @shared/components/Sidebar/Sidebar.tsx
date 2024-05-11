import React, { FC } from "react";
import SidebarItem from "../SidebarItem";
import CourseIcon from "@/icons/CourseIcon";
import CourseDocumentIcon from "@/icons/CourseDocumentIcon";
import ExpandableSidebarItem from "../ExpandableSidebarItem/ExpandableSidebarItem";
import Button from "@/@shared/ui/Button";
import LogoutIcon from "@/icons/LogoutIcon";
import ToggleMenuIcon from "@/icons/ToggleMenuIcon";
import { useState } from "react";
import cn from "classnames";

const Sidebar: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const sideBarContainerStyling = cn(
    `w-full pl-4 max-w-[300px] h-full max-md:absolute max-md:z-30 transition-all max-md:top-1/2 max-md:-translate-y-1/2 pt-[2rem]`,
    {
      "max-md:-translate-x-0": isOpen,
      "max-md:-translate-x-full": !isOpen,
    }
  );

  return (
    <>
      {(
        <div className="absolute z-50 left-6 bottom-8 md:hidden">
          <Button
            title=""
            starticon={<ToggleMenuIcon />}
            className="!w-[45px] h-[45px] !bg-black"
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
      )}
      <aside className={sideBarContainerStyling}>
        <div className="h-full relative p-2">
          <div className="absolute shadow-xl h-[95%] w-[100%] px-4 max-md:top-1/2 max-md:-translate-y-1/2 top-0 left-1/2 -translate-x-1/2 rounded-xl bg-white">
            <div className="h-[80px] flex items-center">
              <p className="text-center font-bold text-lg ">AI Examiner</p>
            </div>
            <div className="h-[calc(100%-80px)]">
              <div className="h-[calc(100%-100px)]">
                <div className="flex flex-col gap-3 border-b border-b-gray-400 pb-10">
                  <SidebarItem
                    icon={<CourseIcon />}
                    isActive={true}
                    title="All Courses"
                    link="/"
                  />
                  <SidebarItem
                    icon={<CourseDocumentIcon />}
                    isActive={false}
                    title="All Topics"
                    link="/topics"
                  />
                </div>

                <div className="pt-10">
                  <ExpandableSidebarItem title="Recent Topics" />
                </div>
              </div>

              <div className="h-[100px] flex items-end justify-end py-4">
                <Button
                  title="Logout"
                  variant="outlined"
                  endicon={<LogoutIcon />}
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
