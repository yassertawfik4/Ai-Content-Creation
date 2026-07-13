import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const footerLinks = [
  {
    title: 'Product',
    links: ['Features', 'Pricing', 'Integrations', 'Changelog'],
  },
  {
    title: 'Company',
    links: ['About', 'Blog', 'Careers', 'Contact'],
  },
  {
    title: 'Legal',
    links: ['Privacy', 'Terms', 'Security', 'Cookies'],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-[#f5f4f0] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-[#ff6719] shadow-sm">
                <Sparkles className="size-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                Content <span className="text-[#ff6719]">King</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              AI-powered content creation platform. Create professional content
              in seconds.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-foreground">
                {group.title}
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-[#f5f4f0] pt-8 text-center">
          <p className="text-sm text-muted-foreground/60">
            &copy; {new Date().getFullYear()} Content King. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
