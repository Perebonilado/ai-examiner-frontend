import Button from "@/@shared/ui/Button";
import Container from "@/@shared/ui/Container";
import TextField from "@/@shared/ui/Input/TextField";
import CloseIcon from "@/icons/CloseIcon";
import UploadIcon from "@/icons/UploadIcon";
import TransitionDown from "@/transitions/TransitionDown";
import TransitionUp from "@/transitions/TransitionUp";
import Image from "next/image";
import Link from "next/link";
import React, { ElementRef, FC, useRef, useState } from "react";

const Jumbotron: FC = () => {
  const inputRef = useRef<ElementRef<"input">>(null);
  const [file, setFile] = useState<File | null>(null);
  const allowedTypes = ["docx", "doc", "pdf", "pptx"];

  return (
    <section>
      <Container>
        <div className="min-h-screen gap-4 flex max-md:flex-col max-md:min-h-[calc(100vh-200px)] max-md:pb-8">
          <div
            style={{ flex: 1 }}
            className="flex flex-col justify-center max-md:justify-normal max-md:pt-8"
          >
            <TransitionUp>
              <h1 className="text-5xl max-md:text-4xl leading-relaxed font-bold text-left max-md:pb-4">
                Turn your study materials into{" "}
                <span className="text-[#9A67E2]">practice tests</span> in
                minutes
              </h1>
              <h3 className="text-base mt-4 leading-relaxed text-left  max-md:text-xl w-full max-w-[560px]">
                Simply upload your study material and AI Examiner will generate
                the perfect challenging questions for you.
              </h3>
            </TransitionUp>

            <div className="flex items-center max-lg:hidden max-lg:flex-col max-lg:w-full gap-4 justify-center pt-20">
              <div
                style={{ flex: 1 }}
                className="relative !cursor-pointer max-lg:w-full"
              >
                <input
                  ref={inputRef}
                  type="file"
                  onChange={(e) => {
                    if (e.target.files) setFile(e.target.files[0]);
                  }}
                  className="hidden"
                  accept={allowedTypes.map((t) => `.${t}`).join(", ")}
                />

                <div className="w-full">
                  <TransitionUp>
                    <TextField
                      placeholder={file ? "" : "Upload Slides"}
                      starticon={<UploadIcon />}
                      readOnly
                      onClick={() => {
                        inputRef.current?.click();
                      }}
                    />
                  </TransitionUp>
                </div>
                {file && (
                  <div className="absolute top-1/2 -translate-y-1/2 left-14">
                    <p className="flex items-center gap-4">
                      <span className="overflow-hidden max-w-[200px] truncate">
                        <span>{file.name}</span>
                      </span>

                      <span
                        onClick={() => {
                          setFile(null);
                          if (inputRef.current && inputRef.current.value)
                            inputRef.current.value = "";
                        }}
                      >
                        <CloseIcon />
                      </span>
                    </p>
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }} className="max-lg:w-full">
                <TransitionUp>
                  <Link href={"/auth/login"}>
                    <Button
                      title="Generate Questions"
                      size="large"
                      className="max-lg:w-full"
                    />
                  </Link>
                </TransitionUp>
              </div>
            </div>
            <div className="max-lg:flex flex-col gap-3 pt-20 hidden max-md:mt-6">
              <TransitionUp>
                <Link href={"/auth/login"}>
                  <Button
                    title="Sign in"
                    variant="outlined"
                    size="large"
                    fullWidth
                  />
                </Link>
              </TransitionUp>

              <TransitionUp>
                <Link href={"/auth/signup"}>
                  {" "}
                  <Button title="Create account" size="large" fullWidth />
                </Link>
              </TransitionUp>
            </div>
          </div>
          <div
            style={{ flex: 1 }}
            className="max-md:hidden flex items-center justify-center"
          >
            <TransitionDown className="w-full h-full relative max-w-[550px]">
              <div
                className="w-full h-full relative"
                style={{
                  background:
                    "url(/home/jumbotron-bg.png) no-repeat center center / 100% auto",
                }}
              >
                <Image
                  layout="fill"
                  objectFit="contain"
                  objectPosition="100% 50%"
                  src={"/home/jumbotron-3d.png"}
                  alt="ai examiner logo"
                />
              </div>
            </TransitionDown>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Jumbotron;
