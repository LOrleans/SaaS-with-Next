"use client";

import Button from "@/app/components/ui/button";
import TextInput from "@/app/components/ui/text-input";
import { sanitizeLink } from "@/app/lib/utils";
import { ChangeEvent, FormEvent, useState } from "react";

export default function CreateLinkForm() {
  const [erro, setError] = useState("");
  const [link, setLink] = useState("");

  function handleLinkChange(e: ChangeEvent<HTMLInputElement>) {
    setLink(sanitizeLink(e.target.value));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>){
    e.preventDefault()

    if(link.length === 0){
      return setError("Escolha um link!")
    }
  }
  
  return (
    <>
      <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
        <span>projectinbio.com/</span>
        <TextInput value={link} onChange={(e) => handleLinkChange} />
        <Button className="w-31.5">Criar</Button>
      </form>
      <div>
        <span className="text-accent-pink">{erro}</span>
      </div>
    </>
  );
}
