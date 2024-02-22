"use client";

import { Button, Group } from "@mantine/core";
import moment from "moment";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";

export function DayNavigation() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  let date = moment();

  if (searchParams) {
    const searchParamsDate = searchParams.get("date");
    if (searchParamsDate) {
      date = moment(searchParamsDate);
    }
  }

  return (
    <Group>
      <Button
        onClick={() => {
          const newPath = `${pathname}?date=${moment(date).subtract(1, "day").format("YYYY-MM-DD")}`;
          router.push(newPath);
        }}
      >
        Previous Day
      </Button>
      <Button
        onClick={() => {
          const newPath = pathname ?? "";
          router.push(newPath);
        }}
      >
        To Day
      </Button>
      <Button
        onClick={() => {
          const newPath = `${pathname}?date=${moment(date).add(1, "day").format("YYYY-MM-DD")}`;
          router.push(newPath);
        }}
      >
        Next Day
      </Button>
    </Group>
  );
}
