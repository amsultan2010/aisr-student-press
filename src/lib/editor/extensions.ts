import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

// The single source of truth for the article body schema. The dashboard editor
// and the server renderer must use the same list, or content will not round-trip.
export const articleExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    codeBlock: false,
    code: false,
    link: {
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { rel: "noopener noreferrer" },
    },
  }),
  Image.configure({ inline: false, allowBase64: false }),
];
