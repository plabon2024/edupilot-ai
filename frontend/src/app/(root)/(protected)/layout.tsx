
import { ReactNode } from "react";
// import { redirect } from "next/navigation";


export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
//   const user = await getCurrentUser();

//   if (!user) {
//     redirect("/login");
//   }

  return <>{children}</>;
}
