import React, { FC } from "react";
import NewMessageContainer from "./NewMessageContainer";
import UserMessage from "./UserMessage";
import SystemMessage from "./SystemMessage";

const ChatContainer: FC = () => {
  return (
    <>
      <section className="bg-[#FAFAFA] h-[calc(100vh-230px)] pt-10 px-14 max-md:px-6 pb-8 overflow-y-auto w-full rounded-xl">
        <div className="flex flex-col h-auto min-h-[calc(100vh-305px)] justify-end gap-12">
          <UserMessage message="hey there testing this feature" />
          <SystemMessage
            message={`
                `}
          />
        </div>
      </section>
      <NewMessageContainer />
    </>
  );
};

export default ChatContainer;
