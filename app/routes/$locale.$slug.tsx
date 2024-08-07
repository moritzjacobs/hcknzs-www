import invariant from "tiny-invariant";
import { HxBoundary } from "uberschrift";
import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { toRemixMeta } from "react-datocms/seo";
import type { ServerRuntimeMetaArgs } from "@remix-run/server-runtime";
import { useLoaderData } from "@remix-run/react";
import { ProseWrapper, SectionInner } from "~/components/section";
import { env } from "~/env";
import { fetchFromCms } from "~/utils/cms";
import {
	SectionType,
	pageContentFragment,
	siteSettingsFragment,
} from "~/fragments";
import { SectionRenderer } from "~/components/section-renderer";
import { getLocaleFromParams } from "~/utils/loader-fns";
import { Locale, StringProvider, useString } from "~/i18n";
import { FundingSection } from "~/components/funding-section";
import { Navigation } from "~/components/navigation";
import { normalizeSiteSettings } from "~/utils/normalize";
import { graphql, readFragment } from "~/graphql";

const resolveReferencePageSections = async (
	sections: Array<SectionType>,
	locale: Locale,
	depth = 0,
): Promise<Array<SectionType>> => {
	if (depth > 3) {
		throw new Error("Too many nested references (max 3)");
	}

	const promises = sections.map(async (section) => {
		if (section.__typename === "ReferencePageSectionCollectionRecord") {
			const pageId = section.page.id;

			const { page: pageRaw } = await fetchFromCms({
				query: graphql(
					`
						query GetPageByIdAndLocale(
							$id: ItemId!
							$locale: SiteLocale!
						) {
							page(
								locale: $locale
								fallbackLocales: [de]
								filter: { id: { eq: $id } }
							) {
								...PageContent
							}
						}
					`,
					[pageContentFragment],
				),
				variables: { id: pageId, locale },
			});

			const page = readFragment(pageContentFragment, pageRaw);

			if (!page) {
				return [];
			}

			page.content = await resolveReferencePageSections(
				page.content,
				locale,
				depth + 1,
			);

			return page.content;
		}

		return section;
	});

	return (await Promise.all(promises)).flat();
};

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
	const locale = getLocaleFromParams(params);
	const slug = params.slug ?? "index";

	const query = graphql(
		`
			query GetPageBySlugAndLocale($slug: String!, $locale: SiteLocale!) {
				settings: settingsModel(locale: $locale) {
					...SiteSettings
				}
				page(
					locale: $locale
					fallbackLocales: [de]
					filter: { urlSlug: { eq: $slug } }
				) {
					...PageContent
				}
			}
		`,
		[pageContentFragment, siteSettingsFragment],
	);

	const fetched = await fetchFromCms({
		query,
		variables: { locale, slug },
	});

	if (!fetched.page) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}

	if (!fetched.settings) {
		throw new Response(null, {
			status: 500,
			statusText: "Page settings not found, that's weird…",
		});
	}
	const page = readFragment(pageContentFragment, fetched.page);
	const settings = readFragment(siteSettingsFragment, fetched.settings);

	const content = await resolveReferencePageSections(page.content, locale);

	return {
		locale,
		page: { ...page, content },
		...normalizeSiteSettings(settings, locale),
		slugs: slug,
	};
};

export type Loader = typeof loader;

export const meta = ({ data }: ServerRuntimeMetaArgs<typeof loader>) => {
	try {
		invariant(data, "No loader data?");
		invariant(data.page, "No page data");
		invariant(data.page.seo, "No page SEO data");

		// @ts-expect-error not sure why…
		return toRemixMeta(data.page.seo);
	} catch (error) {
		return [];
	}
};

const PageComponent = () => {
	const t = useString();
	const { page, locale } = useLoaderData<typeof loader>();

	return (
		<StringProvider locale={locale}>
			<Navigation />
			<main>
				{/* eslint-disable-next-line react/jsx-no-literals */}
				<h1 className="sr-only">hcknzs</h1>
				<HxBoundary>
					{/* @ts-expect-error This is a Remix/TS issue, maybe this one: https://github.com/remix-run/remix/issues/7599 */}
					<SectionRenderer sections={page.content} />

					<footer className="flex flex-col bg-red py-8 text-black lg:py-24">
						<SectionInner className="py-6">
							<a
								href="#intro"
								className="inline-block"
								aria-label="Nach oben scrollen"
							>
								<img
									src="/signet.svg"
									alt="hcknzs"
									className="relative top-[0.3em] h-6 w-auto align-middle"
								/>
							</a>
							<span className="ml-3 font-plex-mono text-2xl tracking-plex-mono text-lime">
								{new Date().getFullYear()}
							</span>
						</SectionInner>
						<ProseWrapper>
							<a
								href="https://bluespotsproductions.de/impressum"
								target="_blank"
								rel="noreferrer"
								className="block text-center font-plex-mono tracking-plex-mono !text-black"
							>
								{t("footer.legal")}

								<img
									src="/bsp.svg"
									alt="Bluespots productions logo"
									className="m-auto mt-10 block h-auto w-48"
								/>
							</a>
						</ProseWrapper>
					</footer>
					<FundingSection />
				</HxBoundary>
			</main>
		</StringProvider>
	);
};

export default PageComponent;

export const action: ActionFunction = async ({ request }) => {
	try {
		const newsletterUrl = env.BREVO_API_URL;
		const newsletterKey = env.BREVO_API_KEY;

		invariant(newsletterKey, "No Brevo key provided");
		invariant(newsletterUrl, "No Brevo URL provided");

		const formData = await request.formData();
		const email = formData.get("email");

		invariant(email, "No email provided");

		const response = await fetch(newsletterUrl, {
			body: JSON.stringify({
				email,
				includeListIds: [5],
				redirectionUrl: "https://www.hcknzs.com/subscribed",
				templateId: 1,
			}),
			headers: {
				accept: "application/json",
				"api-key": newsletterKey,
				"content-type": "application/json",
			},
			method: "POST",
		});

		const result = await response.json();

		if (!response.ok) {
			throw new Error(
				`Something went wrong on the other end: ${JSON.stringify(result, null, 2)}`,
			);
		}

		return json({ error: null, isSuccess: true });
	} catch (error) {
		if (!(error instanceof Error)) {
			throw new Error("Unknown error");
		}

		return json(
			{
				error: error.message,
				isSuccess: false,
			},
			{ status: 400 },
		);
	}
};

export type ActionData = { error: string | null; isSuccess: boolean };
