"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon } from "lucide-react"
import styles from "./tubelight.module.css"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  activeItem?: string
}

export function NavBar({ items, className, activeItem }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(activeItem || items[0].name)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (pathname) {
      const exactMatch = items.find(item => item.url === pathname);
      if (exactMatch) {
        setActiveTab(exactMatch.name);
        return;
      }
      
      // Match nested routes like /cursos/[id], ignoring root '/' for partial matches
      const partialMatch = items.find(item => item.url !== '/' && pathname.startsWith(item.url));
      if (partialMatch) {
        setActiveTab(partialMatch.name);
      } else {
        // If no match is found, we might want to unset it or keep the first one
        // If we want it to unset when not on a known page:
        // setActiveTab("");
        // But for now keeping the previous tab or default is fine.
      }
    }
  }, [pathname, items])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className={`${className} w-full`} style={{ position: 'relative', zIndex: 50, width: '100%' }}>
      <div className={styles.navContainer}>
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.navItemText}>{item.name}</span>
              <span className={styles.navItemIcon}>
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className={styles.activeBg}
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className={styles.activeTopBar}>
                    <div className={styles.glow1} />
                    <div className={styles.glow2} />
                    <div className={styles.glow3} />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
