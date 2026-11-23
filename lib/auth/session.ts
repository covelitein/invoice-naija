import { auth } from "@/lib/auth/server";

export async function requireSession() {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return null;
  }
  return {
    session,
    user: session.user,
    workspace: { id: session.user.id },
  };
}
