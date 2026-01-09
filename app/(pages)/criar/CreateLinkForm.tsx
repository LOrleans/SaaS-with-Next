"use client";

import { createLink } from "@/app/actions/create-link";
import { verifyLink } from "@/app/actions/verify-link";
import Button from "@/app/components/ui/button";
import TextInput from "@/app/components/ui/text-input";
import { sanitizeLink } from "@/app/lib/utils";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";

export default function CreateLinkForm() {
  const router = useRouter()

  const [error, setError] = useState("");
  const [link, setLink] = useState("");

  function handleLinkChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLink(sanitizeLink(e.target.value));
    setError("")
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault()

    // Usuário não digita o link
    if(link.length === 0){
      return setError("Escolha um link!")
    }

    // Usuário digita um link já existente
    const isLinkTaken = await verifyLink(link)
    if(isLinkTaken) return setError("Desculpe, este link já está em uso.")

    // Criar o perfil 
    await createLink(link)
    router.push(`/${link}`)
  }
  
  return (
    <>
      <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
        <span>projectinbio.com/</span>
        <TextInput value={link} onChange={handleLinkChange} />
        <Button className="w-31.5">Criar</Button>
      </form>
      <div>
        <span className="text-accent-pink">{error}</span>
      </div>
    </>
  );
}
