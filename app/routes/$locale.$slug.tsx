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
import { pageQuery } from "~/queries";
import { SectionRenderer } from "~/components/section-renderer";
import { getLocaleFromParams } from "~/utils/i18n-ssr";

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
	const locale = getLocaleFromParams(params);
	const slug = params.slug ?? "index";

	const { page } = await fetchFromCms({
		query: pageQuery,
		variables: { locale, slug },
	});

	if (!page) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}

	return { locale, page, slugs: slug };
};

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
	const { page } = useLoaderData<typeof loader>();

	return (
		<main>
			{}
			<h1 className="sr-only">hcknzs</h1>
			<HxBoundary>
				{/* TODO */}
				<SectionRenderer sections={page.content as any} />

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
								className="w-auto h-6 align-middle relative top-[0.3em]"
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