"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { getAuthToken } from "@/lib/auth"; // adjust path as needed

const CKEditorComponent = dynamic(() => import("@/components/CKEditorComponent"), {
  ssr: false,
});

export default function CreateBlogPage() {
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    try {
      const token = getAuthToken();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      const data = await res.json();
      alert("Post created!");
      console.log("Created blog:", data);
    } catch (e) {
      console.error("Error creating blog:", e);
      alert("Failed to create blog");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">Create Blog</h1>
      <CKEditorComponent value={content} onChange={setContent} />
      <button
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
}