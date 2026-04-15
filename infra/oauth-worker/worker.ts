export interface Env {
	GITHUB_CLIENT_ID: string;
	GITHUB_CLIENT_SECRET: string;
	ALLOWED_ORIGIN: string;
}

const corsHeaders = (origin: string): HeadersInit => ({
	"Access-Control-Allow-Origin": origin,
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
});

export default {
	async fetch(req: Request, env: Env): Promise<Response> {
		const url = new URL(req.url);
		const cors = corsHeaders(env.ALLOWED_ORIGIN);

		if (req.method === "OPTIONS") {
			return new Response(null, { headers: cors });
		}

		if (url.pathname === "/auth") {
			const state = crypto.randomUUID();
			const authUrl = new URL("https://github.com/login/oauth/authorize");
			authUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
			authUrl.searchParams.set("scope", "repo,user");
			authUrl.searchParams.set("state", state);
			authUrl.searchParams.set("redirect_uri", `${url.origin}/callback`);
			return Response.redirect(authUrl.toString(), 302);
		}

		if (url.pathname === "/callback") {
			const code = url.searchParams.get("code");
			if (!code) return new Response("Missing code", { status: 400 });
			const r = await fetch("https://github.com/login/oauth/access_token", {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					client_id: env.GITHUB_CLIENT_ID,
					client_secret: env.GITHUB_CLIENT_SECRET,
					code,
				}),
			});
			const data = (await r.json()) as { access_token?: string };
			if (!data.access_token)
				return new Response("Token exchange failed", { status: 500 });

			const html = `<!doctype html><html><body><script>
window.opener.postMessage(
  'authorization:github:success:${JSON.stringify({ token: data.access_token })}',
  '${env.ALLOWED_ORIGIN}'
);
window.close();
</script></body></html>`;
			return new Response(html, {
				headers: { "Content-Type": "text/html", ...cors },
			});
		}

		return new Response("Not found", { status: 404, headers: cors });
	},
};
