import React, { FC } from "react";
import SidebarItem from "../SidebarItem";
import CourseIcon from "@/icons/CourseIcon";
import CourseDocumentIcon from "@/icons/CourseDocumentIcon";
import ExpandableSidebarItem from "../ExpandableSidebarItem/ExpandableSidebarItem";
import Button from "@/@shared/ui/Button";
import LogoutIcon from "@/icons/LogoutIcon";

const Sidebar: FC = () => {
  return (
    <aside className="relative  w-full max-w-[300px] h-full p-2 max-md:hidden flex flex-col">
      <div className="absolute h-[95%] w-[90%] px-4 shadow-sm top-0 left-1/2 -translate-x-1/2 rounded-xl bg-white">
        <div className="h-[80px] flex items-center">
          <p className="text-center font-bold text-lg ">AI Examiner</p>
        </div>
        <div className="h-[calc(100%-80px)]">
          <div className="h-[calc(100%-100px)]">
            <div className="flex flex-col gap-3 border-b border-b-gray-400 pb-10">
              <SidebarItem
                icon={<CourseIcon />}
                isActive={false}
                title="All Courses"
                link=""
              />
              <SidebarItem
                icon={<CourseDocumentIcon />}
                isActive={true}
                title="All Lecture Documents"
                link=""
              />
            </div>

            <div className="pt-10">
              <ExpandableSidebarItem title="Recent Lecture Documents" />
            </div>
          </div>

          <div className="h-[100px] flex items-end py-4">
            <Button
              title="Logout"
              variant="outlined"
              endicon={<LogoutIcon />}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
