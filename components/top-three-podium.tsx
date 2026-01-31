import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PointsChip } from "@/components/points-chip"
import { Trophy, Medal, Award } from "lucide-react"
import { cn } from "@/lib/utils"

interface TopUser {
  name: string
  avatar?: string
  initials: string
  points: number
  team?: string
}

interface TopThreePodiumProps {
  first: TopUser
  second: TopUser
  third: TopUser
  className?: string
}

export function TopThreePodium({ first, second, third, className }: TopThreePodiumProps) {
  return (
    <div className={cn("flex items-end justify-center gap-4", className)}>
      {/* Second Place */}
      <div className="flex flex-col items-center">
        <Avatar className="h-16 w-16 border-2 border-zinc-400">
          <AvatarImage src={second.avatar || "/placeholder.svg"} alt={second.name} />
          <AvatarFallback className="text-lg">{second.initials}</AvatarFallback>
        </Avatar>
        <div className="mt-2 text-center">
          <p className="font-semibold">{second.name}</p>
          <PointsChip points={second.points} size="sm" />
        </div>
        <div className="mt-3 flex h-24 w-24 flex-col items-center justify-start rounded-t-lg bg-zinc-400/20 pt-4">
          <Medal className="h-8 w-8 text-zinc-400" />
          <span className="mt-1 text-2xl font-bold text-zinc-400">2</span>
        </div>
      </div>

      {/* First Place */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <Avatar className="h-20 w-20 border-2 border-amber-500">
            <AvatarImage src={first.avatar || "/placeholder.svg"} alt={first.name} />
            <AvatarFallback className="text-xl">{first.initials}</AvatarFallback>
          </Avatar>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
            <Trophy className="h-6 w-6 text-amber-500" />
          </div>
        </div>
        <div className="mt-2 text-center">
          <p className="font-semibold">{first.name}</p>
          <PointsChip points={first.points} size="sm" variant="highlight" />
        </div>
        <div className="mt-3 flex h-32 w-24 flex-col items-center justify-start rounded-t-lg bg-amber-500/20 pt-4">
          <Trophy className="h-8 w-8 text-amber-500" />
          <span className="mt-1 text-2xl font-bold text-amber-500">1</span>
        </div>
      </div>

      {/* Third Place */}
      <div className="flex flex-col items-center">
        <Avatar className="h-16 w-16 border-2 border-amber-700">
          <AvatarImage src={third.avatar || "/placeholder.svg"} alt={third.name} />
          <AvatarFallback className="text-lg">{third.initials}</AvatarFallback>
        </Avatar>
        <div className="mt-2 text-center">
          <p className="font-semibold">{third.name}</p>
          <PointsChip points={third.points} size="sm" />
        </div>
        <div className="mt-3 flex h-16 w-24 flex-col items-center justify-start rounded-t-lg bg-amber-700/20 pt-2">
          <Award className="h-6 w-6 text-amber-700" />
          <span className="text-xl font-bold text-amber-700">3</span>
        </div>
      </div>
    </div>
  )
}
