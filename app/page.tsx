
import { auth } from "@/auth";
import { db } from "@/db/index";
import { users } from "@/db/schema";
import Link from "next/link";

export default async function Home() {
  const res = await db.select().from(users);
  const authUser = await auth()
  console.log(authUser?.user?.id)
  return (
    <div>
      {res.map((user) => (
        <div className="flex flex-col items-center justify-items-center space-y-2 " key={user.id}>
          <span>{user.fullName}</span>
          <span>{user.password}</span>
          <span> -- {user.id}</span>
          <span>{user.role}</span>
          <span>{user.email}</span>
          <span>{user.createdAt.toString()}</span>
        </div>
      ))}
      <div className="flex flex-col items-center justify-items-center space-y-2 ">
        <Link href='/upload'>SignIn</Link>
        <Link href='/upload'>SignUp</Link>
      </div>
      <span>Sa auth ni nga user id below</span>
      <br/>
      {authUser?.user?.id}
    </div>
  );
}