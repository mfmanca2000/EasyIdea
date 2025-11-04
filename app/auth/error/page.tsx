import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AuthError({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">
            {error === "AccessDenied"
              ? "Your account is not authorized to access this application."
              : "An error occurred during authentication."}
          </p>
        </div>
        <div className="mt-8">
          <Link href="/auth/signin">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg">
              Try Again
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-center text-sm text-gray-500">
          If you believe this is an error, please contact the administrator.
        </p>
      </div>
    </div>
  );
}
