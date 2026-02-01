"use client";

import { FeedItem } from "@/components/feed-item";
import { motion } from "framer-motion";

const mockFeedItems = [
  {
    id: 1,
    user: {
      name: "Leonid Domagalsky",
      username: "@leoniddomagalsky",
      avatar: "/user/minipix4.png",
      initials: "LD",
    },
    event: {
      type: "badge-earned" as const,
      title: "Abzeichen freigeschaltet",
      description: 'hat das "Habit Starter" Abzeichen freigeschaltet',
      timestamp: "vor 56 Min.",
      badge: "Habit Starter",
      level: 3,
    },
  },
  {
    id: 2,
    user: {
      name: "Leonid Domagalsky",
      username: "@leoniddomagalsky",
      avatar: "/user/minipix4.png",
      initials: "LD",
    },
    event: {
      type: "level-up" as const,
      title: "Level-Aufstieg",
      description: "hat Level 3 (Engagiert) erreicht",
      timestamp: "vor 57 Min.",
      level: 3,
    },
  },
  {
    id: 3,
    user: {
      name: "Marc",
      username: "@marc",
      avatar: "/user/chibi1.png",
      initials: "M",
    },
    event: {
      type: "badge-earned" as const,
      title: "Abzeichen freigeschaltet",
      description: 'hat das "Erstes Ziel" Abzeichen freigeschaltet',
      timestamp: "vor 1 Std.",
      badge: "Erstes Ziel",
      level: 11,
    },
  },
  {
    id: 4,
    user: {
      name: "Admiral Quackbar",
      username: "@admiralquackbar",
      avatar: "/user/duck.png",
      initials: "AQ",
    },
    event: {
      type: "milestone" as const,
      title: "Meilenstein erreicht",
      description: "feiert 1 Monat auf der Reise",
      timestamp: "vor 2 Std.",
      level: 2,
    },
  },
  {
    id: 5,
    user: {
      name: "Admiral Quackbar",
      username: "@admiralquackbar",
      avatar: "/user/duck.png",
      initials: "AQ",
    },
    event: {
      type: "badge-earned" as const,
      title: "Abzeichen freigeschaltet",
      description: 'hat das "Ein Monat Club" Abzeichen freigeschaltet',
      timestamp: "vor 2 Std.",
      badge: "Ein Monat Club",
      level: 2,
    },
  },
  {
    id: 6,
    user: {
      name: "Admiral Quackbar",
      username: "@admiralquackbar",
      avatar: "/user/duck.png",
      initials: "AQ",
    },
    event: {
      type: "level-up" as const,
      title: "Level-Aufstieg",
      description: "hat Level 2 (Erwacht) erreicht",
      timestamp: "vor 2 Std.",
      level: 2,
    },
  },
  {
    id: 7,
    user: {
      name: "Ibrahim",
      username: "@ibrahimhu098",
      avatar: "/user/chibi2.png",
      initials: "IH",
    },
    event: {
      type: "badge-earned" as const,
      title: "Abzeichen freigeschaltet",
      description: 'hat das "Perfekter Tag" Abzeichen freigeschaltet',
      timestamp: "vor 7 Std.",
      badge: "Perfekter Tag",
      level: 2,
    },
  },
];

export function CommunityFeed() {
  return (
    <div className="space-y-4">
      {/* Today Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Heute
        </h3>
        <div className="grid gap-4">
          {mockFeedItems.slice(0, 6).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <FeedItem user={item.user} event={item.event} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Yesterday Section */}
      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Gestern
        </h3>
        <div className="grid gap-4">
          {mockFeedItems.slice(6).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index + 6) * 0.1 }}
            >
              <FeedItem user={item.user} event={item.event} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
