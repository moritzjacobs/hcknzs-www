import { Link } from "@remix-run/react";
import { Section } from "./misc";
import { Noise } from "./noise";
import { tw } from "~/utils/tailwind";
import { useLocale, usePipedString, useString } from "~/i18n";

const LocaleSwitcher = () => {
	const locale = useLocale();
	const t = useString();
	const to = locale === "de" ? "/en" : "/";
	const otherLocale = locale === "de" ? "EN" : "DE";

	return (
		<div className="font-plex-mono font-bold flex gap-4 absolute top-4 right-4">
			<span className="sr-only">{t("switch-language")}</span>
			<Link className="text-white" to={to}>
				{otherLocale}
			</Link>
		</div>
	);
};

export const IntroSection = () => {
	const t = useString();
	const p = usePipedString();

	return (
		<Section
			color="red"
			className={tw`flex-1 flex`}
			innerClassName={tw`mt-0 mb-0 w-full flex flex-col gap-8 lg:gap-16 items-center justify-center`}
		>
			<a
				href="#intro"
				className="w-32 lg:w-52"
				aria-label={t("scroll-to-bottom")}
			>
				<img src="/logo.svg" alt="hcknzs" className="m-auto block" />
				<span aria-hidden="true" className="absolute inset-0" />
			</a>

			<p className="text-white font-plex-mono tracking-plex-mono text-sm lg:text-xl text-center">
				{p("subline")}
			</p>
			<p className="text-lime font-plex-mono tracking-plex-mono text-sm lg:text-md text-center">
				{p("date-location")}
			</p>
			<Noise className="text-lime" opacity={0.7} busyness={40} />

			<LocaleSwitcher />
		</Section>
	);
};
