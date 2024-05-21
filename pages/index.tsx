import Jumbotron from "@/@modules/home/Jumbotron";
import AppHead from "@/@shared/components/AppHead";
import Navbar from "@/@shared/components/Navbar";

export default function Home() {
  return (
    <>
      <AppHead />
      <Navbar />
      <Jumbotron />
    </>
  );
}
