// components/Tab.tsx
import React, { FC, useRef, useEffect, useState } from "react";
import TabItem from "./TabItem";

interface Props {
  tabs: string[];
  activeTab: string;
  handleClickTab: (title: string) => void;
}

const Tab: FC<Props> = ({ tabs, activeTab, handleClickTab }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
  });

  const updateIndicatorPosition = () => {
    if (containerRef.current) {
      const tabElement = containerRef.current.querySelector(`[data-title="${activeTab}"]`);
      if (tabElement) {
        const containerLeft = containerRef.current.getBoundingClientRect().left;
        const tabRect = tabElement.getBoundingClientRect();

        setIndicatorStyle({
          left: tabRect.left - containerLeft,
          width: tabRect.width,
        });
      }
    }
  };

  useEffect(() => {
    updateIndicatorPosition();
    window.addEventListener('resize', updateIndicatorPosition);
    return () => {
      window.removeEventListener('resize', updateIndicatorPosition);
    };
  }, [activeTab]);

  return (
    <div className="relative">
      <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div
        className="flex overflow-x-auto no-scrollbar border-b border-b-gray-400 mb-4 relative"
        ref={containerRef}
      >
        {tabs.map((tabTitle, idx) => (
          <TabItem
            key={idx}
            isActive={activeTab === tabTitle}
            title={tabTitle}
            handleClick={handleClickTab}
          />
        ))}

        {/* Indicator without animation */}
        <div 
          className="absolute bottom-0 h-[3px] bg-[#360B58]"
          style={{ 
            left: `${indicatorStyle.left}px`, 
            width: `${indicatorStyle.width}px` 
          }}
        />
      </div>
    </div>
  );
};

export default Tab;
