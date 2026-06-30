import { useEffect, useRef } from "react"

export function useScrollReveal(deps = []) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const hijos = Array.from(container.children)
    if (hijos.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-reveal-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )

    hijos.forEach((el, i) => {
      el.classList.add('scroll-reveal')
      el.style.transitionDelay = `${Math.min(i % 8, 7) * 60}ms`
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, deps)

  return containerRef
}