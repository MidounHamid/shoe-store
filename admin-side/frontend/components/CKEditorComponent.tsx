"use client";

import React, { useEffect, useRef, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@/lib/ckeditor";
import { getAuthToken } from "@/lib/auth";

interface Props {
  value: string;
  onChange: (data: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onReady?: (editor: any) => void;
  onError?: (error: any, details: any) => void;
}

class MyUploadAdapter {
  loader: any;

  constructor(loader: any) {
    this.loader = loader;
  }

  async upload() {
    const token = getAuthToken();

    return this.loader.file.then(
      (file: File) =>
        new Promise((resolve, reject) => {
          const data = new FormData();
          data.append("upload", file);

          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/upload-image`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            body: data,
          })
            .then(async (res) => {
              if (!res.ok) {
                const errorText = await res.text();
                reject(new Error(`Upload failed: ${errorText}`));
              } else {
                return res.json();
              }
            })
            .then((res) => {
              resolve({ default: res.url });
            })
            .catch((err) => reject(err));
        })
    );
  }

  abort() {
    // Optional: implement abort logic if needed
  }
}

const CKEditorComponent = ({
  value,
  onChange,
  placeholder = "Start typing...",
  disabled = false,
  onReady,
  onError,
}: Props) => {
  const editorRef = useRef<any>(null);
  const wordCountRef = useRef<HTMLDivElement>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy().catch((error: any) => {
          console.log("Error during editor cleanup:", error);
        });
      }
    };
  }, []);

  const handleReady = (editor: any) => {
    editorRef.current = editor;
    setIsEditorReady(true);

    // Set up file upload adapter
    try {
      editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) => {
        return new MyUploadAdapter(loader);
      };
    } catch (error) {
      console.warn("FileRepository plugin not available:", error);
    }

    // Set up word count
    try {
      const wordCountPlugin = editor.plugins.get("WordCount");
      if (wordCountRef.current && wordCountPlugin) {
        wordCountRef.current.appendChild(wordCountPlugin.wordCountContainer);
      }
    } catch (error) {
      console.warn("WordCount plugin not available:", error);
    }

    if (onReady) {
      onReady(editor);
    }
  };

  const handleChange = (_: any, editor: any) => {
    if (isEditorReady) {
      const data = editor.getData();
      onChange(data);
    }
  };

  const handleError = (error: any, { willEditorRestart }: { willEditorRestart: boolean }) => {
    console.error("CKEditor mounting error:", error);

    if (willEditorRestart) {
      setIsEditorReady(false);
      if (editorRef.current?.ui?.view?.toolbar?.element) {
        editorRef.current.ui.view.toolbar.element.remove();
      }
    }

    if (onError) {
      onError(error, { willEditorRestart });
    }
  };

  const editorConfig = {
    licenseKey: "GPL",
    placeholder,
    toolbar: {
      items: [
        "heading",
        "|",
        "bold",
        "italic",
        "underline",
        "|",
        "link",
        "bulletedList",
        "numberedList",
        "|",
        "outdent",
        "indent",
        "|",
        "imageInsert",
        "blockQuote",
        "insertTable",
        "|",
        "undo",
        "redo",
      ],
      shouldNotGroupWhenFull: true,
    },
    removePlugins: [
      "FontColor",
      "FontBackgroundColor",
    ],
    image: {
      toolbar: [
        "imageTextAlternative",
        "toggleImageCaption",
        "imageStyle:inline",
        "imageStyle:wrapText",
        "imageStyle:breakText",
        "resizeImage"
      ],
    },
    table: {
      contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
    },
  };

  return (
    <div className="ckeditor-wrapper">
      <CKEditor
        editor={ClassicEditor}
        data={value || ""}
        disabled={disabled}
        onReady={handleReady}
        onChange={handleChange}
        onError={handleError}
        config={editorConfig}
      />
      <div
        ref={wordCountRef}
        className="word-count"
        style={{
          marginTop: "8px",
          fontSize: "12px",
          color: "#666",
          textAlign: "right",
        }}
      />
    </div>
  );
};

export default CKEditorComponent;
