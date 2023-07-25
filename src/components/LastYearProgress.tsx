import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { api } from "~/utils/api";
import { areDatesSame } from "~/lib/utils";
// import { Tracking } from "@prisma/client";
function getColor(count: number, highestCount: number, color: string): string {
    const x = count / highestCount;
    if (x == 0) {
        return "bg-white"
    }
    else if (x <= .2) {
        return `bg-${color}-300`
    } else if (x <= .4) {
        return `bg-${color}-400`
    } else if (x <= .6) {
        return `bg-${color}-500`
    } else if (x <= 0.8) {
        return `bg-${color}-600`
    } else {
        return `bg-${color}-700`
    }
}

const LastYearProgress = () => {
    const gethabit = api.habit.getall.useQuery();
    if (gethabit.isFetching) {
        <div>Loading</div>
    }
    const allTracking = gethabit.data?.flatMap((habit) => habit.Completed)
    const completedCountByDay = new Map<string, number>();

    // Use forEach() to count the completed items for each day
    if (allTracking) {

        allTracking.forEach((tracking) => {
            const { date, completed } = tracking;
            if (completed) {
                const completedCount = completedCountByDay.get(date.toDateString()) ?? 0;
                completedCountByDay.set(date.toDateString(), completedCount + 1);
            }
        });
    }

    const highestCount = Math.max(...completedCountByDay.values())

    const [dates, setDates] = useState<Date[]>([])
    useEffect(() => {
        const today = new Date();
        const pastYearDates = [];

        // Loop through each day of the past year
        for (let i = 365; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            pastYearDates.push(date);
        }

        setDates(pastYearDates);
    }, [])
    return (
        <TooltipProvider >
            < div className="grid grid-rows-7 grid-flow-col gap-1">

                {dates.map((date) => {
                    const dayTraking = allTracking?.filter((t) => areDatesSame(date, t.date));
                    const count = dayTraking?.filter(t => t.completed == true).length ?? 0
                    return <Tooltip key={date.toISOString()} >
                        <TooltipTrigger className={`w-3 h-3 rounded-sm  ${getColor(count, highestCount, "green")} `}></TooltipTrigger>
                        <TooltipContent className="">{`${date.toDateString()} - ${count} commits`}</TooltipContent>
                    </Tooltip>
                })
                }
            </div>
        </TooltipProvider >
    );

}

export default LastYearProgress;