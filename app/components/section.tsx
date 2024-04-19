import type { ComponentProps } from "react";
import { cn, tw } from "@peerigon/pupper/tailwind";
import { useString } from "~/i18n";
import { prose } from "~/styles";
import { slc } from "~/utils/components";

const themes = {
	black: tw`bg-black text-white`,
	disrupt: tw`text-md bg-black text-center font-plex-mono tracking-plex-mono text-white lg:text-xl`,
	lime: tw`bg-lime text-black`,
	purple: tw`bg-purple-400 text-black`,
	red: tw`bg-red text-black`,
	teal: tw`bg-teal-300 text-white`,
	white: tw`bg-white text-black`,
};

export const isTheme = (color: string): color is keyof typeof themes =>
	color in themes;

export const Section: React.FC<
	ComponentProps<"div"> & {
		anchor?: string;
		innerClassName?: string;
		theme?: keyof typeof themes;
	}
> = ({
	theme = "red",
	className,
	innerClassName,
	children,
	anchor,
	...rest
}) => {
	const t = useString();
	return (
		<section
			id={anchor}
			className={cn(themes[theme], tw`relative p-8`, className)}
			{...rest}
		>
			{anchor && (
				<a
					className="top-12 mb-4 block w-fit emoji-white xl:sticky xl:-ml-4 xl:mb-0"
					aria-label={t("anchor")}
					href={`#${anchor}`}
				>
					{
						// this comment is here so eslint shuts up
						"⚓"
					}
				</a>
			)}
			<div className={cn(innerClassName, "lg:py-16")}>{children}</div>
		</section>
	);
};

const makeSectionInner = (classNames?: string) =>
	slc("div", cn(tw`m-auto max-w-screen-md`, classNames));

export const SectionInner = makeSectionInner();
export const ProseWrapper = makeSectionInner(cn(prose, "text-white"));
