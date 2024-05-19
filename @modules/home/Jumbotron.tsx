import Button from "@/@shared/ui/Button";
import Container from "@/@shared/ui/Container";
import TextField from "@/@shared/ui/Input/TextField";
import CloseIcon from "@/icons/CloseIcon";
import UploadIcon from "@/icons/UploadIcon";
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
        <div className="min-h-screen flex">
          <div style={{ flex: 1 }} className="pt-20">
            <h1 className="text-5xl leading-relaxed font-bold text-left">
              The smart practice tool to boost your exam scores.
            </h1>
            <h3 className="text-2xl mt-4 leading-relaxed text-left">
              Just upload your study materials, and our free AI tool will create
              the perfect challenging questions for you.
            </h3>

            <div className="flex items-center gap-4 justify-center pt-20">
              <div style={{ flex: 2 }} className="relative !cursor-pointer">
                <input
                  ref={inputRef}
                  type="file"
                  onChange={(e) => {
                    if (e.target.files) setFile(e.target.files[0]);
                  }}
                  className="hidden"
                  accept={allowedTypes.map((t) => `.${t}`).join(", ")}
                />
                <TextField
                  placeholder={file ? "" : "Upload Slides"}
                  starticon={<UploadIcon />}
                  readOnly
                  onClick={() => {
                    inputRef.current?.click();
                  }}
                />
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
