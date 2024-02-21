import { getServerAuthSession } from "@/server/auth";
import { SignIn } from "@/app/_components/signin";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  if (!session) {
    return <SignIn />;
  }
  return <>{children}</>;
}
