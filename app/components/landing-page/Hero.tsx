import TextInput from "../ui/text-input";
import Button from "../ui/button";
import TotalVisits from "../commons/TotalVisits";
import ProjectCard from "../commons/ProjectCard";
import UserCard from "../commons/user-card/UserCard";
import CreateNow from "../ui/create-now";

export default function Hero() {
  const mockProject1 = {
    projectName: "Projeto 1",
    projectDescription: "Descrição do projeto 1",
    projectUrl: "https://google.com",
    totalVisits: 120,
  } as any;

  const mockProject2 = {
    projectName: "Projeto 2",
    projectDescription: "Descrição do projeto 2",
    projectUrl: "https://google.com",
    totalVisits: 85,
  } as any;

  return (
    <div className="flex h-screen">
      <div className="w-full flex flex-col gap-2 mt-[35vh]">
        <h1 className="text-5xl font-bold text-white leading-16">
          Seus projetos e redes <br /> sociais em um único link
        </h1>
        <h2 className="text-xl leading-6">
          Crie sua própria página de projetos e compartilhe eles com o mundo.
          <br /> Acompanhe o engajamento com Analytics de cliques
        </h2>
        <CreateNow />
      </div>

      <div className="w-full flex items-center justify-center bg-[radial-gradient(circle_at_50%_50%,#4B2DBB,transparent_55%)]">
        <div className="relative">
          {/* UserCard precisa da prop isOwner */}
          <UserCard isOwner={false} />

          <div className="absolute -bottom-[7%] -right-[45%]">
             <TotalVisits />
          </div>

          <div className="absolute top-[20%] -left-[45%] -z-10">
            <ProjectCard
              project={mockProject1}
              isOwner={false}
              img="project1.jpg"
            />
          </div>

          <div className="absolute -top-[5%] -left-[55%] -z-10">
            <ProjectCard
              project={mockProject2}
              isOwner={false}
              img="project2.jpg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
