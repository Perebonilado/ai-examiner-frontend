import Button from "@/@shared/ui/Button";
import Container from "@/@shared/ui/Container";
import TextField from "@/@shared/ui/Input/TextField";
import UploadIcon from "@/icons/UploadIcon";
import Image from "next/image";
import Link from "next/link";
import React, { FC } from "react";

const Jumbotron: FC = () => {
  return (
    <section>
      <Container>
        <div className="min-h-screen flex">
          <div style={{ flex: 1 }} className="pt-20">
            <h1 className="text-5xl leading-relaxed font-bold text-center">
              The smart practice tool to boost your exam scores.
            </h1>
            <h3 className="text-2xl mt-4 leading-relaxed text-center">
              Lorem ipsum dolor sit amet consectetur.
            </h3>

            <div className="flex items-center gap-4 justify-center pt-20">
              <div style={{ flex: 2 }}>
                <TextField
                  placeholder="Upload Slides"
                  starticon={<UploadIcon />}
                  readOnly
                />
              </div>
              <div style={{ flex: 1 }}>
                <Link href={"/auth/login"}>
                  <Button title="Generate Questions" size="large" fullWidth />
                </Link>
              </div>
            </div>
          </div>
          <div style={{ flex: 1 }} className="">
            <div className="w-full h-full relative">
              <Image
                layout="fill"
                objectFit="contain"
                objectPosition="100% 0%"
                src={"/home/jumbotron-3d.png"}
                alt="ai examiner logo"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Jumbotron;
