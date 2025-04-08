"use client";

import { useSession, signOut } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();

  if (!session) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <button
        onClick={() => signOut({ callbackUrl: process.env.NEXTAUTH_URL })}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Logout
      </button>
      <h1>Welcome, {session.user?.fullName}</h1>
    </div>
  );
}
