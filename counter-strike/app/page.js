"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/view');
  }, []);

  return (
    <div>
      <span>REDIRECTING....</span>
    </div>
  );
};

export default Page;