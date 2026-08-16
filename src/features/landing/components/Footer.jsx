import { Link } from 'react-router-dom'
import { AppLogo } from '@/components/AppLogo'
import { TwitterIcon, LinkedinIcon } from './BrandIcons'

const footerLinks = [
  {
    title: 'PLATFORM',
    links: ['Agents', 'Workflows', 'Integrations'],
  },
  {
    title: 'COMPANY',
    links: ['About Us', 'Careers', 'Blog'],
  },
  {
    title: 'LEGAL',
    links: ['Privacy Policy', 'Terms of Service'],
  },
]

export function Footer() {
  return (
    <footer className="bg-[#fef7ff]">
      <div className="mx-auto max-w-[1280px] border-t border-[#cbc4d2]/50 px-6 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-[320px]">
            <Link to="/" className="flex items-center gap-2">
              <AppLogo size="sm" />
              <span className="text-2xl font-bold tracking-tight text-[#1d1b20]">
                Sada
              </span>
            </Link>
            <p className="mt-6 text-sm leading-relaxed text-[#494551]">
              Orchestrating marketing with machine precision and creative
              excellence.
            </p>
            <div className="mt-6 flex gap-4">
              {[TwitterIcon, LinkedinIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex size-10 items-center justify-center rounded-full bg-[#e8def9] text-[#4f378a] transition-colors hover:bg-[#4f378a] hover:text-white"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold tracking-wider text-[#686177]">
                {group.title}
              </h3>
              <ul className="mt-6 flex flex-col gap-4">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[#494551] transition-colors hover:text-[#381e72]"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-[#cbc4d2]/50 pt-8">
          <p className="text-sm text-[#686177]">
            &copy; {new Date().getFullYear()} Sada. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
