export interface FooterLink {
  title: string;
  links: { title: string; link: string }[];
  type?: "link" | "email";
}
