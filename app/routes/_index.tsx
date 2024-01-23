import { MetaFunction } from "@remix-run/react";
import { HxBoundary } from "uberschrift";
import Intro from "../components/content/intro.mdx";
import What from "../components/content/what.mdx";
import Topics from "../components/content/topics.mdx";
import { Noise } from "../components/noise";
import { ProseWrapper, Section, SectionInner } from "~/components/misc";
import { NewsletterSection } from "~/components/newsletter-section";

export const meta: MetaFunction = () => {
	return [
		{ title: "hcknzs — Hackathon und Ideenfestival gegen Rechts" },
		{
			content: "Hackathon und Ideenfestival gegen Rechts",
			name: "description",
		},
	];
};

const Index = () => {
	return (
		<main className="">
			<h1 className="sr-only">hcknzs</h1>
			<HxBoundary>
				<div className="flex flex-col min-h-screen">
					<Section
						color="red"
						className="flex-1 flex flex-col gap-8 lg:gap-16 items-center justify-center"
					>
						<a
							href="#intro"
							className="w-56"
							aria-label="Nach unten scrollen"
						>
							<img
								src="/logo.svg"
								alt="hcknzs"
								className="m-auto block"
							/>
							<span
								aria-hidden="true"
								className="absolute inset-0"
							/>
						</a>

						<p className="text-white font-plex-mono tracking-plex-mono text-xl text-center">
							Hackathon und Ideenfestival
							<br className="hidden sm:inline" /> für neue
							Protestformen
						</p>
						<p className="text-lime font-plex-mono tracking-plex-mono text-md text-center">
							19.—21. Juli 2024
							<br />@ Schwabencenter Augsburg
						</p>
						<Noise
							className="text-lime"
							opacity={0.7}
							busyness={40}
						/>
					</Section>
					<Section color="black" id="intro">
						<p className="font-plex-mono tracking-plex-mono text-xl text-center cursor">
							Findest Du nicht auch, 2024 ist ein gutes Jahr, um
							einfach mal die Schnauze voll zu haben?
						</p>
					</Section>
				</div>
				<Section color="purple">
					<ProseWrapper>
						<Intro />
					</ProseWrapper>
				</Section>
				<NewsletterSection />
				<Section color="teal">
					<ProseWrapper>
						<What />
						<Noise busyness={7} />
					</ProseWrapper>
				</Section>
				<Section color="black">
					<ProseWrapper>
						<Topics />
					</ProseWrapper>
				</Section>
				<NewsletterSection />
				<footer className="py-8 lg:py-24 flex flex-col bg-red text-black">
					<SectionInner className="py-6">
						<a
							href="#intro"
							className="inline-block"
							aria-label="Nach oben scrollen"
						>
							<img
								src="/signet.svg"
								alt="hcknzs"
								className="w-auto h-5 align-middle relative top-[0.2em]"
							/>
						</a>
						<span className="font-plex-mono tracking-plex-mono text-lime ml-3 text-2xl">
							{new Date().getFullYear()}
						</span>
					</SectionInner>
					<ProseWrapper>
						<a
							href="https://bluespotsproductions.de/impressum"
							target="_blank"
							rel="noreferrer"
							className="font-plex-mono tracking-plex-mono"
						>
							Impressum & Datenschutz
						</a>
					</ProseWrapper>
				</footer>
			</HxBoundary>
		</main>
	);
};

export default Index;
