"use client";

import { Button } from "@mantine/core";
import { useRouter } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";

export function BackButton() {
  const router = useRouter();

  return (
    <Button onClick={router.back} leftSection={<LuArrowLeft size={"1rem"} />}>
      Back
    </Button>
  );
}
