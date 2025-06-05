import parse, { HTMLReactParserOptions, DOMNode } from "html-react-parser";
import { Element as DomElement } from "domhandler";
import { ReactNode } from "react";

/**
 * Configuration options for HTML parsing
 */
interface ParseHtmlOptions {
  /** Whether to allow dangerous HTML elements (script, iframe, etc.) */
  allowDangerous?: boolean;
  /** Custom class names to apply to parsed elements */
  className?: string;
  /** Maximum length of text content to parse */
  maxLength?: number;
}

/**
 * Safely parse HTML string into React components
 * @param htmlString - The HTML string to parse
 * @param options - Parsing configuration options
 * @returns React components or null if no content
 */
export function parseHtml(
  htmlString: string | undefined | null,
  options: ParseHtmlOptions = {}
): ReactNode {
  if (!htmlString || htmlString.trim() === "") {
    return null;
  }

  const { allowDangerous = false, className = "", maxLength } = options;

  let processedHtml = htmlString;

  // Prefer truncating text, not raw HTML
  if (maxLength) {
    const plainText = stripHtml(processedHtml);
    if (plainText.length > maxLength) {
      processedHtml = plainText.substring(0, maxLength).trim() + "...";
    }
  }

  const parserOptions: HTMLReactParserOptions = {
    replace: (domNode: DOMNode) => {
      if ((domNode as DomElement).type === "tag") {
        const element = domNode as DomElement;
        const { name, attribs = {} } = element;

        // Filter out dangerous tags
        if (!allowDangerous) {
          const blockedTags = [
            "script",
            "iframe",
            "object",
            "embed",
            "form",
            "input",
            "button",
            "link",
            "meta",
          ];
          if (blockedTags.includes(name)) {
            return <></>;
          }
        }

        // Strip dangerous attributes
        const dangerousAttribs = [
          "onclick",
          "onload",
          "onerror",
          "onmouseover",
          "onfocus",
          "onblur",
          "onchange",
          "onsubmit",
        ];

        dangerousAttribs.forEach((attr) => {
          delete attribs[attr];
        });

        // Merge className if needed
        if (className) {
          attribs.class = attribs.class
            ? `${attribs.class} ${className}`
            : className;
        }

        // Assign cleaned attribs back
        element.attribs = attribs;

        // Let html-react-parser handle the rendering
        return undefined;
      }
    },
  };

  try {
    return parse(processedHtml, parserOptions);
  } catch (error) {
    console.error("Error parsing HTML:", error);
    return stripHtml(htmlString); // fallback to plain text
  }
}

/**
 * Parse HTML with basic styling for rich text content
 */
export function parseRichText(
  htmlString: string | undefined | null
): ReactNode {
  if (!htmlString || htmlString.trim() === "") {
    return null;
  }

  // Clean up the HTML to prevent nesting issues
  let cleanedHtml = htmlString;

  // Ensure we don't have nested block elements that could cause hydration issues
  cleanedHtml = cleanedHtml.replace(
    /<p>\s*<(h[1-6]|div|section|article)/gi,
    "<$1"
  );
  cleanedHtml = cleanedHtml.replace(
    /<\/(h[1-6]|div|section|article)>\s*<\/p>/gi,
    "</$1>"
  );

  return parseHtml(cleanedHtml, {
    className:
      "prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground",
    allowDangerous: false,
  });
}

/**
 * Strip all HTML tags and return plain text
 */
export function stripHtml(htmlString: string | undefined | null): string {
  if (!htmlString) return "";

  try {
    const stripped = htmlString.replace(/<[^>]*>/g, "");
    const textarea = document.createElement("textarea");
    textarea.innerHTML = stripped;
    return textarea.value;
  } catch (error) {
    console.error("Error stripping HTML:", error);
    return htmlString;
  }
}

/**
 * Get a plain text preview of HTML content with optional length limit
 */
export function getTextPreview(
  htmlString: string | undefined | null,
  maxLength: number = 150
): string {
  const plainText = stripHtml(htmlString);
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength).trim() + "...";
}
