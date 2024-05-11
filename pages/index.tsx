import GenerateMCQFormContainer from "@/@modules/home/GenerateMCQFormContainer";
import MCQContainer from "@/@modules/home/MCQContainer";
import AppHead from "@/@shared/components/AppHead";
import { AppLoader } from "@/@shared/components/AppLoader";
import { useGenerateMCQsMutation } from "@/api-services/questions.service";
import { mockQuestions } from "@/constants";
import AppLayout from "@/layouts/AppLayout";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Home() {
  const [isFormView, setIsFormView] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [
    generateQuestions,
    { data: questions, isLoading, isSuccess, isError },
  ] = useGenerateMCQsMutation();

  const handleFile = (file: File | null) => {
    setFile(file);
  };

  const handleSubmitQuestionGenerationForm = (
    values: Record<string, string>
  ) => {
    const formData = new FormData();
    for (const key in values) {
      formData.append(key, values[key]);
    }

    if (file) {
      formData.append("document", file);
    }

    generateQuestions(formData);
  };

  useEffect(() => {
    if (isError) {
      toast.error("Something went wrong, let's try that again");
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccess) {
      setFile(null);
      setIsFormView(false);
    }
  }, [isSuccess]);

  return (
    <AppLayout>
      {isLoading && (
        <AppLoader loaderMessage="Just a moment, we are generating your questions ..." />
      )}
      <AppHead />
      <div>
        <h1 className="text-center py-8 pt-0 text-2xl font-bold text-blue-600">AI Examiner</h1>
        {isFormView ? (
          <GenerateMCQFormContainer
            file={file}
            handleFile={handleFile}
            allowedTypes={["doc", "docx", "pdf", "ppt", "pptx", "txt"]}
            maxFileSizeMB={10}
            handleFormValues={(values: Record<string, string>) => {
              handleSubmitQuestionGenerationForm(values);
            }}
          />
        ) : (
          questions && (
            <MCQContainer
              data={questions}
              handeGenerateNewQuestions={() => setIsFormView(true)}
            />
          )
        )}

        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vitae sed rem alias porro doloribus illum ad magni veritatis dolor, expedita aspernatur, quasi ipsa nam sint? Tempore cupiditate laborum accusamus totam possimus qui vitae dolor voluptas doloremque hic ab, aliquid itaque, unde autem commodi, quam quia eius consequuntur facilis. Vero voluptatum itaque provident quo sapiente odit quos sunt tempore tempora consectetur! Odit, officiis facilis, qui eaque illo labore quo iusto quaerat sunt praesentium similique enim tempora libero minima, perspiciatis corrupti nostrum sapiente et? Expedita numquam eveniet omnis dicta dolorem voluptatem similique nobis, impedit non eaque? Autem, consequatur? Iure adipisci dicta cumque blanditiis, impedit nam provident atque. Fugiat odio expedita velit obcaecati magni at a pariatur unde fuga esse quam culpa deleniti rem iusto repudiandae, nulla consequuntur animi rerum similique reiciendis debitis nobis odit! Error laborum eligendi reiciendis fuga nemo similique quasi, dolore suscipit quo aspernatur, voluptatem nostrum sit facilis delectus necessitatibus recusandae rerum culpa illo sunt non repellat nulla? Sunt blanditiis similique facere voluptatum delectus unde iste quod numquam saepe dignissimos commodi, laudantium laboriosam distinctio ad dolor aperiam deserunt, doloribus mollitia explicabo ut impedit ipsam corrupti voluptatibus ullam? Quo id sapiente repellat explicabo minima nobis quam optio. Possimus, magnam. Explicabo animi magni dolorum nihil suscipit nam officia eligendi, perspiciatis maiores, dignissimos reiciendis, assumenda voluptates hic quisquam nulla modi illum ea odio aliquid quos incidunt non impedit? Earum quaerat dolorum ratione fugiat assumenda praesentium, pariatur est debitis eius maiores, eum maxime alias autem, non doloremque ex eos voluptatibus molestiae? Repudiandae nisi, expedita eveniet incidunt quibusdam sit quod consequatur blanditiis alias facilis. Velit vitae ut rerum quisquam qui nihil nemo in ex? Itaque dolor ullam culpa enim expedita architecto reprehenderit aut maxime accusamus nam consequatur natus suscipit, cumque minus. Omnis, at ad ea velit ullam nobis veritatis voluptatem repellendus, doloremque facere quaerat, hic qui enim alias corporis est eligendi non? Tempora fuga ipsum veniam eligendi nesciunt modi adipisci ipsam neque? Culpa, aut unde. Itaque porro nihil dolorem aliquid hic. Commodi culpa vitae, soluta ex doloribus blanditiis similique. Itaque eveniet ea corrupti, dolor architecto consectetur sapiente, perspiciatis harum consequuntur asperiores alias doloremque nobis quos cum odio fugit voluptatum accusantium in, molestias accusamus ducimus nemo eaque neque voluptas! Eum accusamus fugit exercitationem cum temporibus ipsa. Itaque maiores cumque officiis libero commodi? Ipsam eos eveniet voluptas explicabo aut corrupti, ipsa accusantium corporis totam! Ratione fugit molestias tempora reiciendis excepturi, dignissimos velit sed maxime dolor ipsa hic eos necessitatibus ducimus. Deserunt natus eos, quae accusantium, dolor optio dolorem hic aut ipsa in minima illo est asperiores iure harum commodi itaque quisquam? Explicabo quia tempore vero odio impedit nam provident ea et. Iste obcaecati, itaque cum officia enim labore ab? Animi suscipit ab repellendus recusandae eum nobis blanditiis nesciunt velit earum inventore, distinctio nisi quasi magni dignissimos impedit quidem assumenda repudiandae! Ipsam autem quaerat in, omnis magni incidunt aut voluptatibus tempore. Voluptatem cumque at veniam, ab recusandae quidem dolorem omnis magnam consequatur harum minima earum aspernatur error officia, vero facere neque blanditiis quam, exercitationem labore ducimus obcaecati repellendus.
      </div>
    </AppLayout>
  );
}
