import { db } from "@/db/index";
import { users } from "@/db/schema";
import Link from "next/link";

export default async function Home() {
  const res = await db.select().from(users);
  return (
    <div>
      {res.map((user) => (
        <div className="flex flex-col items-center justify-items-center space-y-2 " key={user.id}>
          <span>{user.fullName}</span>
          <span>{user.password}</span>
          <span>{user.id}</span>
          <span>{user.role}</span>
          <span>{user.email}</span>
          <span>{user.createdAt.toString()}</span>
        </div>
      ))}
      <div className="flex flex-col items-center justify-items-center space-y-2 ">
        <Link href='/upload'>SignIn</Link>
        <Link href='/upload'>SignUp</Link>
      </div>
      
    </div>
  );
}