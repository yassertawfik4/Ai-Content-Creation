import { Fragment } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  show: ({ delay, stagger }) => ({
    transition: {
      delayChildren: delay,
      staggerChildren: stagger,
    },
  }),
}

const characterVariants = {
  hidden: { opacity: 0, y: '0.12em' },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.12, ease: 'easeOut' },
  },
}

export function AnimatedText({
  text,
  delay = 0,
  stagger = 0.025,
  trigger = 'view',
}) {
  const prefersReducedMotion = useReducedMotion()
  const startsOnMount = trigger === 'mount'

  return (
    <motion.span
      aria-label={text.replaceAll('\n', ' ')}
      custom={{ delay, stagger }}
      variants={containerVariants}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate={startsOnMount ? 'show' : undefined}
      whileInView={startsOnMount ? undefined : 'show'}
      viewport={{ once: true, amount: 0.35 }}
    >
      {text.split('\n').map((line, lineIndex, lines) => (
        <Fragment key={`${line}-${lineIndex}`}>
          {line.split(' ').map((word, wordIndex, words) => (
            <Fragment key={`${word}-${wordIndex}`}>
              <span aria-hidden="true" className="inline-block whitespace-nowrap">
                {Array.from(word, (character, characterIndex) => (
                  <motion.span
                    key={`${character}-${characterIndex}`}
                    variants={characterVariants}
                    className="inline-block"
                  >
                    {character}
                  </motion.span>
                ))}
              </span>
              {wordIndex < words.length - 1 ? ' ' : null}
            </Fragment>
          ))}
          {lineIndex < lines.length - 1 ? <br aria-hidden="true" /> : null}
        </Fragment>
      ))}
    </motion.span>
  )
}
