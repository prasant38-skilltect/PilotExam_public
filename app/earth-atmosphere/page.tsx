// app/test/short-term-memory/page.tsx
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/test/index.html"); // the file in public/test/index.html
}
