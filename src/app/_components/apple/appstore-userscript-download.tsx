"use client";

import { useComputedColorScheme } from "@mantine/core";
import Image from "next/image";

export function UserscriptAppStoreButton({ scale = 100 }: { scale?: number }) {
  const darkLight = useComputedColorScheme();

  return (
    <a
      href="https://apps.apple.com/us/app/userscripts/id1463298887?itsct=apps_box_badge&amp;itscg=30200"
      style={{
        display: "inline-block",
        overflow: "hidden",
        borderRadius: `${(scale / 100) * 13}px`,
        width: `${(scale / 100) * 250}px`,
        height: `${(scale / 100) * 83}px`,
      }}
    >
      <Image
        src={`https://apple-resources.s3.amazonaws.com/media-badges/download-on-the-app-store/${darkLight == "light" ? "white" : "black"}/en-us.svg`}
        alt="Download on the App Store"
        width={250}
        height={83}
        style={{
          borderRadius: `${(scale / 100) * 13}px`,
          width: `${(scale / 100) * 250}px`,
          height: `${(scale / 100) * 83}px`,
        }}
      />
    </a>
  );
}

export function UserscriptAppStoreIcon({ size = 64 }: { size?: number }) {
  return (
    <a
      href="https://apps.apple.com/us/app/userscripts/id1463298887?itscg=30200&amp;itsct=apps_box_appicon"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "22%",
        overflow: "hidden",
        display: "inline-block",
        verticalAlign: "middle",
      }}
    >
      <UserscriptIcon size={size} />
    </a>
  );
}

export function UserscriptIcon({
  size = 64,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/15/89/c1/1589c185-d79c-5b60-0bd4-bdaa391f1b41/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/540x540bb.jpg"
      alt="Userscripts"
      width={size}
      height={size}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "22%",
        overflow: "hidden",
        top: "3px",
      }}
    />
  );
}
