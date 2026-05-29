import React, { useMemo } from 'react';
import DOMPurify from 'isomorphic-dompurify';

type RichHtmlRendererProps = {
  html?: string | null;
  className?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function isProbablyHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function normalizeContent(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  if (isProbablyHtml(trimmed)) {
    return trimmed;
  }

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll('\n', '<br>')}</p>`)
    .join('');
}

export default function RichHtmlRenderer({
  html,
  className = '',
}: RichHtmlRendererProps) {
  const safeHtml = useMemo(() => {
    const normalizedHtml = normalizeContent(html || '');

    return DOMPurify.sanitize(normalizedHtml, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'b',
        'em',
        'i',
        'u',
        's',
        'h2',
        'h3',
        'h4',
        'ul',
        'ol',
        'li',
        'a',
        'blockquote',
        'span',
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'style'],
    });
  }, [html]);

  if (!safeHtml) {
    return null;
  }

  return (
    <div
      className={`rich-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}