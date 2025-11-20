import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

/**
 * NavBar Component - Tubelight style navigation bar with full-width rectangular design
 * @param {Object} props
 * @param {Array} props.items - Array of navigation items with name, url, and icon
 * @param {string} props.className - Additional CSS classes
 */
export function NavBar({ items, className }) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(items[0]?.name || "");

  // Update active tab based on current route
  useEffect(() => {
    const currentItem = items.find(item => {
      if (item.url === "/") {
        return location.pathname === "/";
      }
      return location.pathname.startsWith(item.url);
    });
    if (currentItem) {
      setActiveTab(currentItem.name);
    }
  }, [location.pathname, items]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "sticky top-16 z-30 w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-border shadow-sm",
        className,
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-center sm:justify-start gap-1 h-14 bg-background/5 rounded-lg px-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;

            return (
              <Link
                key={item.name}
                to={item.url}
                onClick={() => setActiveTab(item.name)}
                className={cn(
                  "relative cursor-pointer text-sm font-semibold px-6 py-3 rounded-lg transition-colors z-10",
                  "text-foreground/80 hover:text-primary",
                  isActive && "text-primary",
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon size={18} strokeWidth={2.5} />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="lamp"
                    className="absolute inset-0 w-full bg-primary/10 rounded-lg -z-10"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    {/* Tubelight glow effect at the top */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                      <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                      <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                      <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                    </div>
                  </motion.div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
