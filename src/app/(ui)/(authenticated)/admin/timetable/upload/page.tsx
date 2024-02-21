// "use client";

// import { getServerAuthSession } from "@/server/auth";
import { TimetableUploadForm } from "./mantine-form";

export default async function Page() {
  // const hello = await api.post.hello.query({ text: "from tRPC" });
  // const session = await getServerAuthSession();

  return (
    <>
      <TimetableUploadForm />
    </>
  );
}
