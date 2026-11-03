/* The small outbound arrow on links that leave the site (Recognition,
   Certifications, Earlier projects). Sized and spaced in em, so it scales with
   whatever text it sits in; animates with its parent's `group`. Visible at rest
   (not only on hover) because phones can't hover. */
export default function LinkArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="ml-[0.25em] inline-block h-[0.8em] w-[0.8em] shrink-0 align-[-0.05em] opacity-70 transition duration-200 group-hover:translate-x-[0.12em] group-hover:-translate-y-[0.12em] group-hover:opacity-100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  )
}
