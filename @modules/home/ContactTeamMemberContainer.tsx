import Container from "@/@shared/ui/Container";
import React, { FC } from "react";
import ContactTeamMemberCard from "./ContactTeamMemberCard";

const ContactTeamMemberContainer: FC = () => {
  return (
    <Container>
      <section className="py-20">
        <div className="text-center flex flex-col items-center justify-center gap-3">
          <h3 className="text-5xl font-bold text-[#2F004F]">
            We're here for you
          </h3>
          <p>
            Have a concern? Let us know and we'll follow up with you right away!
          </p>
        </div>

        <div className="mt-20 flex items-center justify-center flex-wrap gap-10">
          <ContactTeamMemberCard
            name="Richard Eradiri"
            actionType="text"
            actionText="TEXT RICHARD"
            messageLink="https://wa.link/403uky"
            body="If you have a problem but don’t like calls, text Richard."
            image="/home/richard-eradiri.jpeg"
            title="C.E.O."

          />
          <ContactTeamMemberCard
            name="Nengi Sagbe"
            actionType="call"
            actionText="CALL NENGI"
            phone="+2348106879478"
            body="If you have a problem and love calls, call Nengi."
            image="/home/nengi-sagbe.png"
            title="Head of Growth"
          />
          <ContactTeamMemberCard
            name="Duke Miller"
            actionType="text"
            actionText="TEXT RICHARD"
            messageLink="https://wa.link/403uky"
            body="Duke doesn’t like calls or text, but if you text Richard, he’d give you Duke’s number to call or text him."
            image="/home/duke-miller.png"
            title="C.O.O."
          />
        </div>
      </section>
    </Container>
  );
};

export default ContactTeamMemberContainer;
