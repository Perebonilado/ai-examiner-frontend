import React, { FC, useEffect, useState } from "react";
import TabItem from "./TabItem";
import { useRouter } from "next/router";

interface Props {
  tabs: string[];
  activeTab: string;
  handleClickTab: (title: string)=>void
}

const Tab: FC<Props> = ({ tabs, activeTab, handleClickTab }) => {
  return (
    <div className="flex border-b border-b-gray-400 mb-4">
      {tabs.map((tabTitle, idx) => {
        return (
          <TabItem
            isActive={activeTab === tabTitle}
            title={tabTitle}
            key={idx}
            handleClick={(tabTitle) => {
              handleClickTab(tabTitle)
            }}
          />
        );
      })}
    </div>
  );
};

export default Tab;
