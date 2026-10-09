const BASE =
  'block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100';
const OK = 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200';
const BAD = 'border-red-400 focus:border-red-500 focus:ring-red-200';

const fieldClass = (error, className = '') => `${BASE} ${error ? BAD : OK} ${className}`;

export function FormField({ label, htmlFor, error, hint, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({ error, className, ...props }) {
  return <input className={fieldClass(error, className)} aria-invalid={Boolean(error)} {...props} />;
}

export function TextArea({ error, className, ...props }) {
  return <textarea className={fieldClass(error, className)} aria-invalid={Boolean(error)} {...props} />;
}

export function Select({ error, className, children, ...props }) {
  return (
    <select className={fieldClass(error, className)} aria-invalid={Boolean(error)} {...props}>
      {children}
    </select>
  );
}
