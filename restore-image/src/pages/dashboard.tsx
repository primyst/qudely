import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import UploadBox from "@/components/UploadBox";

export default function Dashboard() {
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const getToken = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        setToken(session.access_token);
      }
    };
    getToken();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Upload & Restore</h1>
      <UploadBox token={token} />
    </div>
  );
}