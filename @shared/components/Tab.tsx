import React, { FC, useEffect, useState } from "react";
import TabItem from "./TabItem";

interface Props {
  tabs: string[];
  defaultActiveTab?: string;
  getActiveTab: (tab: string) => void;
}

const Tab: FC<Props> = ({ tabs, defaultActiveTab, getActiveTab }) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]);
  const [actualTabs, setActualTabs] = useState<
    {
      title: string;
      isActive: boolean;
    }[]
  >([]);

  const initializeActualTabs = () => {
    getActiveTab(activeTab)
    const isActiveTabPresent = activeTab && tabs.includes(activeTab);

    const tabItems = tabs.map((title, idx) => {
      const isActive = isActiveTabPresent ? title === activeTab : idx === 0;
      return { title, isActive };
    });

    setActualTabs(tabItems);
  };

  useEffect(() => {
    initializeActualTabs();
  }, [activeTab]);

  return (
    <div className="flex border-b border-b-gray-400 mb-8">
      {actualTabs.map((tab, idx) => {
        return (
          <TabItem
            {...tab}
            key={idx}
            handleClick={(tabTitle) => {
              setActiveTab(tabTitle);
            }}
          />
        );
      })}
    </div>
  );
};

export default Tab;
