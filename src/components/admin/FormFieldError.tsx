type FormFieldErrorProps = {
  errors?: string[] | string | null;
};

export default function FormFieldError({
  errors,
}: FormFieldErrorProps) {
  const messages = Array.isArray(errors)
    ? errors.filter(Boolean)
    : errors
      ? [errors]
      : [];

  if (messages.length === 0) {
    return null;
  }

  return (
    <div
      className="mt-1 space-y-1"
      role="alert"
      aria-live="polite"
    >
      {messages.map((message, index) => (
        <p
          key={`${message}-${index}`}
          className="!m-0 !text-sm !font-medium !text-rose-600"
        >
          {message}
        </p>
      ))}
    </div>
  );
}