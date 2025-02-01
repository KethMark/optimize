import { Icon } from "../ui/icon";

export default function LogoCloud() {
  return (
    <section
      id="logo cloud"
      aria-label="Company Icon"
      className="mt-24 flex animate-slide-up-fade flex-col items-center justify-center gap-y-6 text-center sm:mt-32"
      style={{ animationDuration: "1500ms" }}
    >
      <p className="text-lg font-medium tracking-tighter text-gray-800 dark:text-gray-200">
        Optimize is built with powerful industry-leading technologies
      </p>
      <div className="grid grid-cols-2 gap-10 gap-y-4 text-gray-900 md:grid-cols-4 md:gap-x-20 dark:text-gray-200">
        <Icon.Nextjs className="w-28" />
        <Icon.Groq className="w-28" />
        <Icon.shadcnui className="w-28" />
        <Icon.Cohere className="w-28" />
      </div>
    </section>
  )
}
