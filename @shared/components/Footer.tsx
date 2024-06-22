import React, { FC } from "react";
import Container from "../ui/Container";
import AppLogoAlt from "./AppLogoAlt";
import FooterLinksContainer from "./FooterLinksContainer";
import InstagramIcon from "@/icons/InstagramIcon";
import { FooterLink } from "@/models/footer.model";

const Footer: FC = () => {
  return (
    <footer className="bg-[#2F004F] py-10 text-sm">
      <Container>
        <AppLogoAlt />
        <div className="mt-6 flex gap-4 max-sm:gap-16 text-white max-md:flex-col">
          <div style={{ flex: 1 }}>
            <p>The smart practice tool to boost your exam scores.</p>
          </div>
          <div
            style={{ flex: 1 }}
            className="flex justify-end gap-16 max-sm:gap-10 max-sm:flex-col max-md:justify-start max-md:mt-8"
          >
            {/* <FooterLinksContainer {...product} /> */}
            {/* <FooterLinksContainer {...company} /> */}
            <FooterLinksContainer {...support} />
          </div>
        </div>

        <div className="mt-8 text-white">
          <p>FOLLOW US ON:</p>

          <div className="mt-4 flex gap-4">
            <a
              href="https://www.instagram.com/aiexaminerapp/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramIcon />
            </a>
          </div>
        </div>

        <p className="text-white border-t border-t-white pt-8 mt-8">
          &copy; {new Date().getFullYear()} AI Examiner. All rights reserved.
        </p>
      </Container>
    </footer>
  );
};

export default Footer;

const product: FooterLink = {
  title: "Product",
  links: [
    {
      title: "Pricing",
      link: "",
    },
    {
      title: "How it works",
      link: "",
    },
  ],
};

const company: FooterLink = {
  title: "Company",
  links: [
    {
      title: "About Us",
      link: "",
    },
    {
      title: "Community",
      link: "",
    },
    {
      title: "Privacy Policy",
      link: "",
    },
    {
      title: "Terms of Services",
      link: "",
    },
  ],
};

const support: FooterLink = {
  title: "Support",
  links: [
    {
      title: "Contact",
      link: "aiexaminerapp@gmail.com",
    },
  ],
  type: "email",
};
