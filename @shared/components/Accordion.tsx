import React, { FC, useState } from "react";
import AccordionItem from "./AccordionItem";

interface Props {
  data: {
    id: number;
    body: string;
    title: string;
  }[];
}

const Accordion: FC<Props> = ({ data }) => {
  const [items, setItems] = useState([
    ...data.map((d) => ({ ...d, isOpen: false })),
  ]);

  const handleToggle = (id: number) => {
    const mappedItems = items.map((it) => {
      if (id === it.id) {
        return { ...it, isOpen: !it.isOpen };
      }
      return { ...it };
    });

    setItems(mappedItems)
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-[700px] mx-auto">
      {items.map((props, key) => {
        return (
          <AccordionItem {...props} handleClick={handleToggle} key={key} />
        );
      })}
    </div>
  );
};

export default Accordion;
